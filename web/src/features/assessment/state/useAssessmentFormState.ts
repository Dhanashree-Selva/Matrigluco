import { useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "../../../shared/ui";
import { queryKeys } from "../../../query/keys";
import {
  AssessmentFormStatus,
  FieldValidationError,
  StateErrorContext,
  AssessmentFormStateModel,
} from "../types/assessment-state.types";
import { AssessmentDetail } from "../types/assessment.types";
import {
  extractSafeContractContext,
  recordSafeObservabilityEvent,
} from "../utils/safe-observability";
import { AssessmentFieldKey } from "../config/assessment-fields";

export function useAssessmentFormState() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [status, setStatus] = useState<AssessmentFormStatus>("PRISTINE");
  const [errors, setErrors] = useState<FieldValidationError[]>([]);
  const [errorContext, setErrorContext] = useState<StateErrorContext | null>(null);
  const isSubmittingRef = useRef<boolean>(false);

  const markEditing = useCallback(() => {
    setStatus((prev) => {
      if (
        prev === "PRISTINE" ||
        prev === "INVALID" ||
        prev === "BACKEND_UNAVAILABLE" ||
        prev === "NETWORK_INTERRUPTED" ||
        prev === "MODEL_UNAVAILABLE" ||
        prev === "VALIDATION_MISMATCH"
      ) {
        return "EDITING";
      }
      return prev;
    });
    setErrors([]);
    setErrorContext(null);
  }, []);

  const setValidationErrors = useCallback((validationErrors: FieldValidationError[]) => {
    setErrors(validationErrors);
    setStatus("INVALID");
  }, []);

  const clearValidationErrors = useCallback(() => {
    setErrors([]);
  }, []);

  const setReviewReady = useCallback(() => {
    setErrors([]);
    setErrorContext(null);
    setStatus("REVIEW_READY");
  }, []);

  const startSubmitting = useCallback((): boolean => {
    // Prevent double submission
    if (isSubmittingRef.current || status === "SUBMITTING") {
      return false;
    }
    isSubmittingRef.current = true;
    setStatus("SUBMITTING");
    setErrors([]);
    setErrorContext(null);
    return true;
  }, [status]);

  const handleSubmissionSuccess = useCallback(
    (result: AssessmentDetail) => {
      isSubmittingRef.current = false;
      setStatus("SUCCESS");

      // Verify that backend returned a valid persisted result ID
      if (!result?.id) {
        setStatus("BACKEND_UNAVAILABLE");
        setErrorContext({
          message: "Assessment completed but no valid record identifier was returned.",
        });
        return;
      }

      // Invalidate authoritative query caches
      queryClient.invalidateQueries({ queryKey: queryKeys.predictions.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.history.all });

      // Sonner success feedback without diagnostic conclusions
      toast.success("Assessment completed", {
        description: "Your result has been saved to your history.",
      });

      // Navigate to persisted immutable assessment result route
      navigate(`/app/assessment/${result.id}`);
    },
    [navigate, queryClient]
  );

  const handleSubmissionError = useCallback((error: unknown) => {
    isSubmittingRef.current = false;
    const context = extractSafeContractContext(error);

    setErrorContext({
      statusCode: context.statusCode,
      errorCode: context.errorCode,
      requestId: context.requestId,
      impactedFields: context.impactedFields,
      backendContractVersion: context.backendContractVersion,
    });

    if (context.isContractMismatch) {
      setStatus("VALIDATION_MISMATCH");
      recordSafeObservabilityEvent({
        event_type: "ASSESSMENT_CONTRACT_MISMATCH",
        route: "/app/assessment",
        status_code: context.statusCode,
        error_code: context.errorCode,
        request_id: context.requestId,
        frontend_schema_version: "1.0.0",
        backend_contract_version: context.backendContractVersion,
        impacted_fields: context.impactedFields,
      });
      return;
    }

    if (context.isModelUnavailable) {
      setStatus("MODEL_UNAVAILABLE");
      return;
    }

    if (context.isNetworkInterrupted) {
      setStatus("NETWORK_INTERRUPTED");
      return;
    }

    // Default to general backend unavailable (500, unhandled API error)
    setStatus("BACKEND_UNAVAILABLE");
    recordSafeObservabilityEvent({
      event_type: "ASSESSMENT_SERVICE_FAILURE",
      route: "/app/assessment",
      status_code: context.statusCode,
      error_code: context.errorCode,
      request_id: context.requestId,
      frontend_schema_version: "1.0.0",
    });
  }, []);

  const firstInvalidField: AssessmentFieldKey | null =
    errors.length > 0 ? errors[0].fieldKey : null;

  return {
    status,
    errors,
    firstInvalidField,
    errorContext,
    isSubmitting: status === "SUBMITTING",
    markEditing,
    setValidationErrors,
    clearValidationErrors,
    setReviewReady,
    startSubmitting,
    handleSubmissionSuccess,
    handleSubmissionError,
  };
}
