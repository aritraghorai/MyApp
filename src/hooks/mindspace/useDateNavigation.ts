import { addDays, subDays } from "date-fns";
import { useCallback, useState } from "react";

/**
 * Hook to manage date navigation
 */
export const useDateNavigation = (initialDate: Date = new Date()) => {
    const [selectedDate, setSelectedDate] = useState<Date>(initialDate);
    const [calendarOpen, setCalendarOpen] = useState(false);

    const handleDateSelect = useCallback((date: Date | undefined) => {
        if (date) {
            setSelectedDate(date);
            setCalendarOpen(false);
        }
    }, []);

    const handlePrevDay = useCallback(() => {
        setSelectedDate((prev) => subDays(prev, 1));
    }, []);

    const handleNextDay = useCallback(() => {
        setSelectedDate((prev) => addDays(prev, 1));
    }, []);

    return {
        selectedDate,
        setSelectedDate,
        calendarOpen,
        setCalendarOpen,
        handleDateSelect,
        handlePrevDay,
        handleNextDay,
    };
};
