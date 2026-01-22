import { useLocation } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import type { SaveStatus } from "@/types/mindspace/view.types";
import { SaveIndicator } from "../atoms/SaveIndicator";
import { DateNavigation } from "../molecules/DateNavigation";
import { ViewTransitionNavBar } from "../molecules/ViewTransitionNavBar";

interface NoteHeaderProps {
    selectedDate: Date;
    calendarOpen: boolean;
    onCalendarOpenChange: (open: boolean) => void;
    onDateSelect: (date: Date | undefined) => void;
    onPrevDay: () => void;
    onNextDay: () => void;
    saveStatus: SaveStatus;

    // Legacy props (optional now, to be removed)
    viewMode?: any;
    onViewModeChange?: any;
}

/**
 * Organism: Complete header with title, view toggle, and date navigation
 */
export const NoteHeader = ({
    selectedDate,
    calendarOpen,
    onCalendarOpenChange,
    onDateSelect,
    onPrevDay,
    onNextDay,
    saveStatus,
}: NoteHeaderProps) => {
    const location = useLocation();
    const isJournal = location.pathname.includes("/journal");
    const isHabits = location.pathname.includes("/habits");
    const showDateNav = isJournal || isHabits;
    const showSaveStatus = isJournal;

    return (
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-4 md:p-6 sticky top-4 z-50">
            <div className="flex flex-col gap-4">
                {/* Title and View Toggle */}
                <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
                    <h1 className="hidden md:flex text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent flex items-center gap-2">
                        <Sparkles size={28} />
                        Mindspace
                    </h1>

                    <ViewTransitionNavBar />
                </div>

                {/* Date Navigation - only show in note/habit views */}
                {showDateNav && (
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
                        <DateNavigation
                            selectedDate={selectedDate}
                            calendarOpen={calendarOpen}
                            onCalendarOpenChange={onCalendarOpenChange}
                            onDateSelect={onDateSelect}
                            onPrevDay={onPrevDay}
                            onNextDay={onNextDay}
                        />
                    </div>
                )}

                {/* Save Status - only for Journal */}
                {showSaveStatus && <SaveIndicator status={saveStatus} />}
            </div>
        </div>
    );
};
