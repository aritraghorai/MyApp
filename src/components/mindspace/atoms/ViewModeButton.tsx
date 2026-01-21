import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ViewModeButtonProps {
    icon: LucideIcon;
    label: string;
    isActive: boolean;
    onClick: () => void;
}

/**
 * Atom: Individual view mode toggle button
 */
export const ViewModeButton = ({ icon: Icon, label, isActive, onClick }: ViewModeButtonProps) => {
    return (
        <Button
            size="sm"
            variant={isActive ? "default" : "ghost"}
            onClick={onClick}
            className="gap-2"
        >
            <Icon size={16} />
            <span className="hidden sm:inline">{label}</span>
        </Button>
    );
};
