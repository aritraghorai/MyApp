import { FileText, List, CheckSquare, TrendingUp } from "lucide-react";
import type { ViewMode } from "@/types/mindspace/view.types";
import { ViewModeButton } from "../atoms/ViewModeButton";

interface ViewModeToggleProps {
    currentMode: ViewMode;
    onModeChange: (mode: ViewMode) => void;
}

/**
 * Molecule: View mode toggle bar with all view options
 */
export const ViewModeToggle = ({ currentMode, onModeChange }: ViewModeToggleProps) => {
    return (
        <div className="flex gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <ViewModeButton
                icon={FileText}
                label="Note"
                isActive={currentMode === "note"}
                onClick={() => onModeChange("note")}
            />
            <ViewModeButton
                icon={List}
                label="List"
                isActive={currentMode === "list"}
                onClick={() => onModeChange("list")}
            />
            <ViewModeButton
                icon={CheckSquare}
                label="Tasks"
                isActive={currentMode === "todos"}
                onClick={() => onModeChange("todos")}
            />
            <ViewModeButton
                icon={TrendingUp}
                label="Habits"
                isActive={currentMode === "habits"}
                onClick={() => onModeChange("habits")}
            />
        </div>
    );
};
