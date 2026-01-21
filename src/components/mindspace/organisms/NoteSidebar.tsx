import type { SidebarView } from "@/types/mindspace/view.types";
import { SidebarNavigation } from "../molecules/SidebarNavigation";
import { HabitTracker } from "./HabitTracker";
import { TodoDashboard } from "./TodoDashboard";

interface NoteSidebarProps {
    sidebarView: SidebarView;
    onSidebarViewChange: (view: SidebarView) => void;
    noteId: string | null;
    noteDate: string;
    selectedDate: Date;
    onTodoChange: () => void;
}

/**
 * Organism: Complete sidebar with todos/habits views
 */
export const NoteSidebar = ({
    sidebarView,
    onSidebarViewChange,
    noteId,
    noteDate,
    selectedDate,
    onTodoChange,
}: NoteSidebarProps) => {
    return (
        <div className="space-y-4">
            <SidebarNavigation currentView={sidebarView} onViewChange={onSidebarViewChange} />

            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-4 md:p-6">
                {sidebarView === "todos" && noteId && (
                    <TodoDashboard
                        noteId={noteId}
                        noteDate={noteDate}
                        onTodoChange={onTodoChange}
                    />
                )}
                {sidebarView === "habits" && <HabitTracker date={selectedDate} />}
            </div>
        </div>
    );
};
