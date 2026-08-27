import React from "react";
import { CareEpisodeStage } from "../types/consultation.types";
import { AppIcon } from "../../../components/common/AppIcon";
import {
  Calendar01Icon,
  DocumentValidationIcon,
  Video01Icon,
  CheckmarkCircle02Icon,
  Cancel01Icon,
} from "@hugeicons/core-free-icons";

interface ConsultationJourneyProps {
  currentStage: CareEpisodeStage;
  className?: string;
}

interface StageStep {
  key: CareEpisodeStage;
  label: string;
  sublabel: string;
  icon: typeof Calendar01Icon;
}

const STAGES: StageStep[] = [
  { key: "booked", label: "Booked", sublabel: "Appointment set", icon: Calendar01Icon },
  { key: "prepare", label: "Prepare", sublabel: "Records & readiness", icon: DocumentValidationIcon },
  { key: "consult", label: "Consult", sublabel: "Live interaction", icon: Video01Icon },
  { key: "complete", label: "Complete", sublabel: "Visit summary", icon: CheckmarkCircle02Icon },
];

export function ConsultationJourney({ currentStage, className = "" }: ConsultationJourneyProps) {
  if (currentStage === "cancelled") {
    return (
      <div className={`p-3.5 rounded-xl bg-rose-500/5 border border-rose-500/20 text-xs flex items-center gap-3 text-rose-700 dark:text-rose-300 ${className}`}>
        <div className="w-7 h-7 rounded-full bg-rose-500/15 flex items-center justify-center shrink-0">
          <AppIcon icon={Cancel01Icon} size="xs" />
        </div>
        <div>
          <p className="font-semibold text-xs">Care Episode Cancelled</p>
          <p className="text-[11px] opacity-80 mt-0.5">This appointment has been removed from active care scheduling.</p>
        </div>
      </div>
    );
  }

  const stageOrder: CareEpisodeStage[] = ["booked", "prepare", "consult", "complete"];
  const currentIndex = stageOrder.indexOf(currentStage);

  return (
    <nav
      aria-label="Care Episode Journey Progress"
      className={`w-full p-4 rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-2xs ${className}`}
    >
      <ol className="flex items-center justify-between relative w-full">
        {/* Background Connecting Rail */}
        <div
          className="absolute left-6 right-6 top-4 -translate-y-1/2 h-0.5 bg-[var(--border)] -z-0"
          aria-hidden="true"
        />

        {/* Active Progress Fill */}
        <div
          className="absolute left-6 top-4 -translate-y-1/2 h-0.5 bg-[var(--primary)] transition-all duration-300 -z-0"
          style={{
            width: `${Math.max(0, (currentIndex / (STAGES.length - 1)) * 100 - 8)}%`,
          }}
          aria-hidden="true"
        />

        {STAGES.map((st, idx) => {
          const isPassed = idx < currentIndex;
          const isCurrent = idx === currentIndex;
          const isPending = idx > currentIndex;

          return (
            <li
              key={st.key}
              aria-current={isCurrent ? "step" : undefined}
              className="flex flex-col items-center relative z-10 text-center flex-1"
            >
              {/* Stage Circle Indicator */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-200 border-2 ${
                  isPassed
                    ? "bg-[var(--primary)] text-white border-[var(--primary)] shadow-2xs"
                    : isCurrent
                    ? "bg-[var(--card)] text-[var(--primary)] border-[var(--primary)] ring-4 ring-[var(--accent-soft)]"
                    : "bg-[var(--card)] text-[var(--muted-foreground)] border-[var(--border)]"
                }`}
              >
                {isPassed ? (
                  <AppIcon icon={CheckmarkCircle02Icon} size="xs" />
                ) : (
                  <AppIcon icon={st.icon} size="xs" />
                )}
              </div>

              {/* Text Labels */}
              <span
                className={`mt-2 text-xs font-bold uppercase tracking-wider ${
                  isCurrent
                    ? "text-[var(--primary)]"
                    : isPassed
                    ? "text-[var(--foreground)]"
                    : "text-[var(--muted-foreground)] opacity-70"
                }`}
              >
                {st.label}
              </span>
              <span className="hidden sm:block text-[10px] text-[var(--muted-foreground)] mt-0.5 max-w-[90px] truncate">
                {st.sublabel}
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
