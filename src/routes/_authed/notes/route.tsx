import { createFileRoute, Outlet, useNavigate, useSearch } from "@tanstack/react-router";
import { format } from "date-fns";
import { useEffect } from "react";
import { z } from "zod";
import { NoteHeader } from "@/components/mindspace/organisms/NoteHeader";
import { NotesProvider } from "@/contexts/NotesContext";
import { useDateNavigation } from "@/hooks/mindspace/useDateNavigation";
import { useNoteData } from "@/hooks/mindspace/useNoteData";
import { useNoteSave } from "@/hooks/mindspace/useNoteSave";

const notesSearchSchema = z.object({
	date: z.string().optional(),
});

export const Route = createFileRoute("/_authed/notes")({
	validateSearch: notesSearchSchema,
	component: NotesLayout,
});

function NotesLayout() {
	const search = useSearch({ from: "/_authed/notes" });
	const navigate = useNavigate();

	// Initialize date from URL or default to today
	const initialDate = search.date ? new Date(search.date) : new Date();

	const {
		selectedDate,
		setSelectedDate,
		calendarOpen,
		setCalendarOpen,
		handleDateSelect,
		handlePrevDay,
		handleNextDay,
	} = useDateNavigation(initialDate);

	// Sync URL with selectedDate
	useEffect(() => {
		const dateStr = format(selectedDate, "yyyy-MM-dd");
		if (search.date !== dateStr) {
			navigate({
				to: ".",
				search: (old) => ({ ...old, date: dateStr }),
				replace: true,
			});
		}
	}, [selectedDate, navigate, search.date]);

	// We fetch save status logic here mainly for conditional display in Header/Context?
	// Note: useNoteSave needs noteId, which comes from useNoteData.
	const { data: note } = useNoteData(selectedDate);
	const noteId = note && typeof note === "object" && "id" in note ? (note as any).id : null;
	const { saveStatus } = useNoteSave({ selectedDate, noteId });

	return (
		<div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
			<div className="max-w-[1800px] mx-auto p-4 md:p-6 space-y-4 md:space-y-6">

				<NoteHeader
					selectedDate={selectedDate}
					calendarOpen={calendarOpen}
					onCalendarOpenChange={setCalendarOpen}
					onDateSelect={handleDateSelect}
					onPrevDay={handlePrevDay}
					onNextDay={handleNextDay}
					saveStatus={saveStatus}
				/>

				<div
					className="view-transition-container"
				>
					<NotesProvider value={{ selectedDate }}>
						<Outlet />
					</NotesProvider>
				</div>
			</div>
		</div>
	);
}
