import { CheckSquare, Circle, FileText } from "lucide-react";
import { TodoStatCard, TodoStatCardCompact } from "../molecules/TodoStatCard";

interface TodoStatsProps {
    totalTodos: number;
    activeTodos: number;
    completionRate: number;
    variant?: "default" | "compact";
}

/**
 * Organism: Todo statistics dashboard
 */
export const TodoStats = ({
    totalTodos,
    activeTodos,
    completionRate,
    variant = "default"
}: TodoStatsProps) => {
    const isCompact = variant === "compact";

    if (isCompact) {
        return (
            <div className="grid grid-cols-3 gap-3">
                <TodoStatCardCompact value={totalTodos} label="Total" colorScheme="purple" />
                <TodoStatCardCompact value={totalTodos - activeTodos} label="Done" colorScheme="green" />
                <TodoStatCardCompact value={`${completionRate}%`} label="Rate" colorScheme="orange" />
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <TodoStatCard
                icon={CheckSquare}
                value={totalTodos}
                label="Total Tasks"
                colorScheme="purple"
            />
            <TodoStatCard
                icon={Circle}
                value={activeTodos}
                label="Active"
                colorScheme="green"
            />
            <TodoStatCard
                icon={FileText}
                value={`${completionRate}%`}
                label="Completion Rate"
                colorScheme="orange"
            />
        </div>
    );
};
