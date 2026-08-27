import React, { useEffect, useRef } from "react";
import { AlertCircleIcon, ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { AppIcon } from "../../../components/common/AppIcon";
import { Alert, AlertTitle, AlertDescription } from "../../../shared/ui";
import { FieldValidationError } from "../types/assessment-state.types";
import { AssessmentFieldKey, AssessmentStepId } from "../config/assessment-fields";

interface AssessmentValidationSummaryProps {
  errors: FieldValidationError[];
  onJumpToField?: (fieldKey: AssessmentFieldKey, stepId: AssessmentStepId) => void;
  className?: string;
}

export function AssessmentValidationSummary({
  errors,
  onJumpToField,
  className = "",
}: AssessmentValidationSummaryProps) {
  const summaryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (errors.length > 0 && summaryRef.current) {
      summaryRef.current.focus();
    }
  }, [errors]);

  if (!errors || errors.length === 0) {
    return null;
  }

  const handleFieldClick = (fieldKey: AssessmentFieldKey, stepId: AssessmentStepId) => {
    if (onJumpToField) {
      onJumpToField(fieldKey, stepId);
    } else {
      const el = document.getElementById(fieldKey);
      if (el) {
        el.focus();
      }
    }
  };

  return (
    <div
      ref={summaryRef}
      tabIndex={-1}
      aria-live="assertive"
      className={`focus:outline-none focus:ring-2 focus:ring-[var(--destructive)]/40 rounded-md ${className}`}
    >
      <Alert
        variant="destructive"
        className="p-4 rounded-md border border-[var(--destructive)]/30 bg-[var(--destructive)]/10 text-left space-y-2.5"
      >
        <div className="flex items-start gap-2.5">
          <AppIcon
            icon={AlertCircleIcon}
            size="sm"
            className="text-[var(--destructive)] shrink-0 mt-0.5"
          />
          <div className="space-y-1 w-full">
            <AlertTitle className="text-sm font-bold text-[var(--destructive)]">
              Some information needs attention
            </AlertTitle>
            <AlertDescription className="text-xs text-[var(--muted-foreground)]">
              Review the highlighted fields before continuing with your assessment.
            </AlertDescription>
          </div>
        </div>

        <ul
          className="space-y-1.5 pt-1 pl-7 text-xs list-disc text-[var(--foreground)]"
          aria-label="List of invalid fields"
        >
          {errors.map((err, idx) => (
            <li key={`${err.fieldKey}-${idx}`} className="text-xs">
              <button
                type="button"
                onClick={() => handleFieldClick(err.fieldKey, err.stepId)}
                className="inline-flex items-center gap-1 font-semibold text-[var(--destructive)] hover:underline text-left cursor-pointer focus-visible:outline-2 focus-visible:outline-[var(--destructive)]"
              >
                <span>{err.label}</span>
                <span className="text-[var(--muted-foreground)] font-normal">— {err.message}</span>
                <AppIcon icon={ArrowRight01Icon} size="xxs" className="opacity-70 ml-0.5" />
              </button>
            </li>
          ))}
        </ul>
      </Alert>
    </div>
  );
}
