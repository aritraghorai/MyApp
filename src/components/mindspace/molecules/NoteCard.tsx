import { format } from "date-fns";
import { FileText } from "lucide-react";
import { truncateContent } from "@/lib/mindspace/noteFormatters";
import type { NoteListItem } from "@/types/mindspace/note.types";

interface NoteCardProps {
    note: NoteListItem;
    onClick: () => void;
}

/**
 * Molecule: Individual note card for list view
 */
export const NoteCard = ({ note, onClick }: NoteCardProps) => {
    return (
        <div
            onClick={onClick}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 p-4 cursor-pointer hover:shadow-xl hover:scale-[1.02] transition-all"
        >
            <div className="flex items-start justify-between mb-2">
                <div className="text-sm font-medium text-purple-600 dark:text-purple-400">
                    {format(new Date(note.date), "MMM d, yyyy")}
                </div>
                <FileText size={16} className="text-gray-400" />
            </div>
            <div className="text-sm text-gray-700 dark:text-gray-300 line-clamp-4">
                {truncateContent(note.content, 150)}
            </div>
            <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                Updated {format(new Date(note.updatedAt), "h:mm a")}
            </div>
        </div>
    );
};
