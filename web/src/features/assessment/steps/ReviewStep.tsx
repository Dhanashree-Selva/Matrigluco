import React from "react";
import { SecurityCheckIcon } from "@hugeicons/core-free-icons";
import { AppIcon } from "../../../components/common/AppIcon";
import { Alert, AlertDescription } from "../../../shared/ui";
import { AssessmentFieldKey, AssessmentStepId } from "../config/assessment-fields";
import { AssessmentFormValues } from "../types/assessment.types";
import {
  AssessmentFormStatus,
  FieldValidationError,
  StateErrorContext,
} from "../types/assessment-state.types";
import { ModelInputLedger } from "../components/ModelInputLedger";
import { ModelTransparency } from "../components/ModelTransparency";
import { AssessmentValidationSummary } from "../components/AssessmentValidationSummary";
import { AssessmentStateAlert } from "../components/AssessmentStateAlert";

interface ReviewStepProps {
  formValues: AssessmentFormValues;
  onEditField: (fieldKey: AssessmentFieldKey) => void;
  onJumpToField?: (fieldKey: AssessmentFieldKey, stepId: AssessmentStepId) => void;
  validationErrors?: FieldValidationError[];
  status?: AssessmentFormStatus;
  errorContext?: StateErrorContext | null;
  onRetry?: () => void;
  isSubmitting?: boolean;
}

export function ReviewStep({
  formValues,
  onEditField,
  onJumpToField,
  validationErrors = [],
  status = "REVIEW_READY",
  errorContext,
  onRetry,
  isSubmitting = false,
}: ReviewStepProps) {
  return (
    <div className="space-y-5 text-left">
      <div className="space-y-1">
        <span className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--primary)]">
          Stage 05 / Review & Confirmation
        </span>
        <h2 className="text-xl font-extrabold text-[var(--foreground)] tracking-tight">
          Model Input Ledger
        </h2>
        <p className="text-xs text-[var(--muted-foreground)]">
          Carefully inspect each of the 8 canonical values below. Click <strong>Edit</strong> on any row to adjust its value before submitting to the model.
        </p>
      </div>

      {/* Accessible Validation Summary when in INVALID state */}
      {validationErrors.length > 0 && (
        <AssessmentValidationSummary
          errors={validationErrors}
          onJumpToField={onJumpToField}
        />
      )}

      {/* System Error & Service Interruption Alert */}
      <AssessmentStateAlert
        status={status}
        errorContext={errorContext}
        onRetry={onRetry}
        isSubmitting={isSubmitting}
      />

      {/* 1. Item-Based Ledger */}
      <ModelInputLedger
        formValues={formValues}
        onEditField={onEditField}
      />

      {/* 2. Model Transparency Collapsible */}
      <ModelTransparency />

      {/* 3. Non-Diagnostic Notice */}
      <Alert className="p-3 rounded-md bg-[var(--surface-soft)] border border-[var(--border)] text-xs text-[var(--muted-foreground)]">
        <AppIcon icon={SecurityCheckIcon} size="xs" className="text-[var(--primary)] shrink-0 mt-0.5" />
        <AlertDescription className="text-[11px] leading-relaxed">
          <strong>Non-Diagnostic Notice:</strong> By clicking <strong>Run Assessment</strong>, you authorize Matrigluco to calculate an educational risk score using the exact inputs shown in this ledger.
        </AlertDescription>
      </Alert>
    </div>
  );
}
