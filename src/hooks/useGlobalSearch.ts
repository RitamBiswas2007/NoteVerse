import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface SearchResult {
    id: string;
    title: string;
    type: "note" | "circle" | "thought" | "peer-note";
    description?: string;
    href: string;
}

export function useGlobalSearch(query: string) {
    return useQuery({
        queryKey: ["global-search", query],
        queryFn: async (): Promise<SearchResult[]> => {
            if (!query || query.length < 2) return [];

            const searchTerm = `%${query}%`;

            // Parallel queries to Supabase
            const [notesRes, circlesRes, thoughtsRes] = await Promise.all([
                supabase
                    .from("notes")
                    .select("id, title, description, subject")
                    .or(`title.ilike.${searchTerm},subject.ilike.${searchTerm},description.ilike.${searchTerm}`)
                    .limit(5),
                supabase
                    .from("study_circles")
                    .select("id, name, description, subject_area")
                    .or(`name.ilike.${searchTerm},subject_area.ilike.${searchTerm},description.ilike.${searchTerm}`)
                    .limit(5),
                supabase
                    .from("thoughts")
                    .select("id, title, content")
                    .or(`title.ilike.${searchTerm},content.ilike.${searchTerm}`)
                    .limit(5),
            ]);

            const results: SearchResult[] = [];

            // Process Notes
            if (notesRes.data) {
                results.push(...notesRes.data.map(n => ({
                    id: `note-${n.id}`,
                    title: n.title,
                    type: "note" as const,
                    description: n.description || n.subject,
                    href: "/notes" // Ideally /notes/id
                })));
            }

            // Process Circles
            if (circlesRes.data) {
                results.push(...circlesRes.data.map(c => ({
                    id: `circle-${c.id}`,
                    title: c.name,
                    type: "circle" as const,
                    description: c.description || c.subject_area,
                    href: "/circles" // Ideally /circles/id
                })));
            }

            // Process Thoughts
            if (thoughtsRes.data) {
                results.push(...thoughtsRes.data.map(t => ({
                    id: `thought-${t.id}`,
                    title: t.title,
                    type: "thought" as const,
                    description: t.content.substring(0, 60) + "...",
                    href: "/thoughts" // Ideally /thoughts/id
                })));
            }

            return results;
        },
        enabled: query.length >= 2,
        staleTime: 1000 * 60, // 1 minute cache
    });
}
