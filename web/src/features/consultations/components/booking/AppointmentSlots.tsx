import React from "react";
import { TimeSlot } from "../../types/consultation.types";
import { AppIcon } from "../../../../components/common/AppIcon";
import { Sun01Icon, Sun02Icon, Moon02Icon } from "@hugeicons/core-free-icons";

interface AppointmentSlotsProps {
  slots: TimeSlot[];
  morningSlots: TimeSlot[];
  afternoonSlots: TimeSlot[];
  eveningSlots: TimeSlot[];
  selectedSlot: string | null;
  onSelectSlot: (slotFormatted: string) => void;
  className?: string;
}

export function AppointmentSlots({
  slots,
  morningSlots,
  afternoonSlots,
  eveningSlots,
  selectedSlot,
  onSelectSlot,
  className = "",
}: AppointmentSlotsProps) {
  if (slots.length === 0 || !slots.some((s) => s.isAvailable)) {
    return (
      <div className={`p-6 text-center rounded-2xl bg-[var(--card)] border border-[var(--border)] text-xs text-[var(--muted-foreground)] ${className}`}>
        No times available on this date. Please choose another date on the calendar.
      </div>
    );
  }

  const renderPeriod = (
    title: string,
    periodSlots: TimeSlot[],
    icon: typeof Sun01Icon
  ) => {
    if (periodSlots.length === 0) return null;

    return (
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
          <AppIcon icon={icon} size="xxs" className="text-[var(--primary)]" />
          <span>{title}</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {periodSlots.map((slot) => {
            const isSelected = selectedSlot === slot.timeFormatted;

            return (
              <button
                key={slot.id}
                type="button"
                disabled={!slot.isAvailable}
                onClick={() => onSelectSlot(slot.timeFormatted)}
                aria-pressed={isSelected}
                className={`py-2 px-3 rounded-xl text-xs font-semibold text-center transition-all cursor-pointer border ${
                  isSelected
                    ? "bg-[var(--primary)] text-white border-[var(--primary)] shadow-xs"
                    : slot.isAvailable
                    ? "bg-[var(--background)] text-[var(--foreground)] border-[var(--border)] hover:border-[var(--primary)]/40 hover:bg-[var(--accent-soft)]"
                    : "opacity-35 bg-[var(--background)] text-[var(--muted-foreground)] border-dashed border-[var(--border)] cursor-not-allowed"
                }`}
              >
                {slot.timeFormatted}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className={`p-4 rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-2xs space-y-4 ${className}`}>
      <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--muted-foreground)] px-1">
        2. Select Time Slot
      </h3>

      <div className="space-y-4">
        {renderPeriod("Morning", morningSlots, Sun01Icon)}
        {renderPeriod("Afternoon", afternoonSlots, Sun02Icon)}
        {renderPeriod("Evening", eveningSlots, Moon02Icon)}
      </div>
    </div>
  );
}
