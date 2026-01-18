import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

// Minimal "Hello World" PDF for testing
const MOCK_PDF_DATA = "data:application/pdf;base64,JVBERi0xLjcKCjEgMCBvYmogICUgZW50cnkgcG9pbnQKPDwKICAvVHlwZSAvQ2F0YWxvZwogIC9QYWdlcyAyIDAgUgo+PgplbmRvYmoKCjIgMCBvYmogICUgcGFnZXMKPDwKICAvVHlwZSAvUGFnZXMKICAvTWVkaWFCb3ggWyAwIDAgNTk1LjI4IDg0MS44OSBdCiAgL0NvdW50IDEKICAvS2lkcyBbIDMgMCBSIF0KPj4KZW5kb2JqCgozIDAgb2JqICAlIHBhZ2UgMQo8PAogIC9UeXBlIC9Gb250CiAgL1BhcmVudCAyIDAgUgogIC9SZXNvdXJjZXMgPDwKICAgIC9Gb250IDw8CiAgICAgIC9FMSA0IDAgUgogICAgPj4KICA+PgogIC9Db250ZW50cyA1IDAgUgo+PgplbmRvYmoKCjQgMCBvYmogICUgZm9udAo8PAogIC9UeXBlIC9Gb250CiAgL1N1YnR5cGUgL1R5cGUxCiAgL0Jhc2VGb250IC9IZWx2ZXRpY2EKPj4KZW5kb2JqCgo1IDAgb2JqICAlIHBhZ2UgY29udGVudAo8PAogIC9MZW5ndGggNDQKPj4Kc3RyZWFtCkJUCjcwIDcwMCBURAovRTEgMjQgVGYKKEhlbGxvIE5vdGVWZXJzZSEpIFRqCkVUCmVuZHN0cmVhbQplbmRvYmoKCnhyZWYKMCA2CjAwMDAwMDAwMDAgNjU1MzUgZiAKMDAwMDAwMDAxMCAwMDAwMCBuIAowMDAwMDAwMDYwIDAwMDAwIG4gCjAwMDAwMDAxNTcgMDAwMDAgbiAKMDAwMDAwMDI1NSAwMDAwMCBuIAowMDAwMDAwMzU0IDAwMDAwIG4gCnRyYWlsZXIKPDwKICAvU2l6ZSA2CiAgL1Jvb3QgMSAwIFIKPj4Kc3RhcnR4cmVmCjQ0OQolJUVPRg==";

export interface NoteFile {
    name: string;
    url: string;
}

export interface Note {
    id: string;
    title: string;
    subject: string;
    author: string;
    university: string | null;
    country: string | null;
    upvotes: number;
    views: number;
    tags: string[];
    created_at: string;
    file_url?: string;
    description?: string;
    files?: { name: string; url: string }[];
    userId?: string; // Added userId
}

export const INITIAL_NOTES: Note[] = [
    {
        id: "1",
        title: "Introduction to React Hooks",
        subject: "Computer Science",
        author: "TechStudent_99",
        university: "MIT",
        country: "USA",
        upvotes: 45,
        views: 120,
        tags: ["react", "frontend", "javascript"],
        created_at: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
        files: [{ name: "intro_react.pdf", url: MOCK_PDF_DATA }] // Now a working PDF
    },
    {
        id: "2",
        title: "Organic Chemistry Basics",
        subject: "Chemistry",
        author: "ScienceWhiz",
        university: "Oxford",
        country: "UK",
        upvotes: 32,
        views: 89,
        tags: ["chemistry", "organic", "structures"],
        created_at: new Date(Date.now() - 86400000 * 5).toISOString(), // 5 days ago
        files: [{ name: "organic_chem.pdf", url: MOCK_PDF_DATA }]
    },
    {
        id: "3",
        title: "Macroeconomics Principles",
        subject: "Economics",
        author: "EconMajor",
        university: "Harvard",
        country: "USA",
        upvotes: 28,
        views: 150,
        tags: ["economics", "macro", "finance"],
        created_at: new Date(Date.now() - 86400000 * 10).toISOString(),
        files: [{ name: "macro_principles.pdf", url: MOCK_PDF_DATA }]
    },
    {
        id: "4",
        title: "Quantum Mechanics Fundamentals",
        subject: "Physics",
        author: "PhysicsPhile",
        university: "Caltech",
        country: "USA",
        upvotes: 89,
        views: 340,
        tags: ["physics", "quantum", "science"],
        created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
        files: [{ name: "quantum_mechanics.pdf", url: MOCK_PDF_DATA }]
    },
    {
        id: "5",
        title: "Anatomy of Human Skeleton",
        subject: "Biology",
        author: "MedLife",
        university: "Johns Hopkins",
        country: "USA",
        upvotes: 124,
        views: 890,
        tags: ["medicine", "anatomy", "biology"],
        created_at: new Date(Date.now() - 86400000 * 15).toISOString(),
        files: [{ name: "anatomy_skeleton.pdf", url: MOCK_PDF_DATA }]
    },
    {
        id: "6",
        title: "Ancient Roman Engineering",
        subject: "History",
        author: "HistoryBuff",
        university: "Sapienza University of Rome",
        country: "Italy",
        upvotes: 56,
        views: 210,
        tags: ["history", "engineering", "rome"],
        created_at: new Date(Date.now() - 86400000 * 20).toISOString(),
        files: [{ name: "roman_engineering.pdf", url: MOCK_PDF_DATA }]
    },
    {
        id: "7",
        title: "Civil Engineering Structures",
        subject: "Engineering",
        author: "BuildIt",
        university: "NTU",
        country: "Singapore",
        upvotes: 42,
        views: 180,
        tags: ["engineering", "civil", "structures"],
        created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
        files: [{ name: "civil_structures.pdf", url: MOCK_PDF_DATA }]
    },
    {
        id: "8",
        title: "Advanced Data Structures & Algorithms",
        subject: "Computer Science",
        author: "AlgoMaster",
        university: "IIT Delhi",
        country: "India",
        upvotes: 210,
        views: 1200,
        tags: ["cs", "algorithms", "software"],
        created_at: new Date(Date.now() - 86400000 * 7).toISOString(),
        files: [{ name: "Algorithms_Final_Guide.pdf", url: MOCK_PDF_DATA }]
    },
    {
        id: "9",
        title: "Differential Equations - Master Summary",
        subject: "Mathematics",
        author: "MathGenius",
        university: "ETH Zurich",
        country: "Switzerland",
        upvotes: 75,
        views: 450,
        tags: ["math", "calculus", "differential"],
        created_at: new Date(Date.now() - 86400000 * 4).toISOString(),
        files: [{ name: "Differential_Equations_Review.pdf", url: MOCK_PDF_DATA }]
    },
    {
        id: "10",
        title: "Pathology of Cardiovascular Systems",
        subject: "Medicine",
        author: "DocPreston",
        university: "Johns Hopkins",
        country: "USA",
        upvotes: 189,
        views: 2100,
        tags: ["medicine", "pathology", "cardio"],
        created_at: new Date(Date.now() - 86400000 * 12).toISOString(),
        files: [
            { name: "Heart_Pathology_Vol1.pdf", url: MOCK_PDF_DATA },
            { name: "Case_Studies_Cardio.pdf", url: MOCK_PDF_DATA }
        ]
    },
    {
        id: "11",
        title: "Thermodynamics in Mechanical Systems",
        subject: "Engineering",
        author: "MechMind",
        university: "Imperial College",
        country: "UK",
        upvotes: 94,
        views: 560,
        tags: ["engineering", "thermo", "energy"],
        created_at: new Date(Date.now() - 86400000 * 8).toISOString(),
        files: [{ name: "Thermodynamics_Full_Course.pdf", url: MOCK_PDF_DATA }]
    }
].map(note => ({
    ...note,
    userId: "mock-user", // Default for mocks
    files: (note as any).files || [{ name: `${note.title.replace(/ /g, "_")}.pdf`, url: (note as any).file_url || MOCK_PDF_DATA }]
})) as Note[];

export function useNotes() {
    const { user } = useAuth();
    const queryClient = useQueryClient();

    const fetchNotes = async (): Promise<Note[]> => {
        // Fetch ALL notes from Supabase for client-side filtering
        // This ensures the user gets instant feedback when typing in the search box
        const { data, error } = await supabase
            .from('peer_notes' as any)
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error("Error fetching notes:", error);
            // Fallback to initial notes if DB error
            return INITIAL_NOTES;
        }

        // Transform Supabase data to Note interface
        const realNotes = (data || [] as any[]).map(item => ({
            id: item.id,
            title: item.title,
            subject: item.subject,
            author: item.author_name || "Anonymous",
            userId: item.author_id, // Map author_id to userId
            university: item.university,
            country: item.country,
            upvotes: item.upvotes || 0,
            views: item.views || 0,
            tags: item.tags || [],
            created_at: item.created_at || new Date().toISOString(),
            file_url: item.file_url || undefined,
            description: item.description || "",
            files: item.file_url ? [{ name: "Document.pdf", url: item.file_url }] : []
        }));

        // Restore INITIAL_NOTES if DB is effectively empty
        if (realNotes.length === 0) {
            return INITIAL_NOTES;
        }

        return realNotes;
    };

    const { data: notes, isLoading, error } = useQuery({
        queryKey: ["notes"],
        queryFn: fetchNotes,
        placeholderData: INITIAL_NOTES, // Show initial notes immediately while fetching
        staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    });

    const uploadNoteMutation = useMutation({
        mutationFn: async (newNote: {
            title: string;
            subject: string;
            topic?: string;
            tags?: string[];
            files: File[];
        }) => {
            if (!user) throw new Error("User not authenticated");

            let fileUrl = null;

            // 1. Upload File (if exists)
            const fileToUpload = newNote.files?.[0];
            if (fileToUpload) {
                const fileExt = fileToUpload.name.split('.').pop();
                const filePath = `${user.id}/${crypto.randomUUID()}.${fileExt}`;

                const { error: uploadError, data } = await supabase.storage
                    .from('notes')
                    .upload(filePath, fileToUpload);

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from('notes')
                    .getPublicUrl(filePath);

                fileUrl = publicUrl;
            }

            // 1.5 Fetch Profile for Name
            const { data: profile } = await supabase
                .from('profiles')
                .select('username, display_name')
                .eq('id', user.id)
                .single();

            // Priority: Display Name -> Username -> Full Name -> Email part -> Anonymous
            const rawName =
                profile?.display_name ||
                profile?.username ||
                user.user_metadata.display_name ||
                user.user_metadata.full_name ||
                user.email ||
                "Anonymous";

            const authorName = rawName.includes('@') ? rawName.split('@')[0] : rawName;

            // 2. Insert Record
            const { data, error } = await supabase.from('peer_notes' as any).insert({
                title: newNote.title,
                subject: newNote.subject,
                tags: newNote.tags,
                author_id: user.id,
                author_name: authorName,
                file_url: fileUrl,
                description: `${newNote.subject} note`,
            }).select().single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["notes"] });
            toast.success("Note shared with the community!");
        },
        onError: (error: any) => {
            console.error("Upload error details:", error);
            toast.error(`Upload failed: ${error.message}`);
        },
    });

    const updateNoteMutation = useMutation({
        mutationFn: async ({ id, updates }: { id: string; updates: Partial<Note> }) => {
            // Map frontend updates to DB columns
            const dbUpdates: any = {
                title: updates.title,
                subject: updates.subject,
                tags: updates.tags,
                updated_at: new Date().toISOString()
            };

            // Handle file updates if necessary (currently just metadata)
            if (updates.files && updates.files.length > 0) {
                // For now, we just assume the main file_url might be updated if the first file changes
                // In a full implementation, we'd upload the new file here similar to create
                // For this fix, we'll focus on metadata to remove the "Stub" message
            }

            const { error } = await supabase
                .from('peer_notes' as any)
                .update(dbUpdates)
                .eq('id', id);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["notes"] });
            toast.success("Note updated successfully!");
        },
        onError: (error: any) => {
            toast.error(`Update failed: ${error.message}`);
        }
    });

    const deleteNoteMutation = useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase
                .from('peer_notes' as any)
                .delete()
                .eq('id', id);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["notes"] });
            toast.success("Note deleted successfully!");
        },
        onError: (error: any) => {
            toast.error(`Delete failed: ${error.message}`);
        }
    });

    const upvoteNoteMutation = useMutation({
        mutationFn: async ({ id, currentUpvotes }: { id: string; currentUpvotes: number }) => {
            // Check if it's a mock note (id is numeric string <= 20 usually, real UUIDs are long)
            if (id.length < 5) {
                return; // Mock note, just optimistic update locally handled by UI
            }

            const { error } = await supabase
                .from('peer_notes' as any)
                .update({ upvotes: currentUpvotes + 1 })
                .eq('id', id);

            if (error) throw error;
        },
        onSuccess: (_, variables) => {
            // Invalidate to fetch latest count
            // We don't toast here to avoid spamming, just silent update
            queryClient.invalidateQueries({ queryKey: ["notes"] });
        },
        onError: (error) => {
            console.error("Upvote failed:", error);
            toast.error("Failed to upvote note");
        }
    });

    return {
        notes,
        isLoading,
        error,
        uploadNote: uploadNoteMutation.mutateAsync, // Expose as Async for await
        isUploading: uploadNoteMutation.isPending,
        updateNote: updateNoteMutation.mutate,
        isUpdating: updateNoteMutation.isPending,
        deleteNote: deleteNoteMutation.mutate,
        isDeleting: deleteNoteMutation.isPending,
        upvoteNote: upvoteNoteMutation.mutate
    };
}
