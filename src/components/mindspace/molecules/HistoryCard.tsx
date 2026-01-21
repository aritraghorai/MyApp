import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDateTime, truncateContent } from "@/lib/mindspace/noteFormatters";
import type { NoteHistory } from "@/types/mindspace/note.types";

interface HistoryCardProps {
    history: NoteHistory;
    onRestore: (historyId: string) => void;
}

/**
 * Molecule: Individual history version card
 */
export const HistoryCard = ({ history, onRestore }: HistoryCardProps) => {
    return (
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-start justify-between gap-2 mb-2">
                <div className="text-xs text-gray-500 dark:text-gray-400">
                    {formatDateTime(history.createdAt)}
                </div>
                <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => onRestore(history.id)}
                    className="text-purple-600 hover:text-purple-700 dark:text-purple-400"
                >
                    <RotateCcw size={14} className="mr-1" />
                    Restore
                </Button>
            </div>
            <div className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3">
                {truncateContent(history.content, 150)}
            </div>
        </div>
    );
};
