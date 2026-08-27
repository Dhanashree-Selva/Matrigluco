import { useState, useCallback } from "react";
import { UseFormReturn } from "react-hook-form";
import {
  AssessmentStepId,
  AssessmentFieldKey,
  ASSESSMENT_STEPS,
  ASSESSMENT_FIELDS,
} from "../config/assessment-fields";
import { AssessmentFormValues } from "../types/assessment.types";
import {
  personalContextSchema,
  clinicalSignalsSchema,
  metabolicContextSchema,
  historyContextSchema,
} from "../schemas/assessment.schema";

const STEP_SCHEMAS = {
  personal: personalContextSchema,
  signals: clinicalSignalsSchema,
  metabolic: metabolicContextSchema,
  history: historyContextSchema,
};

export function useAssessmentNavigation(form: UseFormReturn<AssessmentFormValues>) {
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [completedSteps, setCompletedSteps] = useState<Set<AssessmentStepId>>(new Set());
  const [isReviewing, setIsReviewing] = useState<boolean>(false);
  const [focusedField, setFocusedField] = useState<AssessmentFieldKey | null>("age");
  const [hasStarted, setHasStarted] = useState<boolean>(false);

  const currentStep = ASSESSMENT_STEPS[currentStepIndex].id;

  const validateStep = useCallback(
    async (stepId: AssessmentStepId): Promise<boolean> => {
      if (stepId === "review") return true;

      const schema = STEP_SCHEMAS[stepId as keyof typeof STEP_SCHEMAS];
      if (!schema) return true;

      const stepDef = ASSESSMENT_STEPS.find((s) => s.id === stepId);
      if (!stepDef) return true;

      const isValid = await form.trigger(stepDef.fields as AssessmentFieldKey[]);
      return isValid;
    },
    [form]
  );

  const advanceStep = useCallback(async () => {
    const isValid = await validateStep(currentStep);
    if (!isValid) return false;

    setCompletedSteps((prev) => new Set([...prev, currentStep]));

    if (isReviewing) {
      // Return directly to review if editing from review ledger
      setCurrentStepIndex(ASSESSMENT_STEPS.length - 1);
      return true;
    }

    if (currentStepIndex < ASSESSMENT_STEPS.length - 1) {
      const nextIndex = currentStepIndex + 1;
      setCurrentStepIndex(nextIndex);
      const nextStepDef = ASSESSMENT_STEPS[nextIndex];
      if (nextStepDef.fields.length > 0) {
        setFocusedField(nextStepDef.fields[0]);
      }
      return true;
    }
    return true;
  }, [currentStep, currentStepIndex, isReviewing, validateStep]);

  const previousStep = useCallback(() => {
    if (currentStepIndex > 0) {
      const prevIndex = currentStepIndex - 1;
      setCurrentStepIndex(prevIndex);
      const prevStepDef = ASSESSMENT_STEPS[prevIndex];
      if (prevStepDef.fields.length > 0) {
        setFocusedField(prevStepDef.fields[0]);
      }
    }
  }, [currentStepIndex]);

  const jumpToStep = useCallback(
    async (stepId: AssessmentStepId) => {
      const targetIndex = ASSESSMENT_STEPS.findIndex((s) => s.id === stepId);
      if (targetIndex === -1) return;

      // Allow navigation to already completed steps, current step, or review if all steps are completed
      if (targetIndex <= currentStepIndex || completedSteps.has(stepId) || stepId === "review") {
        setCurrentStepIndex(targetIndex);
        const targetStepDef = ASSESSMENT_STEPS[targetIndex];
        if (targetStepDef.fields.length > 0) {
          setFocusedField(targetStepDef.fields[0]);
        }
      }
    },
    [currentStepIndex, completedSteps]
  );

  const jumpToEdit = useCallback((fieldKey: AssessmentFieldKey) => {
    const fieldDef = ASSESSMENT_FIELDS[fieldKey];
    if (!fieldDef) return;

    const stepIndex = ASSESSMENT_STEPS.findIndex((s) => s.id === fieldDef.stepId);
    if (stepIndex !== -1) {
      setIsReviewing(true);
      setCurrentStepIndex(stepIndex);
      setFocusedField(fieldKey);
    }
  }, []);

  const returnToReview = useCallback(async () => {
    const isValid = await validateStep(currentStep);
    if (!isValid) return;

    setCompletedSteps((prev) => new Set([...prev, currentStep]));
    setCurrentStepIndex(ASSESSMENT_STEPS.length - 1);
  }, [currentStep, validateStep]);

  const startAssessment = useCallback(() => {
    setHasStarted(true);
    setCurrentStepIndex(0);
    setFocusedField("age");
  }, []);

  return {
    hasStarted,
    startAssessment,
    currentStep,
    currentStepIndex,
    totalSteps: ASSESSMENT_STEPS.length,
    completedSteps,
    isReviewing,
    focusedField,
    setFocusedField,
    advanceStep,
    previousStep,
    jumpToStep,
    jumpToEdit,
    returnToReview,
  };
}
