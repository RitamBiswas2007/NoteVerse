import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export interface Comment {
    id: string;
    note_id: string;
    user_id: string;
    content: string;
    created_at: string;
    profiles?: {
        display_name: string;
        avatar_url: string;
    };
}

export function useNoteComments(noteId?: string) {
    const { user } = useAuth();
    const queryClient = useQueryClient();

    const { data: comments, isLoading } = useQuery({
        queryKey: ['comments', noteId],
        queryFn: async () => {
            if (!noteId) return [];

            // Check if mock note (short ID)
            if (noteId.length < 10) return [];

            const { data, error } = await supabase
                .from('note_comments' as any)
                .select('*, profiles(display_name, avatar_url)')
                .eq('note_id', noteId)
                .order('created_at', { ascending: true });

            if (error) {
                console.error("Error fetching comments:", error);
                return [];
            }
            return data as unknown as Comment[];
        },
        enabled: !!noteId
    });

    const addCommentMutation = useMutation({
        mutationFn: async (content: string) => {
            if (!user || !noteId) throw new Error("Unauthorized or missing note ID");

            const { error } = await supabase
                .from('note_comments' as any)
                .insert({
                    note_id: noteId,
                    user_id: user.id,
                    content
                });

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['comments', noteId] });
            queryClient.invalidateQueries({ queryKey: ['notes'] }); // To update comment count if we show it
            toast.success("Comment added!");
        },
        onError: (error) => {
            console.error("Failed to add comment:", error);
            toast.error("Failed to post comment");
        }
    });

    return {
        comments,
        isLoading,
        addComment: addCommentMutation.mutate,
        isAdding: addCommentMutation.isPending
    };
}
