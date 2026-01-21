import type { TodoPriority } from "@/types/mindspace/todo.types";
import { PRIORITY_BADGES, PRIORITY_BADGES_LIGHT } from "@/types/mindspace/todo.types";

interface PriorityBadgeProps {
    priority: TodoPriority;
    variant?: "solid" | "light";
}

/**
 * Atom: Priority badge label
 */
export const PriorityBadge = ({ priority, variant = "solid" }: PriorityBadgeProps) => {
    const colorClass = variant === "solid" ? PRIORITY_BADGES[priority] : PRIORITY_BADGES_LIGHT[priority];

    return (
        <span className={`text-xs px-2.5 py-1 rounded-full font-medium shrink-0 ${colorClass}`}>
            {priority}
        </span>
    );
};
