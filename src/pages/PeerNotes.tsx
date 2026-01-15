import { useState, useMemo, useEffect } from "react";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { BackButton } from "@/components/ui/BackButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  RefreshCw,
  Plus,
  Filter,
  Users,
  Sparkles,
  ArrowUpDown,
  SlidersHorizontal,
  Upload,
  X,
  FileText,
  Image as ImageIcon,
  Clock,
  Target,
  Calendar,
  ChevronRight,
  Trash2,
  Trophy,
  Lock,
  Eye
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { PeerNote, PeerNoteCard } from "@/components/cards/FeatureCards";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/TextLayer.css';
import 'react-pdf/dist/Page/AnnotationLayer.css';

// Configure PDF Worker
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
import { cn } from "@/lib/utils";
import { useNotes } from "@/hooks/useNotes";
import { useAuth } from "@/hooks/useAuth";
import { usePeerRequests } from "@/hooks/usePeerRequests";
import { supabase } from "@/integrations/supabase/client";
import { useActivity } from "@/hooks/useActivity";



const subjects = ["All", "Mathematics", "Biology", "Computer Science", "History", "Chemistry", "Economics", "Physics"];
const levels = ["All Levels", "High School", "Undergraduate", "Graduate"];
const noteTypes = ["pdf", "image", "text"];



// Helper to map DB note to PeerNote
const mapNoteToPeerNote = (note: any): PeerNote => ({
  id: note.id,
  title: note.title,
  subject: note.subject,
  topic: note.tags?.[0] || "General",
  level: "Undergraduate",
  author: note.author,
  type: (note.files?.[0]?.name?.toLowerCase().endsWith('.pdf') ? 'pdf' :
    note.files?.[0]?.name?.toLowerCase().match(/\.(jpg|jpeg|png)$/) ? 'image' : 'text') as any,
  upvotes: note.upvotes,
  comments: 0,
  createdAt: new Date(note.created_at).toLocaleDateString(),
  preview: note.description || `Comprehensive notes on ${note.tags?.[0] || 'the subject'}.`,
  files: note.files
});



const INITIAL_REQUESTS = [
  {
    id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    title: "Advanced Calculus II - Week 4 Notes",
    description: "Desperately need detailed notes on Multivariable Limits and Continuity. My professor moved too fast through the epsilon-delta proofs. Looking for clear handwriting and examples!",
    subject: "Mathematics",
    bounty: 500,
    requester: "Sarah M.",
    deadline: "2 days left",
    urgency: "high",
    tags: ["Calculus", "Limits", "Proofs"],
    isRead: false,
    views: 120
  },
  {
    id: "b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a12",
    title: "Organic Chemistry: Reaction Mechanisms",
    description: "I missed the lecture on SN1 vs SN2 reaction mechanisms. Need a summary sheet that compares the two with potential energy diagrams.",
    subject: "Chemistry",
    bounty: 1200,
    requester: "David K.",
    deadline: "Urgent",
    urgency: "critical",
    tags: ["Organic Chem", "Reactions"],
    isRead: false,
    views: 45
  },
  {
    id: "c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a13",
    title: "Intro to Macroeconomics - Midterm Prep",
    description: "Compiling a study guide for the midterm. Missing notes on the IS-LM model and Fiscal Policy multipliers. Will tip extra for graphs!",
    subject: "Economics",
    bounty: 300,
    requester: "Alex T.",
    deadline: "1 week left",
    urgency: "medium",
    tags: ["Macro", "IS-LM", "Fiscal Policy"],
    isRead: false,
    views: 12
  }
];

const ALL_USERS = [
  "sarah.m@example.com", "david.k@college.edu", "alex.t@uni.ac.ik", "ritam.b@gmail.com", "john.doe@test.com", "jane.smith@web.org"
];

export default function PeerNotes() {
  const { notes: dbNotes, isLoading, uploadNote, upvoteNote } = useNotes();
  const { user, updateProfile } = useAuth();
  const { trackAction } = useActivity();
  const displayName = user?.user_metadata?.display_name || user?.email?.split('@')[0] || "Guest";

  const [selectedSubject, setSelectedSubject] = useState("All");
  const [sortBy, setSortBy] = useState("recent");
  const [activeTab, setActiveTab] = useState<'browse' | 'requests' | 'following' | 'my_requests'>('browse');
  const [searchQuery, setSearchQuery] = useState("");
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);

  // Request Form State
  const [targetAudience, setTargetAudience] = useState("public");
  const [specificUserSearch, setSpecificUserSearch] = useState("");
  const [bountyInput, setBountyInput] = useState("");
  const [requestSubject, setRequestSubject] = useState(""); // Track subject separately for filtering users
  const [manageRequest, setManageRequest] = useState<any>(null); // For managing "My Requests"

  // Real-time Karma Logic
  const [realtimeKarma, setRealtimeKarma] = useState<number>(user?.user_metadata?.karma || 0);

  useEffect(() => {
    if (!user) return;

    // 1. Initial Fetch
    const fetchKarma = async () => {
      const { data } = await supabase.from('profiles').select('karma').eq('id', user.id).single();
      if (data) setRealtimeKarma((data as any).karma);
    };
    fetchKarma();

    // 2. Subscribe
    const channel = supabase
      .channel('peernotes-karma-sync')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${user.id}` },
        (payload: any) => {
          if (payload.new && typeof payload.new.karma === 'number') {
            setRealtimeKarma(payload.new.karma);
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const userKarma = realtimeKarma;

  const [previewNote, setPreviewNote] = useState<any>(null); // For Note Preview functionality
  const [numPreviewPages, setNumPreviewPages] = useState<number>(0);
  const [reopenConfirmDetails, setReopenConfirmDetails] = useState<any>(null); // For Re-open Confirmation

  // User Search State
  const [registeredUsers, setRegisteredUsers] = useState<any[]>([]);
  const [isSearchingUsers, setIsSearchingUsers] = useState(false);

  // Load available users for targeted requests
  useEffect(() => {
    const fetchUsers = async () => {
      if (!user) return;
      setIsSearchingUsers(true);
      try {
        // Fetch profiles that are NOT the current user
        const { data, error } = await supabase
          .from('profiles')
          .select('id, display_name, username, education_level, subjects, avatar_url, bio')
          .neq('id', user.id) // Exclude self
          .limit(50);

        if (error) {
          console.error("Error fetching profiles:", error);
          // If table doesn't exist or RLS fails, we show nothing (real system behavior)
        } else if (data) {
          setRegisteredUsers(data);
        }
      } catch (e) {
        console.error("Failed to fetch registered users", e);
      } finally {
        setIsSearchingUsers(false);
      }
    };

    if (activeTab === 'requests' || activeTab === 'browse' || isUploadOpen) { // Lazy load slightly
      fetchUsers();
    }
  }, [user, activeTab, isUploadOpen]);

  // Filter users based on input
  const filteredUsers = useMemo(() => {
    if (!specificUserSearch) return [];

    const searchLower = specificUserSearch.toLowerCase();
    return registeredUsers.filter(u => {
      // Basic Text Match
      const nameMatch = (u.display_name?.toLowerCase() || "").includes(searchLower) ||
        (u.username?.toLowerCase() || "").includes(searchLower);

      if (!nameMatch) return false;

      return true;
    });
  }, [registeredUsers, specificUserSearch]);

  // Persist followed requests
  const [followedRequests, setFollowedRequests] = useState<any[]>(() => {
    const saved = localStorage.getItem("followed_requests");
    return saved ? JSON.parse(saved) : [];
  });

  // Manage active requests (exclude ones that are already followed)
  const [requests, setRequests] = useState(() => {
    const savedFollowed = localStorage.getItem("followed_requests");
    const followedIds = savedFollowed ? JSON.parse(savedFollowed).map((r: any) => r.id) : [];
    return INITIAL_REQUESTS.filter(r => !followedIds.includes(r.id));
  });

  const { myRequests, marketRequests, createRequest, updateRequest, refreshRequests, seedDemoRequests, incrementViewCount } = usePeerRequests();

  // Merge backend market requests with initial static ones (for demo purposes if valid)
  // Logic: Real Backend Requests >> Initial Static Requests
  useEffect(() => {
    // Strictly use marketRequests (DB Data)
    if (marketRequests) {
      setRequests(marketRequests as any[]);
    }
  }, [marketRequests]);

  // Selected User Object (to get UUID)
  const [selectedTargetUser, setSelectedTargetUser] = useState<any>(null);
  const [isRequestOpen, setIsRequestOpen] = useState(false);

  const handleDeleteRequest = async (req: any) => {
    const isRefundable = req.status === 'active' || req.status === 'in_review';
    const refund = isRefundable ? Math.floor(req.bounty / 2) : 0;
    const message = isRefundable
      ? `Are you sure you want to delete this request?\n\nYou will be refunded 50% of the bounty (${refund} Karma).`
      : `Are you sure you want to delete this closed request?\n\nSince this request was already fulfilled or closed, NO Karma will be refunded.`;

    if (window.confirm(message)) {
      try {
        // 1. Refund Karma (only if applicable)
        if (refund > 0) {
          // Check current authoritative balance just in case, but using passed userKarma is generally fine for the UI optimism
          // Ideally we use RPC for credit too to be safe, but updateProfile calls our main update function
          const { error: creditError } = await supabase.rpc('grant_bounty', {
            target_user_id: user?.id,
            amount: refund
          });
          if (creditError) throw creditError;
        }

        // 2. Delete Request
        const { error } = await supabase.from('peer_requests' as any).delete().eq('id', req.id);

        if (error) throw error;

        toast.success(`Request deleted. ${refund} Karma refunded.`);

        // Force reload to ensure UI update
        window.location.reload();
      } catch (e) {
        console.error(e);
        toast.error("Failed to delete: " + (e as any).message);
      }
    }
  };

  // Sync manageRequest with updated data
  useEffect(() => {
    if (manageRequest) {
      const updated = myRequests.find(r => r.id === manageRequest.id);
      if (updated && JSON.stringify(updated) !== JSON.stringify(manageRequest)) {
        setManageRequest(updated);
      }
    }
  }, [myRequests, manageRequest]);

  const handlePostRequest = async () => {
    const amount = parseInt(bountyInput);

    if (!amount || isNaN(amount)) {
      toast.error("Please enter a valid bounty amount.");
      return;
    }

    if (amount < 100) {
      toast.error("Minimum bounty required is 100 Karma.");
      return;
    }

    if (amount > userKarma) {
      toast.error(`Insufficient Karma! Your balance is ${userKarma}.`);
      return;
    }

    if (targetAudience === 'individual' && !specificUserSearch) {
      toast.error("Please select a user for the request.");
      return;
    }

    // Deduct immediately via RPC (Single Source of Truth: 'profiles' table)
    const { error: debitError } = await supabase.rpc('deduct_karma' as any, {
      user_id: user?.id,
      amount: amount
    });

    if (debitError) {
      console.error("Debit failed", debitError);
      toast.error("Transaction failed: Could not deduct Karma. Please try again.");
      return;
    }

    // Determine target ID
    // If selectedTargetUser matches the search string, use the ID. Otherwise user might have typed a manual name (less ideal)
    let targetIdentifier = undefined;
    if (targetAudience === 'individual') {
      if (selectedTargetUser && (selectedTargetUser.display_name === specificUserSearch || selectedTargetUser.username === specificUserSearch)) {
        targetIdentifier = selectedTargetUser.id; // Use UUID
      } else {
        targetIdentifier = specificUserSearch; // Fallback to string (e.g. email typed manually)
      }
    }

    // Create Request via Hook
    await createRequest({
      title: `${newNote.title || "Request"} [ Request ]`,
      description: newNote.topic || "Looking for notes.",
      subject: requestSubject || newNote.subject || "General",
      bounty: amount,
      status: "active",
      views: 0,
      submittedNotes: [],
      target_audience: targetAudience,
      target_user: targetIdentifier,
      createdAt: "Just now"
    });

    toast.success(`Request Posted as ${displayName}! ${amount} Karma moved to Escrow.`);
    setIsRequestOpen(false); // Close dialog
    setActiveTab('my_requests');
    refreshRequests(); // Force refresh from DB to show new request immediately
  };

  const handleUnlockNote = async (reqId: number, note: any, bounty: number) => {
    try {
      // 1. Pay the Contributor (Grant Bounty)
      // This transfers the *already escrowed* value (conceptually) or just adds karma to receiver. 
      // Since we deducted from sender at creation, we just need to ADD to receiver.
      if (note.author_id) {
        const { error } = await supabase.rpc('grant_bounty', {
          target_user_id: note.author_id,
          amount: bounty
        });

        if (error) throw error;
      }

      toast.success(`Approved! ${bounty} Karma sent to ${note.author}.`);

      // 2. Add to My Notes (Real Persistence)
      const unlockedNote = {
        id: `unlocked-${Date.now()}`,
        title: note.title.replace('.pdf', ''),
        subject: manageRequest?.subject || "General",
        author: note.author,
        university: "Peer Network",
        country: "Global",
        upvotes: 0,
        views: 0,
        tags: ["Unlocked", "PeerRequest"],
        created_at: new Date().toISOString(),
        files: [{ name: note.title, url: note.previewUrl || "#" }],
        userId: user?.id
      };

      // Save to global notes (for PDF Reader)
      const stored = localStorage.getItem("local_notes_data");
      const currentNotes = stored ? JSON.parse(stored) : [];
      localStorage.setItem("local_notes_data", JSON.stringify([unlockedNote, ...currentNotes]));

      // Save to "Your Notes" (Personal Workspace)
      const personalNote = {
        id: `p-${Date.now()}`,
        title: `[Unlocked] ${note.title.replace('.pdf', '')}`,
        content: `Unlocked from peer request.\n\nAuthor: ${note.author}\nSubject: ${manageRequest?.subject}\n\nNote: You can view the full document in the 'Browse Notes' library or main Dashboard.`,
        folderId: "general",
        tags: ["unlocked", "bounty", manageRequest?.subject || "general"],
        createdAt: new Date().toLocaleDateString()
      };

      const storedPersonal = localStorage.getItem("personal-notes");
      const currentPersonal = storedPersonal ? JSON.parse(storedPersonal) : [];
      // Avoid duplicates
      localStorage.setItem("personal-notes", JSON.stringify([personalNote, ...currentPersonal]));

      // 3. Notify Rejected Contributors (The "Rest")
      if (manageRequest && manageRequest.submittedNotes && manageRequest.submittedNotes.length > 0) {
        const rejectedContributors = manageRequest.submittedNotes.filter(
          (n: any) => n.author_id && n.author_id !== note.author_id
        );

        if (rejectedContributors.length > 0) {
          // Use RPC to bypass RLS for each user (One-by-one to ensure security context)
          for (const n of rejectedContributors) {
            await supabase.rpc('create_notification' as any, {
              target_user_id: n.author_id,
              title: 'Contribution Update',
              message: `Your submission for "${manageRequest.title}" was not selected. The bounty was awarded to another contributor.`,
              type: 'system'
            });
          }
        }
      }

      // 4. Close Request
      await updateRequest(reqId, { status: 'closed' });

      refreshRequests();
      setManageRequest(null);
      toast.success("Note added to your library!");

    } catch (e) {
      console.error("Unlock error", e);
      toast.error("Failed to approve request. " + (e as any).message);
    }
  };

  const handleReopenRequest = (request: any) => {
    setReopenConfirmDetails(request);
  };

  const triggerReopen = async () => {
    if (!reopenConfirmDetails) return;

    const bounty = reopenConfirmDetails.bounty || 100;

    if (userKarma < bounty) {
      toast.error(`Insufficient Balance. You need ${bounty} Karma.`);
      setReopenConfirmDetails(null);
      return;
    }

    // 1. Deduct Karma
    await updateProfile({ karma: userKarma - bounty });

    // 2. Reset Request
    updateRequest(reopenConfirmDetails.id, { status: 'active', submittedNotes: [] });

    setManageRequest(prev => ({ ...prev, status: 'active', submittedNotes: [] }));

    toast.success(`Request Re-opened! ${bounty} Karma moved to Escrow.`);
    setReopenConfirmDetails(null);
  };

  const handleRejectNote = async (reqId: any, note: any) => {
    if (!confirm("Reject this contribution? The file will be removed and the user notified.")) return;

    try {
      // 1. Filter out the note
      const updatedNotes = manageRequest.submittedNotes.filter((n: any) => n.id !== note.id);

      // 2. Update DB Request
      await updateRequest(reqId, { submittedNotes: updatedNotes });

      // 3. Notify User
      if (note.author_id) {
        await supabase.rpc('create_notification' as any, {
          target_user_id: note.author_id,
          title: 'Contribution Not Accepted',
          message: `Your submission for "${manageRequest.title}" was not accepted by the requester. No Karma was awarded. You may view the request and try again.`,
          type: 'system'
        });
      }

      // 4. Update Local State
      setManageRequest((prev: any) => ({ ...prev, submittedNotes: updatedNotes }));

      toast.success("Contribution removed.");

    } catch (e) {
      console.error("Reject error", e);
      toast.error("Failed to reject contribution.");
    }
  };

  const [newNote, setNewNote] = useState({
    title: "",
    subject: "",
    topic: "",
    level: "",
    type: "text" as PeerNote["type"],
    files: [] as File[],
  });

  const toggleFollowRequest = (req: any) => {
    const isFollowing = followedRequests.some(r => r.id === req.id);

    if (isFollowing) {
      // Unfollow: Remove from followed, Add back to requests
      const newFollowed = followedRequests.filter(r => r.id !== req.id);
      setFollowedRequests(newFollowed);
      localStorage.setItem("followed_requests", JSON.stringify(newFollowed));

      // Add back to requests
      setRequests(prev => {
        if (prev.some(r => r.id === req.id)) return prev;
        // Add back using the original data to preserve consistency
        const original = INITIAL_REQUESTS.find(r => r.id === req.id) || req;
        return [...prev, original];
      });
      toast.success("Unfollowed request");
    } else {
      // Follow: Add to followed, Remove from requests
      const newFollowed = [...followedRequests, req];
      setFollowedRequests(newFollowed);
      localStorage.setItem("followed_requests", JSON.stringify(newFollowed));

      setRequests(prev => prev.filter(r => r.id !== req.id));
      toast.success("Request moved to 'Following' tab.");
    }
    // Close dialog if open
    setSelectedRequest(null);
  };

  const markRequestAsRead = (reqId: any) => {
    setRequests(prev => prev.map(r => r.id === reqId ? { ...r, isRead: true } : r));
  };

  const handleUpload = async () => {
    if (!user) {
      toast.error("Please login first");
      return;
    }
    if (!newNote.title || !newNote.subject || !newNote.topic) {
      toast.error("Please fill in the required fields");
      return;
    }

    if (newNote.files.length === 0 && newNote.type !== "text") {
      toast.error("Please select a file to upload");
      return;
    }

    try {
      // 1. If this is a Request Fulfillment
      if (selectedRequest) {
        // Helper for base64
        const toBase64 = (file: File) => new Promise<string>((res, rej) => {
          const r = new FileReader(); r.readAsDataURL(file);
          r.onload = () => res(r.result as string); r.onerror = rej;
        });
        const fileData = [];
        for (const f of newNote.files) { try { fileData.push({ name: f.name, url: await toBase64(f) }); } catch (e) { console.error("File processing error", e); } }

        const contribution = {
          id: crypto.randomUUID(),
          title: newNote.title,
          author: displayName,
          author_id: user.id,
          previewUrl: fileData[0]?.url || "https://example.com/demo.pdf",
          files: fileData,
          created_at: new Date().toISOString()
        };

        // Use RPC to bypass RLS for submission
        // This ensures contributors can write to the request despite not being the owner
        const { error } = await supabase.rpc('submit_bounty_contribution', {
          req_id: selectedRequest.id,
          note_data: contribution
        });

        if (error) throw error;

        toast.success("Submitted for review! The owner has been notified.");
        trackAction('reply_peer');
        refreshRequests();
      } else {
        // Standard Upload (Not a Request)
        console.log("Uploading Standard Note...", newNote);
        // We use mutateAsync if available, but the hook currently exposes mutate. 
        // We will assume uploadNote is now async or we just fire it. 
        // To be safe and ensure profile update happens only if upload succeeds, we really need await.
        // For now, I will assume I am fixing the hook to return mutateAsync.
        await uploadNote({
          title: newNote.title,
          subject: newNote.subject,
          topic: newNote.topic,
          tags: [newNote.topic, newNote.subject].filter(Boolean),
          files: newNote.files
        });

        // Reward immediately for contributing to public library
        await updateProfile({ karma: userKarma + 50 });
      }

      // Cleanup
      setIsUploadOpen(false);
      setSelectedRequest(null);
      setNewNote({ title: "", subject: "", topic: "", level: "", type: "text", files: [] });

    } catch (e) {
      console.error(e);
      toast.error("Failed to process upload.");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setNewNote(prev => ({
        ...prev,
        files: [...prev.files, ...selectedFiles].slice(0, 3) // Limit to 3 files
      }));
    }
  };

  const removeFile = (index: number) => {
    setNewNote(prev => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index)
    }));
  };

  const peerNotes = (dbNotes || []).map(mapNoteToPeerNote);

  const filteredAndSortedNotes = useMemo(() => {
    const result = peerNotes.filter((note) => {
      const matchesSubject = selectedSubject === "All" || note.subject === selectedSubject;
      const matchesSearch =
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.author.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSubject && matchesSearch;
    });

    switch (sortBy) {
      case "views":
        // Sort by upvotes for now as views isn't in PeerNote yet
        return [...result].sort((a, b) => b.upvotes - a.upvotes);
      default:
        return result; // Default order
    }
  }, [peerNotes, searchQuery, selectedSubject, sortBy]);

  return (
    <div className="min-h-screen flex flex-col" >
      <Navbar />
      <main className="flex-1 pt-16 pb-16">
        {/* Enhanced Hero Section */}
        <section className="relative overflow-hidden bg-emerald-50/50 dark:bg-emerald-950/10 border-b border-border py-20 mb-8">
          <div className="absolute inset-0 pattern-grid opacity-[0.03] dark:opacity-[0.05]" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/80" />

          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-3xl"
            >
              <BackButton className="mb-8" />
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 rounded-lg bg-success/10 text-success animate-float">
                  <Users className="w-5 h-5" />
                </div>
                <span className="text-sm font-semibold text-success tracking-wide uppercase">Community Hub</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-display font-bold mb-4 tracking-tight">
                Explore <span className="text-success">PeerNotes</span>
              </h1>
              <p className="text-lg text-muted-foreground mb-8 text-balance max-w-2xl leading-relaxed">
                Direct from students to students. Access course-specific summaries,
                practice problems, and lecture insights shared by your peers.
                practice problems, and lecture insights shared by your peers.
              </p>

              <div className="flex items-center gap-4 mb-8 p-1 pl-1 bg-white dark:bg-zinc-900 border border-border rounded-full shadow-sm max-w-fit pr-6">
                <div className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 p-2 rounded-full">
                  <Trophy className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Your Balance</span>
                  <span className="text-lg font-bold leading-none font-mono text-foreground">{userKarma} Karma</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
                  <DialogTrigger asChild>
                    <Button size="lg" className="bg-gradient-to-r from-success to-emerald-600 gap-2 shadow-lg shadow-success/20 hover:shadow-success/30 transition-all font-semibold">
                      <Plus className="w-5 h-5" /> Share Your Notes
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden border-none shadow-2xl glass-card">
                    <div className="bg-gradient-to-br from-success/20 via-emerald-500/10 to-transparent p-6 pb-4">
                      <DialogHeader>
                        <DialogTitle className="text-2xl font-display font-bold">Share Your Knowledge</DialogTitle>
                        <DialogDescription className="text-muted-foreground/80">
                          Upload your notes and help the community grow. Your contribution earns you reputation points!
                        </DialogDescription>
                      </DialogHeader>
                    </div>

                    <div className="p-6 space-y-5">
                      <div className="grid gap-2">
                        <Label htmlFor="title" className="text-xs font-bold uppercase tracking-wider text-muted-foreground/70">Note Title</Label>
                        <Input
                          id="title"
                          value={newNote.title}
                          onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                          placeholder="e.g., Quantum Mechanics Lecture 1"
                          className="h-12 bg-background/50 border-border/50 focus:border-success/50 transition-all rounded-xl"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="subject" className="text-xs font-bold uppercase tracking-wider text-muted-foreground/70">Subject</Label>
                          <Select
                            value={newNote.subject}
                            onValueChange={(value) => setNewNote({ ...newNote, subject: value })}
                          >
                            <SelectTrigger className="h-12 bg-background/50 border-border/50 rounded-xl">
                              <SelectValue placeholder="Select Area" />
                            </SelectTrigger>
                            <SelectContent>
                              {subjects.filter(s => s !== "All").map((subject) => (
                                <SelectItem key={subject} value={subject}>
                                  {subject}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="topic" className="text-xs font-bold uppercase tracking-wider text-muted-foreground/70">Topic</Label>
                          <Input
                            id="topic"
                            value={newNote.topic}
                            onChange={(e) => setNewNote({ ...newNote, topic: e.target.value })}
                            placeholder="e.g., Wave Functions"
                            className="h-12 bg-background/50 border-border/50 rounded-xl"
                          />
                        </div>
                      </div>

                      <div className="grid gap-2">
                        <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/70">Upload Files</Label>
                        <div className="space-y-3">
                          <div
                            onClick={() => document.getElementById('file-upload')?.click()}
                            className="group relative cursor-pointer overflow-hidden rounded-2xl border-2 border-dashed border-border/50 bg-background/30 p-8 text-center transition-all hover:border-success/40 hover:bg-success/5"
                          >
                            <input
                              type="file"
                              id="file-upload"
                              className="hidden"
                              multiple
                              onChange={handleFileChange}
                              accept=".pdf,.png,.jpg,.jpeg,.txt"
                            />
                            <div className="flex flex-col items-center gap-2">
                              <div className="p-3 rounded-full bg-success/10 text-success group-hover:scale-110 transition-transform">
                                <Upload className="w-6 h-6" />
                              </div>
                              <div className="space-y-1">
                                <p className="text-sm font-semibold">Click to upload files</p>
                                <p className="text-xs text-muted-foreground">PDF, JPG or PNG (Max 3 files)</p>
                              </div>
                            </div>
                          </div>

                          <AnimatePresence>
                            {newNote.files.length > 0 && (
                              <div className="grid gap-2 mt-4">
                                {newNote.files.map((file, index) => (
                                  <motion.div
                                    key={`${file.name}-${index}`}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="flex items-center justify-between p-3 rounded-xl bg-background/50 border border-border/40 group hover:border-success/30 transition-all"
                                  >
                                    <div className="flex items-center gap-3">
                                      <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-500">
                                        {file.type.includes('image') ? <ImageIcon className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                                      </div>
                                      <div className="flex flex-col">
                                        <span className="text-sm font-medium truncate max-w-[200px]">{file.name}</span>
                                        <span className="text-[10px] text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</span>
                                      </div>
                                    </div>
                                    <button
                                      onClick={() => removeFile(index)}
                                      className="p-1.5 rounded-lg hover:bg-destructive/10 hover:text-destructive text-muted-foreground transition-colors"
                                    >
                                      <X className="w-4 h-4" />
                                    </button>
                                  </motion.div>
                                ))}
                              </div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 pt-2 bg-background/30 border-t border-border/40">
                      <Button
                        onClick={handleUpload}
                        className="w-full h-12 bg-gradient-to-r from-success to-emerald-600 text-white hover:shadow-lg hover:shadow-success/20 transition-all font-bold rounded-xl"
                      >
                        Publish Contribution
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                {/* Create Request Dialog */}
                <Dialog open={isRequestOpen} onOpenChange={setIsRequestOpen}>
                  <DialogTrigger asChild>
                    <Button size="lg" variant="outline" className="border-success/50 text-success hover:bg-success/5 gap-2 font-semibold">
                      <Target className="w-5 h-5" /> Request Notes
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden border-none shadow-xl glass-card">
                    <div className="bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent p-6 pb-4 border-b border-border/50">
                      <DialogHeader>
                        <DialogTitle className="text-2xl font-display font-bold">Request Notes</DialogTitle>
                        <DialogDescription className="text-muted-foreground/80">
                          Posting as <span className="font-semibold text-foreground">{displayName}</span>. Can't find what you need? Ask!
                        </DialogDescription>
                      </DialogHeader>
                    </div>

                    <div className="p-6 space-y-5">
                      <div className="grid gap-2">
                        <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/70">What do you need?</Label>
                        <Input placeholder="e.g., Linear Algebra Eigenvectors Notes" className="bg-background/50" value={newNote.title} onChange={(e) => setNewNote({ ...newNote, title: e.target.value })} />
                      </div>

                      <div className="grid gap-2">
                        <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/70">Details</Label>
                        <textarea
                          className="flex min-h-[80px] w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          placeholder="Describe exactly what you are looking for..."
                          value={newNote.topic}
                          onChange={(e) => setNewNote({ ...newNote, topic: e.target.value })}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/70">Subject</Label>
                          <Select value={requestSubject} onValueChange={setRequestSubject}>
                            <SelectTrigger className="bg-background/50">
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                              {subjects.filter(s => s !== "All").map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid gap-2">
                          <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/70">Target Audience</Label>
                          <Select value={targetAudience} onValueChange={setTargetAudience}>
                            <SelectTrigger className="bg-background/50">
                              <SelectValue placeholder="Public" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="public">Public (Everyone)</SelectItem>
                              <SelectItem value="individual">Specific User</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <AnimatePresence>
                        {targetAudience === 'individual' && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="grid gap-2 overflow-visible"
                          >
                            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/70">To User (Search)</Label>
                            <div className="relative">
                              <Input
                                placeholder="Type to search registered users..."
                                className="bg-background/50"
                                value={specificUserSearch}
                                onChange={(e) => setSpecificUserSearch(e.target.value)}
                              />
                              {specificUserSearch.length > 0 && (
                                <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-lg shadow-lg z-50 max-h-[150px] overflow-y-auto">
                                  {filteredUsers.length > 0 ? (
                                    filteredUsers.map(u => (
                                      <div
                                        key={u.id}
                                        className="px-4 py-2 hover:bg-muted cursor-pointer text-sm flex flex-col"
                                        onClick={() => {
                                          setSpecificUserSearch(u.display_name || u.username || "");
                                          setSelectedTargetUser(u);
                                        }}
                                      >
                                        <span className="font-medium">{u.display_name || "Unknown"}</span>
                                        <span className="text-xs text-muted-foreground">@{u.username || "user"} • {u.education_level || "Student"}</span>
                                      </div>
                                    ))
                                  ) : (
                                    <div className="px-4 py-3 text-sm text-muted-foreground">No matching registered user found.</div>
                                  )}
                                </div>
                              )}
                            </div>
                            <p className="text-[10px] text-muted-foreground">Showing registered users aligned with your request.</p>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <div className="grid gap-2">
                        <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/70">Bounty (Karma)</Label>
                        <div className="flex items-center gap-4">
                          <div className="flex-1">
                            <Input
                              type="number"
                              placeholder="100"
                              className="bg-background/50"
                              value={bountyInput}
                              onChange={(e) => setBountyInput(e.target.value)}
                            />
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Your Balance: <span className="font-bold text-success">{userKarma} Karma</span>
                          </div>
                        </div>
                      </div>


                      <Button className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 font-bold rounded-xl" onClick={handlePostRequest}>
                        Post Request
                      </Button>
                    </div>

                  </DialogContent>
                </Dialog>
                <div className="flex items-center gap-3 px-4 py-2 bg-background/50 backdrop-blur-sm border border-border rounded-full self-start">
                  <div className="flex -space-x-2">
                    <Users className="w-4 h-4 text-muted-foreground mr-1" />
                  </div>
                  <span className="text-xs font-medium">Joined by 850 universities</span>
                </div>
                {/* Reputation Badge */}
                <div className="flex items-center gap-2 px-4 py-2 bg-yellow-500/10 border border-yellow-500/20 rounded-full self-start">
                  <Trophy className="w-4 h-4 text-yellow-600" />
                  <span className="text-xs font-bold text-yellow-700">My Reputation: {userKarma} Karma</span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Discovery Tools */}
          <div className="space-y-6 mb-12">
            <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center">
              <div className="relative flex-1 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-success transition-colors" />
                <Input
                  placeholder="Find notes from peers..."
                  className="pl-12 h-14 bg-background shadow-sm border-border/60 focus:border-success/50 focus:ring-success/20 rounded-2xl text-lg"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex gap-3">
                <div className="flex bg-muted p-1 rounded-xl h-14 border border-border/60">
                  <Button
                    variant={activeTab === 'browse' ? 'secondary' : 'ghost'}
                    onClick={() => setActiveTab('browse')}
                    className="h-full rounded-lg px-6 font-semibold"
                  >
                    Browse Notes
                  </Button>
                  <Button
                    variant={activeTab === 'requests' ? 'secondary' : 'ghost'}
                    onClick={() => setActiveTab('requests')}
                    className="h-full rounded-lg px-6 font-semibold gap-2"
                  >
                    Requests <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{requests.filter(r => !r.isRead).length}</span>
                  </Button>
                  <Button
                    variant={activeTab === 'following' ? 'secondary' : 'ghost'}
                    onClick={() => setActiveTab('following')}
                    className="h-full rounded-lg px-6 font-semibold gap-2"
                  >
                    Following <span className="bg-indigo-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{followedRequests.length}</span>
                  </Button>
                  <Button
                    variant={activeTab === 'my_requests' ? 'secondary' : 'ghost'}
                    onClick={() => setActiveTab('my_requests')}
                    className="h-full rounded-lg px-6 font-semibold gap-2"
                  >
                    My Requests
                  </Button>
                </div>
              </div>
            </div>

            {/* Subject Chips */}
            {activeTab === 'browse' && (
              <div className="flex items-center gap-4">
                <span className="text-sm font-semibold text-muted-foreground whitespace-nowrap">Subject Areas:</span>
                <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-2 mask-linear">
                  {subjects.map((subject) => (
                    <button
                      key={subject}
                      onClick={() => setSelectedSubject(subject)}
                      className={cn(
                        "px-5 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap border",
                        selectedSubject === subject
                          ? "bg-success text-white border-success shadow-md shadow-success/20 scale-105"
                          : "bg-background text-muted-foreground border-border/60 hover:border-success/40 hover:text-success"
                      )}
                    >
                      {subject}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Notes Grid or Requests Grid */}
          {activeTab === 'browse' ? (
            <div className="grid md:grid-cols-2 gap-6">
              <AnimatePresence mode="popLayout">
                {filteredAndSortedNotes.map((note, index) => (
                  <motion.div
                    key={note.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <PeerNoteCard
                      note={note}
                      onUpvote={() => upvoteNote({ id: note.id, currentUpvotes: note.upvotes || 0 })}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
              {!isLoading && filteredAndSortedNotes.length === 0 && (
                <div className="col-span-2 text-center py-12 text-muted-foreground">
                  No notes found using these filters.
                </div>
              )}
            </div>
          ) : activeTab === 'requests' ? (
            requests.length === 0 ? (
              <div className="col-span-2 flex flex-col items-center justify-center py-20 text-center animate-fade-in border border-dashed border-border/50 rounded-3xl bg-muted/5">
                <div className="w-20 h-20 bg-muted/50 rounded-full flex items-center justify-center mb-6">
                  <Target className="w-10 h-10 text-muted-foreground/50" />
                </div>
                <h3 className="text-xl font-bold mb-2">No Active Requests</h3>
                <p className="text-muted-foreground max-w-sm mb-8">
                  The marketplace is currently quiet. Be the first to post a request or populate it with demo data.
                </p>
                <Button onClick={seedDemoRequests} variant="outline" className="gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-500" />
                  Seed Demo Requests
                </Button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6 animate-fade-in">
                {/* Enhanced Request Cards */}
                {requests.map((req) => (
                  <div
                    key={req.id}
                    className={cn(
                      "group relative bg-card border border-dashed border-border hover:border-success/50 p-0 rounded-2xl transition-all flex flex-col overflow-hidden cursor-pointer hover:shadow-lg hover:shadow-success/5",
                      req.isRead && "opacity-75 bg-muted/20 border-transparent"
                    )}
                    onClick={() => {
                      markRequestAsRead(req.id);
                      incrementViewCount(req.id, req.views || 0);
                      // Optimistic UI update
                      const updatedReq = { ...req, views: (req.views || 0) + 1 };
                      setRequests(prev => prev.map(r => r.id === req.id ? updatedReq : r));
                      setSelectedRequest(updatedReq);
                    }}
                  >
                    <div className="p-6 flex-1 flex flex-col">
                      <div className="flex justify-between items-start mb-4">
                        <div className="bg-success/10 text-success text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">
                          {req.subject}
                        </div>
                        <div className="bg-yellow-500/10 text-yellow-600 border border-yellow-500/20 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                          <Sparkles className="w-3 h-3" /> {req.bounty} Karma
                        </div>
                      </div>

                      <h3 className={cn("text-xl font-bold mb-2 group-hover:text-success transition-colors line-clamp-2", req.isRead && "font-medium text-muted-foreground")}>{req.title}</h3>
                      <p className="text-muted-foreground text-sm line-clamp-2 mb-4 flex-1">
                        {req.description}
                      </p>

                      <div className="flex items-center gap-4 text-xs text-muted-foreground mt-auto pt-4 border-t border-border/50">
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5" />
                          {req.requester}
                        </span>
                        <span className={cn("flex items-center gap-1 font-medium", req.urgency === 'critical' ? 'text-red-500' : 'text-orange-500')}>
                          <Clock className="w-3.5 h-3.5" />
                          {req.deadline}
                        </span>
                      </div>
                    </div>
                    <div className="bg-muted/30 p-3 flex items-center justify-between border-t border-border/50 group-hover:bg-success/5 transition-colors">
                      <span className="text-xs font-semibold text-muted-foreground group-hover:text-success pl-2">View Bounty Details</span>
                      <div className="w-8 h-8 rounded-full bg-background border border-border flex items-center justify-center group-hover:border-success/30 group-hover:text-success transition-all">
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )) : activeTab === 'my_requests' ? (
              <>
                <div className="flex justify-between items-center mb-4 px-1">
                  <h3 className="text-sm font-bold uppercase text-muted-foreground tracking-wider">Active Listings</h3>
                  <Button variant="outline" size="sm" onClick={() => { refreshRequests(); toast.success("Refreshed!"); }} className="gap-2 h-8 bg-background/50 backdrop-blur-sm">
                    <RefreshCw className="w-3.5 h-3.5" /> Refresh Status
                  </Button>
                </div>
                <div className="grid md:grid-cols-2 gap-6 animate-fade-in">
                  {myRequests.map((req) => (
                    <div
                      key={req.id}
                      className="bg-card border border-border/60 p-6 rounded-2xl flex flex-col hover:border-success/30 transition-all cursor-pointer hover:shadow-lg"
                      onClick={() => setManageRequest(req)}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">
                          {req.subject}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground font-mono bg-muted px-2 py-1 rounded">{req.status}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-full"
                            onClick={(e) => { e.stopPropagation(); handleDeleteRequest(req); }}
                            title="Delete Request"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                      <h3 className="text-lg font-bold mb-2">{req.title}</h3>
                      <div className="flex items-end justify-between mt-auto pt-4 border-t border-border/50">
                        <div className="flex items-center gap-6">
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">Views</div>
                            <div className="font-bold flex items-center gap-1.5">
                              <Eye className="w-4 h-4 text-muted-foreground" />
                              <span>{req.views || 0}</span>
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">Contributions</div>
                            <div className="font-bold flex items-center gap-1.5 text-indigo-500">
                              <FileText className="w-4 h-4" />
                              <span>{req.submittedNotes?.length || 0}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-muted-foreground mb-1">Bounty Offered</div>
                          <div className="font-bold text-success">{req.bounty} Karma</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Manage Request Dialog */}
                <Dialog open={!!manageRequest} onOpenChange={(open) => !open && setManageRequest(null)}>
                  <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden border-none shadow-xl glass-card">
                    {manageRequest && (
                      <>
                        <div className="bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent p-6 pb-4 border-b border-border/50">
                          <DialogHeader>
                            <div className="flex justify-between items-start">
                              <div>
                                <DialogTitle className="text-xl font-display font-bold mb-1">{manageRequest.title}</DialogTitle>
                                <div className="flex items-center gap-2">
                                  <span className={cn("text-xs font-bold uppercase px-2 py-0.5 rounded", manageRequest.status === 'active' ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700")}>{manageRequest.status}</span>
                                  <span className="text-xs text-muted-foreground">Bounty: {manageRequest.bounty} Karma</span>
                                </div>
                              </div>
                              {manageRequest.status === 'closed' && (
                                <Button size="sm" variant="outline" className="h-8 gap-1" onClick={() => handleReopenRequest(manageRequest)}>
                                  <Target className="w-3 h-3" /> Re-open Request
                                </Button>
                              )}
                            </div>
                          </DialogHeader>
                        </div>

                        <div className="p-6">
                          <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">Received Contributions</h4>

                          <div className="space-y-3">
                            {manageRequest.submittedNotes && manageRequest.submittedNotes.length > 0 ? (
                              manageRequest.submittedNotes.map((note: any) => (
                                <div key={note.id} className="flex items-center justify-between p-3 rounded-xl bg-background/50 border border-border/40 hover:border-indigo-500/30 transition-all">
                                  <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-indigo-100 text-indigo-600">
                                      <FileText className="w-4 h-4" />
                                    </div>
                                    <div className="flex flex-col">
                                      <span className="text-sm font-medium">{note.title}</span>
                                      <span className="text-[10px] text-muted-foreground">by {note.author}</span>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2">
                                    {(manageRequest.status === 'active' || manageRequest.status === 'in_review') && (
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full mr-1"
                                        onClick={() => handleRejectNote(manageRequest.id, note)}
                                        title="Reject Contribution"
                                      >
                                        <X className="w-4 h-4" />
                                      </Button>
                                    )}

                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 text-xs"
                                      onClick={() => setPreviewNote(note)}
                                    >
                                      Preview (50%)
                                    </Button>

                                    {(manageRequest.status === 'active' || manageRequest.status === 'in_review') && (
                                      <Button
                                        size="sm"
                                        className="h-8 text-xs bg-indigo-600 hover:bg-indigo-700 text-white gap-1"
                                        onClick={() => handleUnlockNote(manageRequest.id, note, manageRequest.bounty)}
                                      >
                                        <Sparkles className="w-3 h-3 text-yellow-300" />
                                        Pay & Unlock
                                      </Button>
                                    )}

                                    {manageRequest.status === 'closed' && (
                                      <Button size="sm" className="h-8 text-xs bg-green-600 hover:bg-green-700 text-white" disabled>
                                        Unlocked
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="text-center py-8 text-muted-foreground text-sm bg-muted/20 rounded-xl border border-dashed border-border/50">
                                No contributions yet.
                              </div>
                            )}
                          </div>
                        </div>
                      </>
                    )}
                  </DialogContent>
                </Dialog>
              </>
            ) : (
            <div className="grid md:grid-cols-2 gap-6 animate-fade-in">
              {followedRequests.length === 0 ? (
                <div className="col-span-2 text-center py-16 text-muted-foreground flex flex-col items-center gap-4 border border-dashed border-border/50 rounded-3xl bg-muted/5">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                    <Target className="w-8 h-8 opacity-50" />
                  </div>
                  <p className="text-lg font-medium">You aren't following any requests yet.</p>
                  <p className="text-sm text-muted-foreground -mt-3 max-w-xs">Follow requests to track bounties you want to fulfill later.</p>
                  <Button variant="outline" onClick={() => setActiveTab('requests')}>Browse Requests</Button>
                </div>
              ) : (
                followedRequests.map((req) => (
                  <div
                    key={req.id}
                    className="group relative bg-card border border-dashed border-indigo-200 dark:border-indigo-900 hover:border-indigo-500 p-6 rounded-2xl transition-all flex flex-col hover:shadow-lg hover:shadow-indigo-500/10"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <span className="bg-indigo-500/10 text-indigo-500 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">
                        {req.subject}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full"
                        onClick={(e) => { e.stopPropagation(); toggleFollowRequest(req); }}
                        title="Unfollow"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    <h3 className="text-xl font-bold mb-2">{req.title}</h3>
                    <p className="text-muted-foreground text-sm line-clamp-2 mb-6 flex-1">
                      {req.description}
                    </p>

                    <div className="bg-yellow-500/5 rounded-lg p-3 mb-4 flex items-center gap-2 border border-yellow-500/10">
                      <Trophy className="w-4 h-4 text-yellow-600" />
                      <span className="text-xs font-bold text-yellow-700">Reward: {req.bounty} Karma</span>
                    </div>

                    <div className="mt-auto flex gap-3">
                      <Button
                        className="flex-1 bg-success/10 text-success hover:bg-success hover:text-white font-bold h-10 rounded-xl"
                        onClick={() => {
                          toast.success("Opening contribution flow...");
                          setNewNote(prev => ({ ...prev, subject: req.subject, title: `Re: ${req.title}` }));
                          setIsUploadOpen(true);
                        }}
                      >
                        Fulfill Note
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Request Details Dialog */}
          <Dialog open={!!selectedRequest} onOpenChange={(open) => !open && setSelectedRequest(null)}>
            <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden border-none shadow-2xl">
              {selectedRequest && (
                <>
                  <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-black p-8 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-32 bg-success/20 blur-[100px] rounded-full pointer-events-none" />
                    <div className="relative z-10">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="bg-white/10 text-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold border border-white/10">
                          {selectedRequest.subject}
                        </span>
                        {selectedRequest.urgency === 'critical' && (
                          <span className="bg-red-500/20 text-red-200 px-3 py-1 rounded-full text-xs font-bold border border-red-500/30 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Urgent
                          </span>
                        )}
                      </div>
                      <h2 className="text-2xl font-bold mb-2 leading-tight">{selectedRequest.title}</h2>
                      <div className="flex items-center gap-2 text-indigo-200 text-sm">
                        <span>Posted by {selectedRequest.requester || "Peer Member"}</span>
                        <span>•</span>
                        <span>{selectedRequest.deadline || "Open Deadline"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 md:p-8 bg-card">
                    <div className="flex items-start justify-between gap-6 mb-8">
                      <div className="space-y-4 flex-1">
                        <div>
                          <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-2">Request Description</h4>
                          <p className="text-foreground leading-relaxed">
                            {selectedRequest.description}
                          </p>
                        </div>
                        <div>
                          <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-2">Required Topics</h4>
                          <div className="flex flex-wrap gap-2">
                            {(selectedRequest.tags && selectedRequest.tags.length > 0) ? (
                              selectedRequest.tags.map((tag: string) => (
                                <span key={tag} className="text-xs bg-muted px-2.5 py-1 rounded-md font-medium text-foreground border border-border">
                                  #{tag}
                                </span>
                              ))
                            ) : (
                              <span className="text-xs text-muted-foreground italic">General</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-4 flex flex-col items-center min-w-[140px] text-center">
                        <span className="text-xs font-bold text-yellow-600/80 uppercase tracking-wider mb-1">Bounty Reward</span>
                        <div className="text-3xl font-black text-yellow-600 flex items-center gap-1">
                          {selectedRequest.bounty}
                        </div>
                        <span className="text-[10px] text-muted-foreground font-medium">Karma Points</span>
                      </div>
                    </div>

                    <div className="flex gap-3 pt-6 border-t border-border">
                      <Button
                        variant="outline"
                        className="flex-1 h-12 rounded-xl gap-2 font-semibold hover:bg-muted"
                        onClick={() => toggleFollowRequest(selectedRequest)}
                      >
                        {followedRequests.some(r => r.id === selectedRequest.id) ? (
                          <><Trash2 className="w-4 h-4 text-destructive" /> Unfollow Request</>
                        ) : (
                          <><Target className="w-4 h-4" /> Follow Request</>
                        )}
                      </Button>
                      <Button
                        className="flex-[2] h-12 rounded-xl gap-2 font-bold bg-gradient-to-r from-success to-emerald-600 shadow-lg shadow-success/20 hover:shadow-success/30 text-white"
                        onClick={() => {
                          toast.success("Opening contribution flow...");
                          setNewNote(prev => ({ ...prev, subject: selectedRequest.subject, title: `Re: ${selectedRequest.title}` }));
                          setIsUploadOpen(true);
                        }}
                      >
                        <Upload className="w-4 h-4" /> Fulfill & Earn {selectedRequest.bounty}
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </DialogContent>
          </Dialog>

          {activeTab === 'browse' && !isLoading && filteredAndSortedNotes.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-12 p-12 rounded-3xl border-2 border-dashed border-success/30 bg-success/5 text-center flex flex-col items-center"
            >
              <div className="w-24 h-24 rounded-full bg-success/10 flex items-center justify-center mb-6 animate-float">
                <Users className="w-10 h-10 text-success/50" />
              </div>
              <h3 className="text-2xl font-display font-bold mb-3">Community Bridge is Empty</h3>
              <p className="text-muted-foreground max-w-sm mx-auto mb-8 text-lg">
                No peers have shared notes for
                <span className="text-success font-bold"> "{searchQuery || selectedSubject}"</span> yet.
                Start the trend by sharing yours!
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  onClick={() => { setSearchQuery(""); setSelectedSubject("All"); }}
                  className="rounded-xl h-12 px-8 font-bold bg-success hover:bg-success/90"
                >
                  Explore Other Areas
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsUploadOpen(true)}
                  className="rounded-xl h-12 px-8 font-bold border-success text-success hover:bg-success/10"
                >
                  <Plus className="w-4 h-4 mr-2" /> Contribute Now
                </Button>
              </div>
            </motion.div>
          )}
        </div>
        {/* 50% Preview Dialog */}
        <Dialog open={!!previewNote} onOpenChange={() => setPreviewNote(null)}>
          <DialogContent className="max-w-4xl h-[80vh] overflow-y-auto bg-zinc-900 border-zinc-800 text-white p-0">
            <div className="sticky top-0 z-50 bg-zinc-950 p-4 border-b border-zinc-800 flex justify-between items-center shadow-md">
              <h3 className="font-bold flex items-center gap-2 text-lg">
                <FileText className="w-5 h-5 text-indigo-400" />
                {previewNote?.title} <span className="text-xs bg-yellow-500/20 text-yellow-500 px-2 py-0.5 rounded ml-2 border border-yellow-500/30 uppercase tracking-widest font-bold">Locked Preview</span>
              </h3>
              <Button variant="ghost" size="icon" onClick={() => setPreviewNote(null)} className="hover:bg-white/10 rounded-full"><X className="w-5 h-5" /></Button>
            </div>

            <div className="p-8 flex flex-col items-center bg-zinc-900 min-h-full">
              <Document
                file={previewNote?.previewUrl}
                className="flex flex-col gap-8 shadow-2xl"
                onLoadSuccess={({ numPages }) => setNumPreviewPages(numPages)}
                loading={<div className="text-zinc-500 animate-pulse flex flex-col items-center gap-2 py-20"><Sparkles className="animate-spin text-indigo-500" /> Preparing Secure Preview...</div>}
                error={<div className="text-red-400 bg-red-500/10 p-4 rounded border border-red-500/20">Failed to load preview document. URL might be invalid.</div>}
              >
                {/* Render only first 50% of pages */}
                {Array.from(new Array(Math.ceil(numPreviewPages / 2)), (el, index) => (
                  <div key={index} className="relative group">
                    <Page
                      pageNumber={index + 1}
                      renderTextLayer={false} // Performance optimization for preview
                      renderAnnotationLayer={false}
                      width={600}
                      className="border border-zinc-700 shadow-xl"
                    />
                    <div className="absolute top-2 right-2 bg-black/50 text-white text-[10px] px-2 py-1 rounded backdrop-blur font-mono">Page {index + 1}</div>
                  </div>
                ))}
              </Document>

              {numPreviewPages > 0 && (
                <div className="mt-8 mb-12 p-10 border-2 border-dashed border-indigo-500/30 rounded-2xl bg-gradient-to-b from-indigo-500/5 to-transparent text-center max-w-lg w-full">
                  <div className="w-20 h-20 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto mb-6 ring-4 ring-indigo-500/5">
                    <Lock className="w-8 h-8 text-indigo-400" />
                  </div>
                  <h4 className="text-2xl font-bold mb-2">Remaining {Math.floor(numPreviewPages / 2)} Pages Locked</h4>
                  <p className="text-zinc-400 text-sm mb-8 leading-relaxed max-w-xs mx-auto">
                    You are viewing a restricted 50% preview.
                    Transfer the bounty within the request manager to unlock the full document.
                  </p>
                  <Button onClick={() => setPreviewNote(null)} variant="outline" className="border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/10 h-10 px-8 rounded-xl font-semibold">
                    Close Preview & Unlock
                  </Button>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
        {/* Re-open Confirmation Dialog */}
        <AlertDialog open={!!reopenConfirmDetails} onOpenChange={() => setReopenConfirmDetails(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Re-open this Request?</AlertDialogTitle>
              <AlertDialogDescription>
                This will re-activate your request involving a bounty of <span className="font-bold text-foreground">{reopenConfirmDetails?.bounty || 100} Karma</span>.
                <br /><br />
                This amount will be deducted from your current balance of {userKarma} Karma and held in Escrow again.
                Any previously fulfilled notes will be cleared from this request to allow for new contributions.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={triggerReopen} className="bg-indigo-600 hover:bg-indigo-700 font-bold">
                Confirm & Re-open
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </main >
      <Footer />
    </div >
  );
}
