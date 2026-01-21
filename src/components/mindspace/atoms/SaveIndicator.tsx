import { Save } from "lucide-react";
import type { SaveStatus } from "@/types/mindspace/view.types";

interface SaveIndicatorProps {
    status: SaveStatus;
}

/**
 * Atom: Shows the current save status
 */
export const SaveIndicator = ({ status }: SaveIndicatorProps) => {
    if (status === "idle") return null;

    return (
        <div className="flex items-center justify-center gap-2 text-sm">
            {status === "saving" ? (
                <>
                    <Save size={16} className="animate-pulse text-purple-500" />
                    <span className="text-purple-600 dark:text-purple-400">Saving...</span>
                </>
            ) : (
                <>
                    <Save size={16} className="text-green-500" />
                    <span className="text-green-600 dark:text-green-400">Saved</span>
                </>
            )}
        </div>
    );
};
