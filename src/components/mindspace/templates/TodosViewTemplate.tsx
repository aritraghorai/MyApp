import type { SaveStatus, ViewMode } from "@/types/mindspace/view.types";
import { AllTodos } from "../organisms/AllTodos";
import { NoteHeader } from "../organisms/NoteHeader";

interface TodosViewTemplateProps {
    viewMode: ViewMode;
    onViewModeChange: (mode: ViewMode) => void;
}

/**
 * Template: Layout for todos view
 */
export const TodosViewTemplate = ({ viewMode, onViewModeChange }: TodosViewTemplateProps) => {
    return (
        <div className="space-y-4 md:space-y-6">
            {/* Header */}
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

            {/* Todos View */}
            <AllTodos />
        </div>
    );
};
