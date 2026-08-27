import { Control } from "react-hook-form";
import { FieldGroup } from "../../../shared/ui";
import {
  ASSESSMENT_FIELDS,
  AssessmentFieldDefinition,
  AssessmentFieldKey,
} from "../config/assessment-fields";
import { AssessmentFormValues } from "../types/assessment.types";
import { UnitInput } from "../components/UnitInput";

interface MetabolicContextStepProps {
  control: Control<AssessmentFormValues>;
  onFocusField: (key: AssessmentFieldKey) => void;
  onOpenDetails: (def: AssessmentFieldDefinition) => void;
}

export function MetabolicContextStep({
  control,
  onFocusField,
  onOpenDetails,
}: MetabolicContextStepProps) {
  return (
    <div className="space-y-4 text-left">
      <div className="space-y-1">
        <span className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--primary)]">
          Stage 03 / Body & Metabolic Context
        </span>
        <h2 className="text-xl font-extrabold text-[var(--foreground)] tracking-tight">
          Adipose & Insulin Biomarkers
        </h2>
        <p className="text-xs text-[var(--muted-foreground)]">
          Enter skinfold thickness, 2-hour serum insulin, and Body Mass Index (BMI).
        </p>
      </div>

      <FieldGroup className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
        <UnitInput
          fieldDef={ASSESSMENT_FIELDS.skinThickness}
          control={control}
          onFocusField={onFocusField}
          onOpenDetails={onOpenDetails}
          autoFocus
        />
        <UnitInput
          fieldDef={ASSESSMENT_FIELDS.insulin}
          control={control}
          onFocusField={onFocusField}
          onOpenDetails={onOpenDetails}
        />
        <UnitInput
          fieldDef={ASSESSMENT_FIELDS.bmi}
          control={control}
          onFocusField={onFocusField}
          onOpenDetails={onOpenDetails}
        />
      </FieldGroup>
    </div>
  );
}
