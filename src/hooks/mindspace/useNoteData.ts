import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { getTreaty } from "@/routes/api.$";

/**
 * Hook to fetch a note for a specific date
 */
export const useNoteData = (selectedDate: Date) => {
    const dateString = format(selectedDate, "yyyy-MM-dd");

    return useQuery({
        queryKey: ["note", dateString],
        queryFn: async () => {
            const { data, error } = await getTreaty().notes.get({
                query: { date: dateString },
            });
            if (error) throw error;
            return data;
        },
        refetchOnWindowFocus: false, // Prevent refetch during editing
    });
};
