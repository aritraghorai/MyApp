import { CheckSquare } from "lucide-react";

interface TodoEmptyStateProps {
    size?: "sm" | "lg";
    message?: string;
}

/**
 * Atom: Empty state for todos
 */
export const TodoEmptyState = ({
    size = "sm",
    message = "No todos yet. Add checkboxes in your note:"
}: TodoEmptyStateProps) => {
    const iconSize = size === "lg" ? 64 : 48;

    return (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <CheckSquare size={iconSize} className="mx-auto mb-3 opacity-30" />
            <p className={size === "lg" ? "text-xl font-semibold mb-2" : ""}>{message}</p>
            <code className="text-sm bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded mt-2 inline-block">
                - [ ] Your task here
            </code>
        </div>
    );
};
