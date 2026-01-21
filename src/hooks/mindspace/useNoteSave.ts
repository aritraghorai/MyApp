import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { useCallback, useState } from "react";
import { getTreaty } from "@/routes/api.$";
import type { SaveStatus } from "@/types/mindspace/view.types";

interface UseNoteSaveProps {
    selectedDate: Date;
    noteId: string | null;
}

/**
 * Hook to handle note saving logic
 */
export const useNoteSave = ({ selectedDate, noteId }: UseNoteSaveProps) => {
    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
    const queryClient = useQueryClient();

    const dateString = format(selectedDate, "yyyy-MM-dd");

    const handleSave = useCallback(
        async (content: string, mood: number | null) => {
            if (!content.trim() && mood === null) return;

            setIsSaving(true);
            setSaveStatus("saving");
            try {
                const { error } = await getTreaty().notes.post({
                    date: dateString,
                    content: content || "",
                    mood: mood || undefined,
                });
                if (error) {
                    alert("Failed to save note");
                    setSaveStatus("idle");
                    return;
                }
                queryClient.invalidateQueries({
                    queryKey: ["todos", noteId],
                });
                setSaveStatus("saved");
                setTimeout(() => setSaveStatus("idle"), 2000);
            } finally {
                setIsSaving(false);
            }
        },
        [dateString, noteId, queryClient]
    );

    return { handleSave, isSaving, saveStatus };
};
