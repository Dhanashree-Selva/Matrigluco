import {
  CheckmarkCircle02Icon,
  SparklesIcon,
  Clock01Icon,
  CircleIcon,
} from "@hugeicons/core-free-icons";
import { AppIcon } from "../../../components/common/AppIcon";
import { Progress } from "../../../shared/ui";
import {
  AssessmentStepId,
  ASSESSMENT_STEPS,
} from "../config/assessment-fields";

interface AssessmentPathProps {
  currentStepId: AssessmentStepId;
  completedSteps: Set<AssessmentStepId>;
  onStepClick: (stepId: AssessmentStepId) => void;
  className?: string;
}

export function AssessmentPath({
  currentStepId,
  completedSteps,
  onStepClick,
  className = "",
}: AssessmentPathProps) {
  const currentStepIndex = ASSESSMENT_STEPS.findIndex((s) => s.id === currentStepId);
  const progressPercent = Math.round(
    ((completedSteps.size + (currentStepId === "review" ? 1 : 0)) / ASSESSMENT_STEPS.length) * 100
  );

  return (
    <nav
      aria-label="Assessment navigation"
      className={`flex flex-col gap-4 p-4 rounded-md bg-[var(--card)] border border-[var(--border)] ${className}`}
    >
      {/* 1. Header & Progress Completion Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-extrabold uppercase tracking-wider text-[var(--foreground)]">
            Assessment Path
          </span>
          <span className="font-bold text-[var(--primary)] text-xs">
            {progressPercent}%
          </span>
        </div>
        <Progress
          value={progressPercent}
          className="h-1.5 bg-[var(--muted)]"
          aria-label="Assessment completion progress"
        />
        <p className="text-[11px] text-[var(--muted-foreground)]">
          Stage {currentStepIndex + 1} of {ASSESSMENT_STEPS.length}
        </p>
      </div>

      {/* 2. Semantic Step List */}
      <ol
        aria-label="Assessment stages"
        className="flex flex-col gap-1.5 list-none p-0 m-0"
      >
        {ASSESSMENT_STEPS.map((step, idx) => {
          const isCompleted = completedSteps.has(step.id);
          const isCurrent = step.id === currentStepId;
          const isAvailable = isCompleted || idx <= currentStepIndex;

          let statusIcon = CircleIcon;
          let iconColor = "text-[var(--muted-foreground)]";
          let badgeBg = "bg-[var(--surface-soft)] text-[var(--muted-foreground)]";

          if (isCompleted) {
            statusIcon = CheckmarkCircle02Icon;
            iconColor = "text-[var(--success)]";
            badgeBg = "bg-[var(--success)]/10 text-[var(--success)]";
          } else if (isCurrent) {
            statusIcon = SparklesIcon;
            iconColor = "text-[var(--primary)]";
            badgeBg = "bg-[var(--accent-soft)] text-[var(--primary)] font-black ring-1 ring-[var(--primary)]/30";
          } else if (step.id === "review") {
            statusIcon = Clock01Icon;
          }

          return (
            <li key={step.id} className="relative">
              <button
                type="button"
                onClick={() => onStepClick(step.id)}
                disabled={!isAvailable}
                aria-current={isCurrent ? "step" : undefined}
                className={`w-full flex items-center gap-3 p-2 rounded-md text-left transition-all ${
                  isCurrent
                    ? "bg-[var(--accent-soft)]/50 border border-[var(--primary)]/30 shadow-2xs"
                    : isAvailable
                    ? "hover:bg-[var(--surface-soft)] cursor-pointer text-[var(--foreground)]"
                    : "opacity-40 cursor-not-allowed text-[var(--muted-foreground)]"
                }`}
              >
                {/* Step indicator badge */}
                <div
                  className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 text-xs font-bold transition-colors ${badgeBg}`}
                >
                  {isCompleted ? (
                    <AppIcon icon={CheckmarkCircle02Icon} size="xs" />
                  ) : (
                    <span>0{step.stepNumber}</span>
                  )}
                </div>

                {/* Step labels */}
                <div className="grid flex-1 leading-tight">
                  <span
                    className={`text-xs truncate ${
                      isCurrent
                        ? "font-black text-[var(--foreground)]"
                        : isCompleted
                        ? "font-bold text-[var(--foreground)]"
                        : "font-medium text-[var(--muted-foreground)]"
                    }`}
                  >
                    {step.title}
                  </span>
                  <span className="text-[10px] text-[var(--muted-foreground)] truncate">
                    {step.fields.length > 0 ? `${step.fields.length} inputs` : "Confirmation"}
                  </span>
                </div>

                {/* Status indicator */}
                <AppIcon icon={statusIcon} size="xs" className={iconColor} />
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
