import { Circle } from "lucide-react";
import type { Todo, TodoFilter } from "@/types/mindspace/todo.types";
import { TodoEmptyState } from "../atoms/TodoEmptyState";
import { TodoItem } from "../molecules/TodoItem";

interface TodoListProps {
    todos: Todo[];
    filter: TodoFilter;
    onToggle: (todoId: string, completed: boolean) => void;
    onDelete?: (todoId: string) => void;
    showDates?: boolean;
    variant?: "default" | "compact";
}

/**
 * Organism: List of todos with filtering
 */
export const TodoList = ({
    todos,
    filter,
    onToggle,
    onDelete,
    showDates = false,
    variant = "default"
}: TodoListProps) => {
    // Filter todos
    const filteredTodos = todos.filter((todo) => {
        if (filter === "active") return !todo.completed;
        if (filter === "completed") return todo.completed;
        return true;
    });

    // Separate by completion status
    const activeTodos = filteredTodos.filter(t => !t.completed);
    const completedTodos = filteredTodos.filter(t => t.completed);

    // If no todos match filter
    if (filteredTodos.length === 0) {
        if (filter === "all" && todos.length === 0) {
            return <TodoEmptyState />;
        }
        return (
            <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                <Circle size={32} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">No {filter} todos</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Active Todos */}
            {activeTodos.length > 0 && (
                <div className="space-y-3">
                    {filter === "all" && (
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                            Active Tasks ({activeTodos.length})
                        </h3>
                    )}
                    {activeTodos.map((todo) => (
                        <TodoItem
                            key={todo.id}
                            todo={todo}
                            onToggle={() => onToggle(todo.id, !todo.completed)}
                            onDelete={onDelete ? () => onDelete(todo.id) : undefined}
                            showDate={showDates}
                            variant={variant}
                        />
                    ))}
                </div>
            )}

            {/* Completed Todos */}
            {completedTodos.length > 0 && (
                <div className="space-y-3">
                    {filter === "all" && (
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                            Completed Tasks ({completedTodos.length})
                        </h3>
                    )}
                    {completedTodos.map((todo) => (
                        <TodoItem
                            key={todo.id}
                            todo={todo}
                            onToggle={() => onToggle(todo.id, !todo.completed)}
                            onDelete={onDelete ? () => onDelete(todo.id) : undefined}
                            showDate={showDates}
                            variant={variant}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};
