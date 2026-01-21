import type { NoteListItem } from "@/types/mindspace/note.types";
import type { SaveStatus, ViewMode } from "@/types/mindspace/view.types";
import { NoteHeader } from "../organisms/NoteHeader";
import { NoteListView } from "../organisms/NoteListView";

interface ListViewTemplateProps {
    viewMode: ViewMode;
    onViewModeChange: (mode: ViewMode) => void;
    notes: NoteListItem[] | undefined;
    onNoteClick: (date: string) => void;
}

/**
 * Template: Layout for notes list view
 */
export const ListViewTemplate = ({
    viewMode,
    onViewModeChange,
    notes,
    onNoteClick,
}: ListViewTemplateProps) => {
    return (
        <div className="space-y-4 md:space-y-6">
            {/* Header (simplified for list view) */}
            <NoteHeader
                viewMode={viewMode}
                onViewModeChange={onViewModeChange}
                selectedDate={new Date()}
                calendarOpen={false}
                onCalendarOpenChange={() => { }}
                onDateSelect={() => { }}
                onPrevDay={() => { }}
                onNextDay={() => { }}
                saveStatus={"idle" as SaveStatus}
            />

            {/* List View */}
            <NoteListView notes={notes} onNoteClick={onNoteClick} />
        </div>
    );
};
