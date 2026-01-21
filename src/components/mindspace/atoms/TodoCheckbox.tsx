import { CheckSquare, Square } from "lucide-react";

interface TodoCheckboxProps {
    completed: boolean;
    onClick: () => void;
}

/**
 * Atom: Todo checkbox icon
 */
export const TodoCheckbox = ({ completed, onClick }: TodoCheckboxProps) => {
    return (
        <button
            type="button"
            onClick={onClick}
            className="mt-0.5 shrink-0"
            aria-label={completed ? "Mark as incomplete" : "Mark as complete"}
        >
            {completed ? (
                <CheckSquare size={20} className="text-green-600 dark:text-green-400" />
            ) : (
                <Square size={20} className="text-gray-400 hover:text-purple-600" />
            )}
        </button>
    );
};
