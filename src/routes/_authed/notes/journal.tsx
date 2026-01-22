import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { format } from "date-fns";
import { useState } from "react";
import { HistoryDialog } from "@/components/mindspace/organisms/HistoryDialog";
import { NoteEditTemplate } from "@/components/mindspace/templates/NoteEditTemplate";
import { useNotesContext } from "@/contexts/NotesContext";
import { useNoteData } from "@/hooks/mindspace/useNoteData";
import { useNoteHistory } from "@/hooks/mindspace/useNoteHistory";
import { useNoteSave } from "@/hooks/mindspace/useNoteSave";
import { useNoteState } from "@/hooks/mindspace/useNoteState";
import { useThemeStore } from "@/stores/useThemeStore";

export const Route = createFileRoute("/_authed/notes/journal")({
    component: JournalPage,
});

function JournalPage() {
    const { selectedDate } = useNotesContext();
    const [showHistory, setShowHistory] = useState(false);
    const queryClient = useQueryClient();
    const theme = useThemeStore((state) => state.theme);

    const dateString = format(selectedDate, "yyyy-MM-dd");
    const { data: note, isLoading } = useNoteData(selectedDate);

    const noteId =
        note && typeof note === "object" && "id" in note ? (note as any).id : null;

    const { handleSave } = useNoteSave({ selectedDate, noteId });

    const { content, mood, setMood, handleContentChange, handleTemplateApply } = useNoteState({
        note,
        onAutoSave: handleSave,
    });

    const {
        data: history,
        refetch: refetchHistory,
    } = useNoteHistory({
        noteId,
        enabled: showHistory,
    });

    const handleRestore = async (historyId: string) => {
        if (!note || !("id" in note)) return;
        if (!confirm("Are you sure?")) return;

        try {
            const response = await fetch(`/api/notes/${(note as any).id}/restore/${historyId}`, {
                method: "POST",
                credentials: "include",
            });
            if (!response.ok) throw new Error("Failed");
            queryClient.invalidateQueries({ queryKey: ["note", dateString] });
            refetchHistory();
            setShowHistory(false);
        } catch {
            alert("Failed to restore version");
        }
    };

    const handleTodoChange = () => {
        queryClient.invalidateQueries({ queryKey: ["note", dateString] });
    };

    return (
        <>
            <div style={{ viewTransitionName: "page" } as any}>
                <NoteEditTemplate
                    selectedDate={selectedDate}
                    mood={mood}
                    onMoodChange={setMood}
                    content={content}
                    onContentChange={handleContentChange}
                    onEditorFocus={() => { }}
                    onEditorBlur={() => { }}
                    isLoading={isLoading}
                    theme={theme}
                    onShowShortcuts={() => { }}
                    onTemplateApply={handleTemplateApply}
                    hasNote={!!(note && "id" in note)}
                    onShowHistory={() => setShowHistory(true)}
                    noteId={noteId}
                    noteDate={dateString}
                    onTodoChange={handleTodoChange}
                />
            </div>

            <HistoryDialog
                open={showHistory}
                onOpenChange={setShowHistory}
                history={history as any}
                selectedDate={selectedDate}
                onRestore={handleRestore}
            />
        </>
    );
}
