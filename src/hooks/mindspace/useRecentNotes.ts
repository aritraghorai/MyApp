import { useQuery } from "@tanstack/react-query";
import { format, subDays } from "date-fns";
import { getTreaty } from "@/routes/api.$";

/**
 * Hook to fetch recent notes for list view
 */
export const useRecentNotes = (enabled: boolean = true) => {
    return useQuery({
        queryKey: ["notes-range"],
        queryFn: async () => {
            const to = format(new Date(), "yyyy-MM-dd");
            const from = format(subDays(new Date(), 30), "yyyy-MM-dd");
            const { data, error } = await getTreaty().notes.range.get({
                query: { from, to },
            });
            if (error) throw error;
            return data;
        },
        enabled,
    });
};
