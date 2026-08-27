import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  fullAssessmentSchema,
  personalContextSchema,
  clinicalSignalsSchema,
  metabolicContextSchema,
  historyContextSchema,
} from "../schemas/assessment.schema";
import {
  AssessmentFieldDefinition,
  AssessmentFieldKey,
  AssessmentStepId,
  ASSESSMENT_FIELDS,
  ASSESSMENT_STEPS,
} from "../config/assessment-fields";
import { mapAssessmentFormToDto } from "../mappers/assessment.mapper";
import { useAssessment } from "../hooks/useAssessment";
import { useAssessmentNavigation } from "../hooks/useAssessmentNavigation";
import { useAssessmentFormState } from "../state/useAssessmentFormState";
import { FieldValidationError } from "../types/assessment-state.types";

import { TooltipProvider } from "../../../shared/ui";

// Components
import { AssessmentIntro } from "../components/AssessmentIntro";
import { AssessmentPath } from "../components/AssessmentPath";
import { AssessmentContextRail } from "../components/AssessmentContextRail";
import { AssessmentContextDrawer } from "../components/AssessmentContextDrawer";
import { AssessmentActionDock } from "../components/AssessmentActionDock";
import { AssessmentValidationSummary } from "../components/AssessmentValidationSummary";
import { AssessmentStateAlert } from "../components/AssessmentStateAlert";

// Steps
import { PersonalContextStep } from "../steps/PersonalContextStep";
import { ClinicalSignalsStep } from "../steps/ClinicalSignalsStep";
import { MetabolicContextStep } from "../steps/MetabolicContextStep";
import { HistoryContextStep } from "../steps/HistoryContextStep";
import { ReviewStep } from "../steps/ReviewStep";

export default function AssessmentPage() {
  const [drawerField, setDrawerField] = useState<AssessmentFieldDefinition | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);

  const form = useForm<AssessmentFormValues>({
    resolver: zodResolver(fullAssessmentSchema),
    mode: "onBlur",
    defaultValues: {
      age: "",
      pregnancies: "",
      glucose: "",
      bloodPressure: "",
      skinThickness: "",
      insulin: "",
      bmi: "",
      diabetesPedigreeFunction: "",
    },
  });

  const formState = useAssessmentFormState();
  const navigation = useAssessmentNavigation(form);

  const assessmentMutation = useAssessment({
    onSuccess: (result) => {
      formState.handleSubmissionSuccess(result);
    },
    onError: (error) => {
      formState.handleSubmissionError(error);
    },
  });

  // Track field changes to transition state to EDITING
  useEffect(() => {
    const subscription = form.watch(() => {
      formState.markEditing();
    });
    return () => subscription.unsubscribe();
  }, [form, formState]);

  // When step changes to review and form is valid, mark REVIEW_READY
  useEffect(() => {
    if (navigation.currentStep === "review" && formState.status === "EDITING") {
      formState.setReviewReady();
    }
  }, [navigation.currentStep, formState]);

  const handleOpenDetails = (fieldDef: AssessmentFieldDefinition) => {
    setDrawerField(fieldDef);
    setIsDrawerOpen(true);
  };

  const handleFocusField = (fieldKey: AssessmentFieldKey) => {
    navigation.setFocusedField(fieldKey);
  };

  const collectStepValidationErrors = (stepFields: AssessmentFieldKey[]): FieldValidationError[] => {
    const collected: FieldValidationError[] = [];

    for (const key of stepFields) {
      const fieldState = form.getFieldState(key, form.formState);
      const fieldDef = ASSESSMENT_FIELDS[key];
      if (fieldState.error?.message && fieldDef) {
        collected.push({
          fieldKey: key,
          stepId: fieldDef.stepId,
          label: fieldDef.label,
          message: fieldState.error.message,
        });
      }
    }
    return collected;
  };

  const handleAdvanceStep = async () => {
    const currentStep = navigation.currentStep;
    if (currentStep === "review") {
      return;
    }

    const schema =
      currentStep === "personal"
        ? personalContextSchema
        : currentStep === "signals"
        ? clinicalSignalsSchema
        : currentStep === "metabolic"
        ? metabolicContextSchema
        : historyContextSchema;

    const parseResult = schema.safeParse(form.getValues());
    if (!parseResult.success) {
      const collected: FieldValidationError[] = [];
      for (const issue of parseResult.error.issues) {
        const fieldKey = issue.path[0] as AssessmentFieldKey;
        const fieldDef = ASSESSMENT_FIELDS[fieldKey];
        if (fieldDef) {
          collected.push({
            fieldKey,
            stepId: fieldDef.stepId,
            label: fieldDef.label,
            message: issue.message,
          });
          form.setError(fieldKey, { type: "manual", message: issue.message });
        }
      }
      formState.setValidationErrors(collected);
      if (collected.length > 0) {
        const firstField = document.getElementById(collected[0].fieldKey);
        firstField?.focus();
      }
      return;
    }

    formState.clearValidationErrors();
    await navigation.advanceStep();
  };

  const handleJumpToField = (fieldKey: AssessmentFieldKey, stepId: AssessmentStepId) => {
    navigation.jumpToEdit(fieldKey);
    setTimeout(() => {
      const el = document.getElementById(fieldKey);
      if (el) {
        el.focus();
      }
    }, 50);
  };

  const handleSubmitAssessment = async () => {
    formState.clearValidationErrors();
    const parseResult = fullAssessmentSchema.safeParse(form.getValues());

    if (!parseResult.success) {
      const collected: FieldValidationError[] = [];
      for (const issue of parseResult.error.issues) {
        const fieldKey = issue.path[0] as AssessmentFieldKey;
        const fieldDef = ASSESSMENT_FIELDS[fieldKey];
        if (fieldDef) {
          collected.push({
            fieldKey,
            stepId: fieldDef.stepId,
            label: fieldDef.label,
            message: issue.message,
          });
          form.setError(fieldKey, { type: "manual", message: issue.message });
        }
      }
      formState.setValidationErrors(collected);
      return;
    }

    const canSubmit = formState.startSubmitting();
    if (!canSubmit) {
      return;
    }

    try {
      const dto = mapAssessmentFormToDto(form.getValues());
      assessmentMutation.mutate(dto);
    } catch (err: unknown) {
      formState.handleSubmissionError(err);
    }
  };

  // Orientation Landing Screen (Pristine orientation)
  if (!navigation.hasStarted) {
    return (
      <div className="w-full min-h-[calc(100vh-4rem)] p-4 sm:p-6 lg:p-8 flex items-center justify-center">
        <AssessmentIntro onStart={navigation.startAssessment} />
      </div>
    );
  }

  const isReviewStep = navigation.currentStep === "review";

  return (
    <TooltipProvider delayDuration={0}>
      <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* 3-Column Asymmetric Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* 1. Left Rail: Assessment Path (2.5 / 12 cols) */}
          <div className="lg:col-span-3">
            <AssessmentPath
              currentStepId={navigation.currentStep}
              completedSteps={navigation.completedSteps}
              onStepClick={navigation.jumpToStep}
            />
          </div>

          {/* 2. Center Canvas: Active Step (6.5 / 12 cols) */}
          <main
            aria-label="Active assessment step canvas"
            className="lg:col-span-6 rounded-md bg-[var(--card)] border border-[var(--border)] p-5 sm:p-6 shadow-xs flex flex-col justify-between min-h-[480px] space-y-5"
          >
            <div className="flex-1 space-y-5">
              {/* Active Step Validation Summary (for non-review steps) */}
              {!isReviewStep && formState.errors.length > 0 && (
                <AssessmentValidationSummary
                  errors={formState.errors}
                  onJumpToField={handleJumpToField}
                />
              )}

              {/* Active Step Error Alert (for non-review steps) */}
              {!isReviewStep && (
                <AssessmentStateAlert
                  status={formState.status}
                  errorContext={formState.errorContext}
                  onRetry={handleSubmitAssessment}
                  isSubmitting={formState.isSubmitting}
                />
              )}

              {navigation.currentStep === "personal" && (
                <PersonalContextStep
                  control={form.control}
                  onFocusField={handleFocusField}
                  onOpenDetails={handleOpenDetails}
                />
              )}

              {navigation.currentStep === "signals" && (
                <ClinicalSignalsStep
                  control={form.control}
                  onFocusField={handleFocusField}
                  onOpenDetails={handleOpenDetails}
                />
              )}

              {navigation.currentStep === "metabolic" && (
                <MetabolicContextStep
                  control={form.control}
                  onFocusField={handleFocusField}
                  onOpenDetails={handleOpenDetails}
                />
              )}

              {navigation.currentStep === "history" && (
                <HistoryContextStep
                  control={form.control}
                  onFocusField={handleFocusField}
                  onOpenDetails={handleOpenDetails}
                />
              )}

              {navigation.currentStep === "review" && (
                <ReviewStep
                  formValues={form.getValues()}
                  onEditField={(key) => navigation.jumpToEdit(key)}
                  onJumpToField={handleJumpToField}
                  validationErrors={formState.errors}
                  status={formState.status}
                  errorContext={formState.errorContext}
                  onRetry={handleSubmitAssessment}
                  isSubmitting={formState.isSubmitting}
                />
              )}
            </div>

            {/* Sticky Navigation Action Dock */}
            <AssessmentActionDock
              currentStepId={navigation.currentStep}
              isReviewing={navigation.isReviewing}
              isSubmitting={formState.isSubmitting}
              onPrevious={navigation.previousStep}
              onContinue={handleAdvanceStep}
              onReturnToReview={navigation.returnToReview}
              onSubmit={handleSubmitAssessment}
            />
          </main>

          {/* 3. Right Rail: Input Context (3 / 12 cols) */}
          <div className="hidden lg:block lg:col-span-3">
            <AssessmentContextRail
              focusedFieldKey={navigation.focusedField}
            />
          </div>
        </div>

        {/* Mobile Drawer for Clinical Rationale */}
        <AssessmentContextDrawer
          fieldDef={drawerField}
          open={isDrawerOpen}
          onOpenChange={setIsDrawerOpen}
        />
      </div>
    </TooltipProvider>
  );
}
