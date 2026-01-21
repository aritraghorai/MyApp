import { CheckSquare, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { SidebarView } from "@/types/mindspace/view.types";

interface SidebarNavigationProps {
    currentView: SidebarView;
    onViewChange: (view: SidebarView) => void;
}

/**
 * Molecule: Sidebar view switcher
 */
export const SidebarNavigation = ({ currentView, onViewChange }: SidebarNavigationProps) => {
    return (
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-2">
            <div className="flex gap-1">
                <Button
                    size="sm"
                    variant={currentView === "todos" ? "default" : "ghost"}
                    onClick={() => onViewChange("todos")}
                    className="flex-1 gap-2"
                >
                    <CheckSquare size={16} />
                    Todos
                </Button>
                <Button
                    size="sm"
                    variant={currentView === "habits" ? "default" : "ghost"}
                    onClick={() => onViewChange("habits")}
                    className="flex-1 gap-2"
                >
                    <Target size={16} />
                    Habits
                </Button>
            </div>
        </div>
    );
};
