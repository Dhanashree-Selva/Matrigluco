import React from "react";
import {
  AlertCircleIcon,
  WifiDisconnected01Icon,
  RotateRight01Icon,
  Shield01Icon,
  Database01Icon,
} from "@hugeicons/core-free-icons";
import { AppIcon } from "../../../components/common/AppIcon";
import { Alert, AlertTitle, AlertDescription, Button } from "../../../shared/ui";
import { AssessmentFormStatus, StateErrorContext } from "../types/assessment-state.types";

interface AssessmentStateAlertProps {
  status: AssessmentFormStatus;
  errorContext?: StateErrorContext | null;
  onRetry?: () => void;
  isSubmitting?: boolean;
}

export function AssessmentStateAlert({
  status,
  errorContext,
  onRetry,
  isSubmitting = false,
}: AssessmentStateAlertProps) {
  if (
    status === "PRISTINE" ||
    status === "EDITING" ||
    status === "REVIEW_READY" ||
    status === "SUBMITTING" ||
    status === "SUCCESS" ||
    status === "COMPLETED" ||
    status === "INVALID"
  ) {
    return null;
  }

  // VALIDATION_MISMATCH (Schema/API Contract drift)
  if (status === "VALIDATION_MISMATCH") {
    return (
      <Alert
        role="alert"
        variant="destructive"
        className="p-4 rounded-md border border-[var(--destructive)]/40 bg-[var(--destructive)]/10 text-left space-y-3"
      >
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-md bg-[var(--destructive)]/15 text-[var(--destructive)] shrink-0">
            <AppIcon icon={Shield01Icon} size="sm" />
          </div>
          <div className="space-y-1.5 flex-1">
            <AlertTitle className="text-sm font-bold text-[var(--foreground)]">
              Assessment service mismatch
            </AlertTitle>
            <AlertDescription className="text-xs text-[var(--muted-foreground)] leading-relaxed">
              The information entered is still here, but Matrigluco could not submit it because the application and assessment service currently expect different data. Try again after the service is updated.
            </AlertDescription>

            {errorContext?.requestId && (
              <p className="text-[11px] font-mono text-[var(--muted-foreground)] pt-1">
                Reference ID: <span className="font-semibold text-[var(--foreground)]">{errorContext.requestId}</span>
              </p>
            )}
          </div>
        </div>

        {onRetry && (
          <div className="pt-1 flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onRetry}
              disabled={isSubmitting}
              className="h-8 text-xs font-semibold border-[var(--border)]"
            >
              <AppIcon icon={RotateRight01Icon} size="xs" className="mr-1.5" />
              <span>Retry submission</span>
            </Button>
          </div>
        )}
      </Alert>
    );
  }

  // 2. Model Unavailable (503 / dormant model)
  if (status === "MODEL_UNAVAILABLE") {
    return (
      <Alert className="p-4 sm:p-5 rounded-md border border-[var(--border)] bg-[var(--surface-soft)] text-left space-y-3 animate-in fade-in-50 duration-200">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-md bg-[var(--card)] text-[var(--primary)] shrink-0 border border-[var(--border)]">
            <AppIcon icon={Database01Icon} size="sm" />
          </div>
          <div className="space-y-1.5 flex-1">
            <AlertTitle className="text-sm font-bold text-[var(--foreground)]">
              Assessment model temporarily unavailable
            </AlertTitle>
            <AlertDescription className="text-xs text-[var(--muted-foreground)] leading-relaxed">
              The calibrated assessment model is currently undergoing maintenance. Your clinical entries have been kept intact. No alternate or placeholder estimation will be substituted.
            </AlertDescription>
          </div>
        </div>

        {onRetry && (
          <div className="pt-1">
            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={onRetry}
              disabled={isSubmitting}
              className="h-8 text-xs font-bold bg-[var(--primary)] text-[var(--primary-foreground)]"
            >
              <AppIcon icon={RotateRight01Icon} size="xs" className="mr-1.5" />
              <span>Retry assessment</span>
            </Button>
          </div>
        )}
      </Alert>
    );
  }

  // 3. Network Interrupted
  if (status === "NETWORK_INTERRUPTED") {
    return (
      <Alert className="p-4 sm:p-5 rounded-md border border-[var(--destructive)]/30 bg-[var(--destructive)]/10 text-left space-y-3 animate-in fade-in-50 duration-200">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-md bg-[var(--destructive)]/15 text-[var(--destructive)] shrink-0">
            <AppIcon icon={WifiDisconnected01Icon} size="sm" />
          </div>
          <div className="space-y-1.5 flex-1">
            <AlertTitle className="text-sm font-bold text-[var(--destructive)]">
              Network connection interrupted
            </AlertTitle>
            <AlertDescription className="text-xs text-[var(--muted-foreground)] leading-relaxed">
              The assessment request could not be confirmed. All your review inputs remain preserved. Please verify your internet connection before retrying.
            </AlertDescription>
          </div>
        </div>

        {onRetry && (
          <div className="pt-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onRetry}
              disabled={isSubmitting}
              className="h-8 text-xs font-semibold border-[var(--border)]"
            >
              <AppIcon icon={RotateRight01Icon} size="xs" className="mr-1.5" />
              <span>Retry assessment</span>
            </Button>
          </div>
        )}
      </Alert>
    );
  }

  // 4. Backend Unavailable (Generic 500 / unreachable backend)
  return (
    <Alert className="p-4 sm:p-5 rounded-md border border-[var(--destructive)]/30 bg-[var(--destructive)]/10 text-left space-y-3 animate-in fade-in-50 duration-200">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-md bg-[var(--destructive)]/15 text-[var(--destructive)] shrink-0">
          <AppIcon icon={AlertCircleIcon} size="sm" />
        </div>
        <div className="space-y-1.5 flex-1">
          <AlertTitle className="text-sm font-bold text-[var(--destructive)]">
            Assessment service unavailable
          </AlertTitle>
          <AlertDescription className="text-xs text-[var(--muted-foreground)] leading-relaxed">
            The assessment service encountered an unexpected error. Your clinical inputs are completely preserved and have not been cleared.
          </AlertDescription>
          {errorContext?.requestId && (
            <p className="text-[11px] font-mono text-[var(--muted-foreground)] pt-0.5">
              Reference: <span className="font-semibold">{errorContext.requestId}</span>
            </p>
          )}
        </div>
      </div>

      {onRetry && (
        <div className="pt-1">
          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={onRetry}
            disabled={isSubmitting}
            className="h-8 text-xs font-bold bg-[var(--primary)] text-[var(--primary-foreground)]"
          >
            <AppIcon icon={RotateRight01Icon} size="xs" className="mr-1.5" />
            <span>Retry assessment</span>
          </Button>
        </div>
      )}
    </Alert>
  );
}
