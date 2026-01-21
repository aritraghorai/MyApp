import { Sparkles } from "lucide-react";
import type { SaveStatus, ViewMode } from "@/types/mindspace/view.types";
import { SaveIndicator } from "../atoms/SaveIndicator";
import { DateNavigation } from "../molecules/DateNavigation";
import { ViewModeToggle } from "../molecules/ViewModeToggle";

interface NoteHeaderProps {
    viewMode: ViewMode;
    onViewModeChange: (mode: ViewMode) => void;
    selectedDate: Date;
    calendarOpen: boolean;
    onCalendarOpenChange: (open: boolean) => void;
    onDateSelect: (date: Date | undefined) => void;
    onPrevDay: () => void;
    onNextDay: () => void;
    saveStatus: SaveStatus;
    onTemplateApply?: (content: string) => void;
    onShowHistory?: () => void;
    hasNote?: boolean;
}

/**
 * Organism: Complete header with title, view toggle, and date navigation
 */
export const NoteHeader = ({
    viewMode,
    onViewModeChange,
    selectedDate,
    calendarOpen,
    onCalendarOpenChange,
    onDateSelect,
    onPrevDay,
    onNextDay,
    saveStatus,
}: NoteHeaderProps) => {
    return (
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-4 md:p-6">
            <div className="flex flex-col gap-4">
                {/* Title and View Toggle */}
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent flex items-center gap-2">
                        <Sparkles size={28} />
                        Mindspace
                    </h1>

                    <ViewModeToggle currentMode={viewMode} onModeChange={onViewModeChange} />
                </div>

                {/* Date Navigation - only show in note view */}
                {viewMode === "note" && (
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
                        <DateNavigation
                            selectedDate={selectedDate}
                            calendarOpen={calendarOpen}
                            onCalendarOpenChange={onCalendarOpenChange}
                            onDateSelect={onDateSelect}
                            onPrevDay={onPrevDay}
                            onNextDay={onNextDay}
                        />

                        {/* Template and History buttons placeholder */}
                        <div className="flex items-center gap-2">
                            {/* These will be added via composition from parent */}
                        </div>
                    </div>
                )}

                {/* Save Status */}
                {viewMode === "note" && <SaveIndicator status={saveStatus} />}
            </div>
        </div>
    );
};
