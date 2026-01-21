import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DateNavigationButtonProps {
    direction: "prev" | "next";
    onClick: () => void;
}

/**
 * Atom: Navigation button for previous/next day
 */
export const DateNavigationButton = ({ direction, onClick }: DateNavigationButtonProps) => {
    const Icon = direction === "prev" ? ChevronLeft : ChevronRight;

    return (
        <Button
            variant="outline"
            size="icon"
            onClick={onClick}
            className="shrink-0"
            aria-label={direction === "prev" ? "Previous day" : "Next day"}
        >
            <Icon size={20} />
        </Button>
    );
};
