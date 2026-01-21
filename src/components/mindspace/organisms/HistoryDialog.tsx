import { format } from "date-fns";
import { History } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import type { NoteHistory } from "@/types/mindspace/note.types";
import { HistoryCard } from "../molecules/HistoryCard";

interface HistoryDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    history: NoteHistory[] | undefined;
    selectedDate: Date;
    onRestore: (historyId: string) => void;
}

/**
 * Organism: Version history modal
 */
export const HistoryDialog = ({
    open,
    onOpenChange,
    history,
    selectedDate,
    onRestore,
}: HistoryDialogProps) => {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <History size={20} />
                        Version History
                    </DialogTitle>
                    <DialogDescription>
                        View and restore previous versions of your note from{" "}
                        {format(selectedDate, "PPP")}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-3 mt-4">
                    {history && history.length > 0 ? (
                        history.map((item) => (
                            <HistoryCard key={item.id} history={item} onRestore={onRestore} />
                        ))
                    ) : (
                        <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
                            No history yet. Edit your note to create versions.
                        </p>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};
