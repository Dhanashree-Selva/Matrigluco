import { ReactNode } from "react";
import { SparklesIcon } from "@hugeicons/core-free-icons";
import { AppIcon } from "../common/AppIcon";

export interface HealthHorizonProps {
  eyebrow?: string;
  title: string;
  narrative: string;
  statusLabel?: string;
  statusBadge?: ReactNode;
  timestamp?: string;
  primaryAction?: ReactNode;
  supportingSignal?: ReactNode;
  className?: string;
}

export function HealthHorizon({
  eyebrow = "Health Overview",
  title,
  narrative,
  statusBadge,
  timestamp,
  primaryAction,
  supportingSignal,
  className = "",
}: HealthHorizonProps) {
  return (
    <section
      aria-label="Health Horizon"
      className={`relative overflow-hidden rounded-md p-6 sm:p-8 bg-[var(--card)] border border-[var(--border-pink)] shadow-xs transition-all ${className}`}
    >
      {/* Soft blush radial wash */}
      <div
        className="absolute top-0 right-0 w-96 h-96 bg-[var(--accent-soft)] rounded-md -mr-28 -mt-28 blur-3xl pointer-events-none opacity-60 dark:opacity-25"
        aria-hidden="true"
      />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="max-w-2xl space-y-3">
          <div className="flex items-center gap-2 text-[var(--primary)] font-semibold text-xs uppercase tracking-wider">
            <AppIcon icon={SparklesIcon} size="xs" />
            <span>{eyebrow}</span>
            {statusBadge && <div className="ml-2">{statusBadge}</div>}
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold text-[var(--foreground)] tracking-tight">
            {title}
          </h2>

          <p className="text-sm text-[var(--text-secondary)] leading-relaxed font-medium">
            {narrative}
          </p>

          {timestamp && (
            <p className="text-xs text-[var(--muted-foreground)] font-medium">
              Last updated {timestamp}
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 shrink-0">
          {supportingSignal}
          {primaryAction}
        </div>
      </div>
    </section>
  );
}
