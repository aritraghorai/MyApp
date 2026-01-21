import { useQuery } from "@tanstack/react-query";
import { getTreaty } from "@/routes/api.$";
import type { Todo } from "@/types/mindspace/todo.types";
import { LoadingSpinner } from "../atoms/LoadingSpinner";
import { TodoEmptyState } from "../atoms/TodoEmptyState";
import { TodoList } from "./TodoList";
import { TodoStats } from "./TodoStats";

/**
 * Organism: Display all todos across all notes
 */
export function AllTodos() {
    const { data: todos = [], isLoading } = useQuery({
        queryKey: ["all-todos"],
        queryFn: async () => {
            const response = await getTreaty().notes.todos.incomplete.get();
            if (response.error) throw new Error("Failed to fetch todos");
            return (response.data || []);
        },
    });

    // Calculate stats
    const totalTodos = todos.length;
    const activeTodos = todos.filter((t) => !t.completed).length;
    const completedCount = todos.filter((t) => t.completed).length;
    const completionRate = totalTodos > 0 ? Math.round((completedCount / totalTodos) * 100) : 0;

    if (isLoading) {
        return <LoadingSpinner message="Loading todos..." />;
    }

    if (totalTodos === 0) {
        return (
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-12">
                <TodoEmptyState size="lg" message="No tasks yet" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Stats */}
            <TodoStats
                totalTodos={totalTodos}
                activeTodos={activeTodos}
                completionRate={completionRate}
                variant="default"
            />

            {/* Todo Lists (Active and Completed) */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-6">
                <TodoList
                    todos={todos}
                    filter="all"
                    onToggle={() => { }} // Read-only view for AllTodos
                    showDates
                    variant="default"
                />
            </div>
        </div>
    );
}
