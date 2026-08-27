import { Control } from "react-hook-form";
import { FieldGroup } from "../../../shared/ui";
import {
  ASSESSMENT_FIELDS,
  AssessmentFieldDefinition,
  AssessmentFieldKey,
} from "../config/assessment-fields";
import { AssessmentFormValues } from "../types/assessment.types";
import { UnitInput } from "../components/UnitInput";

interface ClinicalSignalsStepProps {
  control: Control<AssessmentFormValues>;
  onFocusField: (key: AssessmentFieldKey) => void;
  onOpenDetails: (def: AssessmentFieldDefinition) => void;
}

export function ClinicalSignalsStep({
  control,
  onFocusField,
  onOpenDetails,
}: ClinicalSignalsStepProps) {
  return (
    <div className="space-y-4 text-left">
      <div className="space-y-1">
        <span className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--primary)]">
          Stage 02 / Clinical Signals
        </span>
        <h2 className="text-xl font-extrabold text-[var(--foreground)] tracking-tight">
          Glucose & Blood Pressure
        </h2>
        <p className="text-xs text-[var(--muted-foreground)]">
          Provide your fasting/plasma glucose concentration and resting diastolic blood pressure.
        </p>
      </div>

      <FieldGroup className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
        <UnitInput
          fieldDef={ASSESSMENT_FIELDS.glucose}
          control={control}
          onFocusField={onFocusField}
          onOpenDetails={onOpenDetails}
          autoFocus
        />
        <UnitInput
          fieldDef={ASSESSMENT_FIELDS.bloodPressure}
          control={control}
          onFocusField={onFocusField}
          onOpenDetails={onOpenDetails}
        />
      </FieldGroup>
    </div>
  );
}
