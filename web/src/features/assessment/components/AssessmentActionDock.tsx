import {
  ArrowLeft01Icon,
  ArrowRight01Icon,
  SparklesIcon,
  Loading03Icon,
} from "@hugeicons/core-free-icons";
import { AppIcon } from "../../../components/common/AppIcon";
import { Button, ButtonGroup } from "../../../shared/ui";
import { AssessmentStepId } from "../config/assessment-fields";

interface AssessmentActionDockProps {
  currentStepId: AssessmentStepId;
  isReviewing: boolean;
  isSubmitting?: boolean;
  onPrevious: () => void;
  onContinue: () => void;
  onReturnToReview: () => void;
  onSubmit: () => void;
}

export function AssessmentActionDock({
  currentStepId,
  isReviewing,
  isSubmitting = false,
  onPrevious,
  onContinue,
  onReturnToReview,
  onSubmit,
}: AssessmentActionDockProps) {
  const isFirstStep = currentStepId === "personal";
  const isReviewStep = currentStepId === "review";

  return (
    <footer className="sticky bottom-0 z-20 mt-6 pt-3 pb-4 border-t border-[var(--border)] bg-[var(--background)]/90 backdrop-blur-md flex flex-wrap items-center justify-between gap-3">
      {/* 1. Back Action */}
      <Button
        type="button"
        variant="outline"
        onClick={onPrevious}
        disabled={isFirstStep || isSubmitting}
        className="h-10 px-4 rounded-md font-bold text-xs border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--surface-soft)] disabled:opacity-30 flex items-center gap-1.5 cursor-pointer"
      >
        <AppIcon icon={ArrowLeft01Icon} size="xs" />
        <span>Previous</span>
      </Button>

      {/* 2. Primary Next / Submit / Return Actions */}
      <div className="flex items-center gap-2">
        {isReviewing && !isReviewStep && (
          <Button
            type="button"
            variant="secondary"
            onClick={onReturnToReview}
            disabled={isSubmitting}
            className="h-10 px-4 rounded-md font-bold text-xs bg-[var(--secondary)] text-[var(--secondary-foreground)] hover:bg-[var(--surface-soft)] cursor-pointer"
          >
            Return to Review
          </Button>
        )}

        {isReviewStep ? (
          <Button
            type="button"
            onClick={onSubmit}
            disabled={isSubmitting}
            className="h-10 px-6 rounded-md font-extrabold text-xs bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-[var(--primary-foreground)] shadow-md shadow-[var(--primary)]/20 flex items-center gap-2 cursor-pointer transition-transform active:scale-[0.98]"
          >
            {isSubmitting ? (
              <>
                <AppIcon icon={Loading03Icon} size="xs" className="animate-spin" />
                <span>Running Assessment…</span>
              </>
            ) : (
              <>
                <AppIcon icon={SparklesIcon} size="xs" />
                <span>Run Assessment</span>
              </>
            )}
          </Button>
        ) : (
          <Button
            type="button"
            onClick={onContinue}
            disabled={isSubmitting}
            className="h-10 px-5 rounded-md font-extrabold text-xs bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-[var(--primary-foreground)] shadow-md shadow-[var(--primary)]/20 flex items-center gap-1.5 cursor-pointer transition-transform active:scale-[0.98]"
          >
            <span>Continue</span>
            <AppIcon icon={ArrowRight01Icon} size="xs" />
          </Button>
        )}
      </div>
    </footer>
  );
}
