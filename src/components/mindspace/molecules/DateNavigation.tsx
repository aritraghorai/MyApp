import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DateNavigationButton } from "../atoms/DateNavigationButton";

interface DateNavigationProps {
    selectedDate: Date;
    calendarOpen: boolean;
    onCalendarOpenChange: (open: boolean) => void;
    onDateSelect: (date: Date | undefined) => void;
    onPrevDay: () => void;
    onNextDay: () => void;
}

/**
 * Molecule: Complete date navigation with calendar picker
 */
export const DateNavigation = ({
    selectedDate,
    calendarOpen,
    onCalendarOpenChange,
    onDateSelect,
    onPrevDay,
    onNextDay,
}: DateNavigationProps) => {
    return (
        <div className="flex items-center gap-2 flex-1">
            <DateNavigationButton direction="prev" onClick={onPrevDay} />

            <Popover open={calendarOpen} onOpenChange={onCalendarOpenChange}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        className="flex-1 sm:flex-initial sm:min-w-[240px] justify-start text-left font-normal"
                    >
                        <CalendarIcon className="mr-2 shrink-0" size={16} />
                        <span className="truncate hidden sm:inline">
                            {format(selectedDate, "EEEE, MMMM d, yyyy")}
                        </span>
                        <span className="truncate sm:hidden">
                            {format(selectedDate, "EEE, MMM d, yyyy")}
                        </span>
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="center">
                    <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={onDateSelect}
                        initialFocus
                    />
                </PopoverContent>
            </Popover>

            <DateNavigationButton direction="next" onClick={onNextDay} />
        </div>
    );
};
