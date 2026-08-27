import {
  Tick01Icon,
  Loading03Icon,
  AlertCircleIcon,
} from "@hugeicons/core-free-icons";
import { AppIcon } from "../../../components/common/AppIcon";
import { ReportProcessingStatus } from "../types/reports.types";

interface ProcessingRibbonProps {
  status: ReportProcessingStatus;
  className?: string;
  size?: "sm" | "default";
}

const STEPS = [
  { key: "uploaded", label: "Uploaded" },
  { key: "processing", label: "Processing" },
  { key: "extracted", label: "Extracted" },
  { key: "reviewed", label: "Reviewed" },
];

export function ProcessingRibbon({
  status,
  className = "",
  size = "default",
}: ProcessingRibbonProps) {
  const getStepIndex = (st: ReportProcessingStatus) => {
    switch (st) {
      case "uploaded":
        return 0;
      case "processing":
        return 1;
      case "extracted":
        return 2;
      case "reviewed":
        return 3;
      case "failed":
        return 1;
      default:
        return 0;
    }
  };

  const currentIndex = getStepIndex(status);
  const isFailed = status === "failed";

  return (
    <div
      className={`flex items-center gap-1.5 select-none ${className}`}
      aria-label={`Workflow state: ${status}`}
    >
      {STEPS.map((step, idx) => {
        const isPast = idx < currentIndex;
        const isCurrent = idx === currentIndex;
        const isFuture = idx > currentIndex;

        return (
          <div key={step.key} className="flex items-center gap-1.5">
            {/* Step Node */}
            <div className="flex items-center gap-1">
              <div
                className={`flex items-center justify-center rounded-full transition-all ${
                  size === "sm" ? "w-3.5 h-3.5 text-[9px]" : "w-4 h-4 text-[10px]"
                } ${
                  isFailed && isCurrent
                    ? "bg-destructive text-white"
                    : isPast || (isCurrent && status === "reviewed")
                    ? "bg-[var(--primary)] text-white"
                    : isCurrent
                    ? "bg-[var(--accent-soft)] text-[var(--primary)] border border-[var(--primary)]/40 animate-pulse"
                    : "bg-[var(--surface-soft)] text-[var(--muted-foreground)] border border-[var(--border-subtle)]"
                }`}
              >
                {isFailed && isCurrent ? (
                  <AppIcon icon={AlertCircleIcon} size="xxs" />
                ) : isPast || (isCurrent && status === "reviewed") ? (
                  <AppIcon icon={Tick01Icon} size="xxs" />
                ) : isCurrent && status === "processing" ? (
                  <AppIcon icon={Loading03Icon} size="xxs" className="animate-spin" />
                ) : (
                  <span className="font-mono leading-none">{idx + 1}</span>
                )}
              </div>

              <span
                className={`text-[10px] font-bold ${
                  isCurrent
                    ? isFailed
                      ? "text-destructive"
                      : "text-[var(--foreground)]"
                    : isPast
                    ? "text-[var(--muted-foreground)]"
                    : "text-[var(--muted-foreground)]/60"
                }`}
              >
                {step.label}
              </span>
            </div>

            {/* Separator connector */}
            {idx < STEPS.length - 1 && (
              <div
                className={`w-3 sm:w-4 h-[2px] rounded-full ${
                  idx < currentIndex
                    ? "bg-[var(--primary)]"
                    : "bg-[var(--border-subtle)]"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
