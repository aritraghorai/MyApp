import { FileText } from "lucide-react";
import type { NoteListItem } from "@/types/mindspace/note.types";
import { EmptyState } from "../atoms/EmptyState";
import { NoteCard } from "../molecules/NoteCard";

interface NoteListViewProps {
    notes: NoteListItem[] | undefined;
    onNoteClick: (date: string) => void;
}

/**
 * Organism: Grid view of recent notes
 */
export const NoteListView = ({ notes, onNoteClick }: NoteListViewProps) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {notes && Array.isArray(notes) && notes.length > 0 ? (
                notes.map((note) => (
                    <NoteCard
                        key={note.id}
                        note={note}
                        onClick={() => onNoteClick(note.date)}
                    />
                ))
            ) : (
                <EmptyState
                    icon={FileText}
                    message="No notes yet. Switch to Note view to create your first note!"
                />
            )}
        </div>
    );
};
