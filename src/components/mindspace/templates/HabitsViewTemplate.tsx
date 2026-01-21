import type { SaveStatus, ViewMode } from "@/types/mindspace/view.types";
import { HabitsView } from "../organisms/HabitsView";
import { NoteHeader } from "../organisms/NoteHeader";

interface HabitsViewTemplateProps {
    viewMode: ViewMode;
    onViewModeChange: (mode: ViewMode) => void;
    selectedDate: Date;
}

/**
 * Template: Layout for habits view
 */
export const HabitsViewTemplate = ({
    viewMode,
    onViewModeChange,
    selectedDate,
}: HabitsViewTemplateProps) => {
    return (
        <div className="space-y-4 md:space-y-6">
            {/* Header */}
            <NoteHeader
                viewMode={viewMode}
                onViewModeChange={onViewModeChange}
                selectedDate={selectedDate}
                calendarOpen={false}
                onCalendarOpenChange={() => { }}
                onDateSelect={() => { }}
                onPrevDay={() => { }}
                onNextDay={() => { }}
                saveStatus={"idle" as SaveStatus}
            />

            {/* Habits View */}
            <HabitsView date={selectedDate} />
        </div>
    );
};
