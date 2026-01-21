import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
    icon: LucideIcon;
    message: string;
}

/**
 * Atom: Generic empty state display
 */
export const EmptyState = ({ icon: Icon, message }: EmptyStateProps) => {
    return (
        <div className="col-span-full text-center py-12">
            <Icon size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
            <p className="text-gray-500 dark:text-gray-400">{message}</p>
        </div>
    );
};
