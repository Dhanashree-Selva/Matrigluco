import React from "react";
import { Calendar } from "../../../../shared/ui";

interface AppointmentCalendarProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  timezone?: string;
  className?: string;
}

export function AppointmentCalendar({
  selectedDate,
  onSelectDate,
  timezone = "Asia/Kolkata",
  className = "",
}: AppointmentCalendarProps) {
  return (
    <div className={`p-4 rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-2xs space-y-3 ${className}`}>
      <div className="flex items-center justify-between px-1">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
          1. Select Date
        </h3>
        <span className="text-[11px] font-medium text-[var(--muted-foreground)]">
          Timezone: {timezone}
        </span>
      </div>

      <div className="flex justify-center">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={(d) => {
            if (d) onSelectDate(d);
          }}
          disabled={(date) => {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            return date < today;
          }}
          className="rounded-xl border border-[var(--border)] bg-[var(--background)]"
        />
      </div>
    </div>
  );
}
