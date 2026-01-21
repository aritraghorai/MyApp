import { useQuery } from "@tanstack/react-query";
import { getTreaty } from "@/routes/api.$";

interface UseNoteHistoryProps {
    noteId: string | null;
    enabled: boolean;
}

/**
 * Hook to fetch note history
 */
export const useNoteHistory = ({ noteId, enabled }: UseNoteHistoryProps) => {
    return useQuery({
        queryKey: ["note-history", noteId],
        queryFn: async () => {
            if (!noteId) return [];
            const { data, error } = await getTreaty().notes({ id: noteId }).history.get();
            if (error) throw error;
            return data;
        },
        enabled: !!noteId && enabled,
    });
};
