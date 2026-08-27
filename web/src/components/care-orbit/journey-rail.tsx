import { CheckmarkCircle02Icon } from "@hugeicons/core-free-icons";
import { AppIcon } from "../common/AppIcon";

export interface JourneyStep {
  id: string;
  title: string;
  description?: string;
  status: "completed" | "current" | "upcoming";
}

export interface JourneyRailProps {
  title?: string;
  steps: JourneyStep[];
  className?: string;
}

export function JourneyRail({
  title = "Care Journey",
  steps,
  className = "",
}: JourneyRailProps) {
  return (
    <div
      className={`rounded-[24px] p-6 bg-[var(--card)] border border-[var(--border)] shadow-xs ${className}`}
      role="region"
      aria-label="Care Journey Milestones"
    >
      <h3 className="text-base font-bold text-[var(--foreground)] tracking-tight mb-5">
        {title}
      </h3>

      {/* Responsive layout: vertical on desktop, horizontal scroll on mobile */}
      <div className="flex flex-col sm:flex-row gap-4 sm:items-start justify-between relative">
        {steps.map((step, idx) => {
          const isCompleted = step.status === "completed";
          const isCurrent = step.status === "current";

          return (
            <div key={step.id} className="flex-1 flex sm:flex-col items-start gap-3 relative">
              {/* Step indicator */}
              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-md flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                    isCompleted
                      ? "bg-[var(--success)] text-white"
                      : isCurrent
                      ? "bg-[var(--primary)] text-white ring-4 ring-[var(--accent-soft)]"
                      : "bg-[var(--surface-soft)] text-[var(--muted-foreground)] border border-[var(--border)]"
                  }`}
                >
                  {isCompleted ? (
                    <AppIcon icon={CheckmarkCircle02Icon} size="xs" />
                  ) : (
                    idx + 1
                  )}
                </div>
              </div>

              <div>
                <h4
                  className={`text-sm font-bold ${
                    isCurrent
                      ? "text-[var(--primary)]"
                      : "text-[var(--foreground)]"
                  }`}
                >
                  {step.title}
                </h4>
                {step.description && (
                  <p className="text-xs text-[var(--muted-foreground)] font-medium mt-0.5 leading-snug">
                    {step.description}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
