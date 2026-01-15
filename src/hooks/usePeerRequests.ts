import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface PeerRequest {
    id: any;
    user_id?: string;
    title: string;
    description: string;
    subject: string;
    bounty: number;
    status: 'active' | 'closed';
    views: number;
    viewedBy?: string[];
    submittedNotes: any[];
    createdAt: string;
    target_audience?: string;
    target_user?: string | null;
}

export function usePeerRequests() {
    const { user } = useAuth();
    const [myRequests, setMyRequests] = useState<PeerRequest[]>([]);
    const [marketRequests, setMarketRequests] = useState<PeerRequest[]>([]);
    const [loading, setLoading] = useState(false);

    // Helper to check if user is a real Supabase user (UUID)
    const isRealUser = user && user.id && user.id.length === 36;
    const isDemoUser = user?.email === "demo@noteverse.edu";

    useEffect(() => {
        if (!user) {
            setMyRequests([]);
            setMarketRequests([]);
            return;
        }

        if (isRealUser) {
            fetchSupabaseRequests();
            fetchMarketRequests();
        } else {
            loadLocalRequests();
        }
    }, [user]);

    const loadLocalRequests = () => {
        const key = `noteverse_my_requests_${user!.id}`;
        const saved = localStorage.getItem(key);

        if (saved) {
            setMyRequests(JSON.parse(saved));
        } else if (isDemoUser) {
            // Mock Data for Demo User
            const demoMockRequest: PeerRequest = {
                id: 101,
                title: "Need help with Fluid Dynamics",
                description: "Struggling with Navier-Stokes equations.",
                subject: "Physics",
                bounty: 200,
                status: "active",
                views: 12,
                viewedBy: ["alex.t@uni.ac.ik", "david.k@college.edu"],
                submittedNotes: [
                    { id: 991, title: "Fluid Dynamics Basics.pdf", author: "alex.t@uni.ac.ik", previewUrl: "https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/examples/learning/helloworld.pdf" }
                ],
                createdAt: "2 days ago"
            };
            setMyRequests([demoMockRequest]);
            localStorage.setItem(key, JSON.stringify([demoMockRequest]));
        } else {
            setMyRequests([]);
        }
    };

    const fetchSupabaseRequests = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('peer_requests' as any)
                .select('*')
                .eq('user_id', user!.id)
                .order('created_at', { ascending: false });

            if (error) throw error;

            const mapped = (data || []).map((r: any) => ({
                ...r,
                submittedNotes: r.submitted_notes || [],
                createdAt: new Date(r.created_at).toLocaleDateString()
            }));
            setMyRequests(mapped);
        } catch (error) {
            console.error("Error fetching requests:", error);
            // Fallback to local if fetch fails (e.g. table doesn't exist yet)
            loadLocalRequests();
            toast.error("Could not sync with cloud. Using local storage.");
        } finally {
            setLoading(false);
        }
    };

    const fetchMarketRequests = async () => {
        try {
            const myId = user!.id;
            const myName = (user!.user_metadata?.display_name || "").toLowerCase();
            const myEmail = (user!.email || "").toLowerCase();

            // Fetch ALL active requests not by me
            // Filtering strictly in DB for "OR" conditions with strings can be fragile
            const { data: marketData, error: marketError } = await supabase
                .from('peer_requests' as any)
                .select('*')
                .neq('user_id', myId)
                .eq('status', 'active')
                .order('created_at', { ascending: false });

            if (marketError) {
                console.error("Market fetch error", marketError);
                return;
            }

            // Filter locally for targeted requests to ensure accurate matching
            const filteredMarket = (marketData || []).filter((r: any) => {
                const targetPublic = !r.target_audience || r.target_audience === 'public';
                if (targetPublic) return true;

                // Private targeting check
                const target = (r.target_user || "").toLowerCase();
                return target === myId.toLowerCase() ||
                    target === myName ||
                    target === myEmail;
            });

            const mappedMarket = filteredMarket.map((r: any) => ({
                ...r,
                submittedNotes: r.submitted_notes || [],
                createdAt: new Date(r.created_at).toLocaleDateString()
            }));
            setMarketRequests(mappedMarket);

        } catch (e) {
            console.error("Error fetching market requests", e);
        }
    };

    const createRequest = async (requestData: Partial<PeerRequest>) => {
        if (!user) return;

        if (isRealUser) {
            // Optimistic Update
            const optimisticReq = {
                ...requestData,
                id: crypto.randomUUID(),
                user_id: user.id,
                created_at: new Date().toISOString(),
                submitted_notes: []
            } as any;

            const newLocal = {
                ...requestData,
                id: optimisticReq.id,
                submittedNotes: [],
                createdAt: "Just now"
            } as PeerRequest;

            setMyRequests(prev => [newLocal, ...prev]);

            // DB Insert
            const { error } = await supabase.from('peer_requests' as any).insert({
                user_id: user.id,
                title: requestData.title,
                description: requestData.description,
                subject: requestData.subject,
                bounty: requestData.bounty,
                status: requestData.status || 'active',
                views: 0,
                target_audience: requestData.target_audience || 'public',
                target_user: requestData.target_user,
                submitted_notes: []
            });

            if (error) {
                console.error("Insert error:", error);
                toast.error("Failed to save request to server.");
                // Revert or keep as local unsaved?
            }
        } else {
            // Local Storage Logic
            const newReq = { ...requestData, id: Date.now() } as PeerRequest;
            const updated = [newReq, ...myRequests];
            setMyRequests(updated);
            localStorage.setItem(`noteverse_my_requests_${user.id}`, JSON.stringify(updated));
        }
    };

    const updateRequestData = async (reqId: any, updates: Partial<PeerRequest>) => {
        // Determine if it's a real user request (UUID) or local (Timestamp/Number)
        const isLocalId = typeof reqId === 'number';

        const updatedList = myRequests.map(r => r.id === reqId ? { ...r, ...updates } : r);
        setMyRequests(updatedList);

        if (isRealUser && !isLocalId) {
            // Map updates to snake_case for DB
            const dbUpdates: any = {};
            if (updates.status) dbUpdates.status = updates.status;
            if (updates.submittedNotes) dbUpdates.submitted_notes = updates.submittedNotes;

            const { error } = await supabase
                .from('peer_requests' as any)
                .update(dbUpdates)
                .eq('id', reqId);

            if (error) console.error("Update error", error);
        } else {
            // Save to local
            localStorage.setItem(`noteverse_my_requests_${user!.id}`, JSON.stringify(updatedList));
        }
    };

    const seedDemoRequests = async () => {
        if (!user || !isRealUser) return;

        const demos = [
            {
                title: "Advanced Calculus II - Week 4 Notes",
                description: "Desperately need detailed notes on Multivariable Limits and Continuity. My professor moved too fast through the epsilon-delta proofs. Looking for clear handwriting and examples!",
                subject: "Mathematics",
                bounty: 500,
                status: 'active',
                requester_name: "Sarah M.", // We'll store this in description or metadata if schema assumes user_id
                tags: ["Calculus", "Limits", "Proofs"]
            },
            {
                title: "Organic Chemistry: Reaction Mechanisms",
                description: "I missed the lecture on SN1 vs SN2 reaction mechanisms. Need a summary sheet that compares the two with potential energy diagrams.",
                subject: "Chemistry",
                bounty: 1200,
                status: 'active',
                tags: ["Organic Chem", "Reactions"]
            },
            {
                title: "Intro to Macroeconomics - Midterm Prep",
                description: "Compiling a study guide for the midterm. Missing notes on the IS-LM model and Fiscal Policy multipliers. Will tip extra for graphs!",
                subject: "Economics",
                bounty: 300,
                status: 'active',
                tags: ["Macro", "IS-LM", "Fiscal Policy"]
            }
        ];

        for (const demo of demos) {
            await supabase.from('peer_requests' as any).insert({
                user_id: user.id, // Assigned to current user so we can see them (or create another user if needed, but this is easiest)
                title: demo.title,
                description: demo.description,
                subject: demo.subject,
                bounty: demo.bounty,
                status: 'active',
                views: 0,
                created_at: new Date().toISOString()
            });
        }

        fetchMarketRequests();
        fetchSupabaseRequests();
        toast.success("Demo requests created!");
    };

    return {
        myRequests,
        marketRequests,
        createRequest,
        updateRequest: updateRequestData,
        refreshRequests: () => {
            if (isRealUser) {
                fetchSupabaseRequests();
                fetchMarketRequests();
            } else {
                loadLocalRequests();
            }
        },
        seedDemoRequests,
        loading,
        incrementViewCount: async (reqId: string, currentViews: number) => {
            if (!isRealUser) return;
            try {
                await supabase
                    .from('peer_requests' as any)
                    .update({ views: currentViews + 1 })
                    .eq('id', reqId);
            } catch (e) {
                console.error("Failed to increment views", e);
            }
        }
    };
}
