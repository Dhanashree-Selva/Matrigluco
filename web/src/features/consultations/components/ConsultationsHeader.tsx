import React from "react";
import { Button } from "../../../shared/ui";
import { AppIcon } from "../../../components/common/AppIcon";
import { CalendarAdd01Icon, Clock01Icon } from "@hugeicons/core-free-icons";

interface ConsultationsHeaderProps {
  upcomingCount?: number;
  onScheduleClick?: () => void;
}

export function ConsultationsHeader({
  upcomingCount = 0,
  onScheduleClick,
}: ConsultationsHeaderProps) {
  return (
    <header className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--foreground)]">
            Consultations
          </h1>
          {upcomingCount > 0 && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[var(--accent-soft)] text-[var(--primary)] border border-[var(--primary)]/20">
              <AppIcon icon={Clock01Icon} size="xxs" />
              {upcomingCount} Active {upcomingCount === 1 ? "Session" : "Sessions"}
            </span>
          )}
        </div>
        <p className="text-xs sm:text-sm text-[var(--muted-foreground)] mt-1">
          Coordinate maternal-fetal specialist appointments, video consults, and clinical care episodes.
        </p>
      </div>

      {onScheduleClick && (
        <div className="flex items-center gap-2 shrink-0">
          <Button
            type="button"
            onClick={onScheduleClick}
            className="gap-2 text-xs font-semibold bg-[var(--primary)] text-white hover:bg-[var(--primary)]/90 shadow-2xs"
            size="sm"
          >
            <AppIcon icon={CalendarAdd01Icon} size="sm" />
            Book Consultation
          </Button>
        </div>
      )}
    </header>
  );
}
