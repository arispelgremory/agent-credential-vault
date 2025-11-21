import { CalendarIcon } from "lucide-react";
import { Button } from "./ui/button";
import { format } from "date-fns";
import { Calendar } from "./ui/calendar";

export const DatePickerButton = ({
    label,
    date,
    showCalendar,
    onToggleCalendar,
    onSelect,
}: {
    label: string;
    date?: Date;
    showCalendar: boolean;
    onToggleCalendar: () => void;
    onSelect: (date: Date | undefined) => void;
}) => (
    <div className="relative">
        <label className="mb-1 block text-sm font-medium">{label}</label>
        <Button variant="outline" className="w-full justify-start text-left font-normal" onClick={onToggleCalendar}>
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, "PPP") : "Select date"}
        </Button>
        {showCalendar && (
            <div className="absolute z-10 mt-2 rounded-lg border bg-white shadow-lg">
                <Calendar mode="single" selected={date} onSelect={onSelect} className="rounded-lg" />
            </div>
        )}
    </div>
);
