import { format } from "date-fns";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Todo } from "@/types/mindspace/todo.types";
import { PRIORITY_COLORS, PRIORITY_COLORS_BORDER } from "@/types/mindspace/todo.types";
import { PriorityBadge } from "../atoms/PriorityBadge";
import { TodoCheckbox } from "../atoms/TodoCheckbox";

interface TodoItemProps {
    todo: Todo;
    onToggle: () => void;
    onDelete?: () => void;
    showDate?: boolean;
    variant?: "default" | "compact";
}

/**
 * Molecule: Individual todo item
 */
export const TodoItem = ({
    todo,
    onToggle,
    onDelete,
    showDate = false,
    variant = "default"
}: TodoItemProps) => {
    const isCompact = variant === "compact";
    const colorClass = todo.completed
        ? "bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700"
        : `bg-white dark:bg-gray-800 ${isCompact ? PRIORITY_COLORS_BORDER[todo.priority] : PRIORITY_COLORS[todo.priority]}`;

    return (
        <div
            className={`group flex items-start gap-3 ${isCompact ? "p-3" : "p-4"} rounded-lg border-2 transition-all ${colorClass}`}
        >
            {/* Checkbox */}
            <TodoCheckbox completed={todo.completed} onClick={onToggle} />

            {/* Content */}
            <div className="flex-1 min-w-0">
                <p
                    className={`text-sm ${todo.completed
                            ? "line-through text-gray-500 dark:text-gray-400"
                            : "text-gray-900 dark:text-gray-100 font-medium"
                        }`}
                >
                    {todo.content}
                </p>
                {showDate && todo.note && (
                    <p className={`text-xs mt-1 ${todo.completed ? "text-gray-400 dark:text-gray-500" : "text-gray-500 dark:text-gray-400"}`}>
                        📅 {format(new Date(todo.note.date), "MMM d, yyyy")}
                    </p>
                )}
            </div>

            {/* Priority badge */}
            {!todo.completed && (
                <PriorityBadge
                    priority={todo.priority}
                    variant={isCompact ? "light" : "solid"}
                />
            )}

            {/* Delete button */}
            {onDelete && (
                <Button
                    size="icon"
                    variant="ghost"
                    onClick={onDelete}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 h-8 w-8"
                >
                    <Trash2 size={16} />
                </Button>
            )}
        </div>
    );
};
