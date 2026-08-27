import React from "react";
import { Button } from "../../../shared/ui";
import { AppIcon } from "../../../components/common/AppIcon";
import { Calendar01Icon, CalendarAdd01Icon } from "@hugeicons/core-free-icons";

interface ConsultationEmptyStateProps {
  title?: string;
  description?: string;
  onAction?: () => void;
  actionLabel?: string;
}

export function ConsultationEmptyState({
  title = "No consultations scheduled",
  description = "When you schedule a consultation with an obstetrician or endocrinologist, your active care episode will appear here.",
  onAction,
  actionLabel = "Find Available Clinicians",
}: ConsultationEmptyStateProps) {
  return (
    <div className="p-8 sm:p-12 text-center rounded-3xl bg-[var(--card)] border border-[var(--border)] max-w-xl mx-auto my-6">
      <div className="w-14 h-14 rounded-2xl bg-[var(--accent-soft)] text-[var(--primary)] flex items-center justify-center mx-auto mb-4 border border-[var(--primary)]/20 shadow-2xs">
        <AppIcon icon={Calendar01Icon} size="lg" />
      </div>

      <h3 className="text-base sm:text-lg font-bold text-[var(--foreground)] tracking-tight">
        {title}
      </h3>
      <p className="text-xs sm:text-sm text-[var(--muted-foreground)] max-w-md mx-auto mt-1.5 leading-relaxed">
        {description}
      </p>

      {onAction && (
        <div className="mt-6">
          <Button
            type="button"
            onClick={onAction}
            className="gap-2 text-xs font-semibold bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-white shadow-2xs"
            size="sm"
          >
            <AppIcon icon={CalendarAdd01Icon} size="sm" />
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
}

export function ConsultationsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse" aria-label="Loading Consultations">
      <div className="h-10 w-64 bg-[var(--border)] rounded-xl" />
      <div className="h-52 w-full bg-[var(--card)] border border-[var(--border)] rounded-3xl" />
      <div className="space-y-3 pt-4">
        <div className="h-6 w-48 bg-[var(--border)] rounded-lg" />
        <div className="h-28 w-full bg-[var(--card)] border border-[var(--border)] rounded-2xl" />
        <div className="h-28 w-full bg-[var(--card)] border border-[var(--border)] rounded-2xl" />
      </div>
    </div>
  );
}
