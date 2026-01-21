import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { format } from "date-fns";
import { useState } from "react";
import { HistoryDialog } from "@/components/mindspace/organisms/HistoryDialog";
import { HabitsViewTemplate } from "@/components/mindspace/templates/HabitsViewTemplate";
import { ListViewTemplate } from "@/components/mindspace/templates/ListViewTemplate";
import { NoteViewTemplate } from "@/components/mindspace/templates/NoteViewTemplate";
import { TodosViewTemplate } from "@/components/mindspace/templates/TodosViewTemplate";
import { useDateNavigation } from "@/hooks/mindspace/useDateNavigation";
import { useNoteData } from "@/hooks/mindspace/useNoteData";
import { useNoteHistory } from "@/hooks/mindspace/useNoteHistory";
import { useNoteSave } from "@/hooks/mindspace/useNoteSave";
import { useNoteState } from "@/hooks/mindspace/useNoteState";
import { useRecentNotes } from "@/hooks/mindspace/useRecentNotes";
import { useThemeStore } from "@/stores/useThemeStore";
import type { ViewMode } from "@/types/mindspace/view.types";

export const Route = createFileRoute("/_authed/notes/")({
	component: RouteComponent,
});

function RouteComponent() {
	const [viewMode, setViewMode] = useState<ViewMode>("note");
	const [showHistory, setShowHistory] = useState(false);
	const [showShortcuts, setShowShortcuts] = useState(false);
	const queryClient = useQueryClient();
	const theme = useThemeStore((state) => state.theme);

	// Date navigation
	const {
		selectedDate,
		setSelectedDate,
		calendarOpen,
		setCalendarOpen,
		handleDateSelect,
		handlePrevDay,
		handleNextDay,
	} = useDateNavigation();

	const dateString = format(selectedDate, "yyyy-MM-dd");

	// Fetch note data
	const { data: note, isLoading } = useNoteData(selectedDate);

	const noteId =
		note && typeof note === "object" && "id" in note ? (note as any).id : null;

	// Save functionality
	const { handleSave, saveStatus } = useNoteSave({ selectedDate, noteId });

	// Note state management
	const { content, mood, setMood, handleContentChange, handleTemplateApply } = useNoteState({
		note,
		onAutoSave: handleSave,
	});

	// Fetch recent notes for list view
	const { data: recentNotes } = useRecentNotes(viewMode === "list");

	// Fetch history
	const {
		data: history,
		refetch: refetchHistory,
	} = useNoteHistory({
		noteId,
		enabled: showHistory,
	});

	// Handle restore version
	const handleRestore = async (historyId: string) => {
		if (!note || !("id" in note)) return;

		if (
			!confirm(
				"Are you sure you want to restore this version? Your current content will be saved to history."
			)
		) {
			return;
		}

		try {
			const response = await fetch(`/api/notes/${(note as any).id}/restore/${historyId}`, {
				method: "POST",
				credentials: "include",
			});
			if (!response.ok) {
				alert("Failed to restore version");
				return;
			}
			queryClient.invalidateQueries({ queryKey: ["note", dateString] });
			refetchHistory();
			setShowHistory(false);
		} catch {
			alert("Failed to restore version");
		}
	};

	// Handle note click in list view
	const handleNoteClick = (date: string) => {
		setSelectedDate(new Date(date));
		setViewMode("note");
	};

	// Handle todo change
	const handleTodoChange = () => {
		queryClient.invalidateQueries({ queryKey: ["note", dateString] });
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
			<div className="max-w-[1800px] mx-auto p-4 md:p-6">
				{/* Render appropriate template based on view mode */}
				{viewMode === "note" ? (
					<NoteViewTemplate
						viewMode={viewMode}
						onViewModeChange={setViewMode}
						selectedDate={selectedDate}
						calendarOpen={calendarOpen}
						onCalendarOpenChange={setCalendarOpen}
						onDateSelect={handleDateSelect}
						onPrevDay={handlePrevDay}
						onNextDay={handleNextDay}
						saveStatus={saveStatus}
						mood={mood}
						onMoodChange={setMood}
						content={content}
						onContentChange={handleContentChange}
						onEditorFocus={() => { }}
						onEditorBlur={() => { }}
						isLoading={isLoading}
						theme={theme}
						onShowShortcuts={() => setShowShortcuts(true)}
						onTemplateApply={(templateContent) => {
							handleTemplateApply(templateContent);
							setViewMode("note");
						}}
						hasNote={!!(note && "id" in note)}
						onShowHistory={() => setShowHistory(true)}
						noteId={noteId}
						noteDate={dateString}
						onTodoChange={handleTodoChange}
					/>
				) : viewMode === "list" ? (
					<ListViewTemplate
						viewMode={viewMode}
						onViewModeChange={setViewMode}
						notes={recentNotes as any}
						onNoteClick={handleNoteClick}
					/>
				) : viewMode === "todos" ? (
					<TodosViewTemplate viewMode={viewMode} onViewModeChange={setViewMode} />
				) : (
					<HabitsViewTemplate
						viewMode={viewMode}
						onViewModeChange={setViewMode}
						selectedDate={selectedDate}
					/>
				)}
			</div>

			{/* History Dialog */}
			<HistoryDialog
				open={showHistory}
				onOpenChange={setShowHistory}
				history={history as any}
				selectedDate={selectedDate}
				onRestore={handleRestore}
			/>
		</div>
	);
}
