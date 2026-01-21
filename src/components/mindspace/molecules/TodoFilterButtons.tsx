import { Button } from "@/components/ui/button";
import type { TodoFilter } from "@/types/mindspace/todo.types";

interface TodoFilterButtonsProps {
    currentFilter: TodoFilter;
    onFilterChange: (filter: TodoFilter) => void;
    totalCount: number;
    activeCount: number;
    completedCount: number;
}

/**
 * Molecule: Todo filter buttons
 */
export const TodoFilterButtons = ({
    currentFilter,
    onFilterChange,
    totalCount,
    activeCount,
    completedCount,
}: TodoFilterButtonsProps) => {
    return (
        <div className="flex gap-2">
            <Button
                size="sm"
                variant={currentFilter === "all" ? "default" : "outline"}
                onClick={() => onFilterChange("all")}
            >
                All ({totalCount})
            </Button>
            <Button
                size="sm"
                variant={currentFilter === "active" ? "default" : "outline"}
                onClick={() => onFilterChange("active")}
            >
                Active ({activeCount})
            </Button>
            <Button
                size="sm"
                variant={currentFilter === "completed" ? "default" : "outline"}
                onClick={() => onFilterChange("completed")}
            >
                Done ({completedCount})
            </Button>
        </div>
    );
};
