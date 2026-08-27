import { Control } from "react-hook-form";
import { FieldGroup } from "../../../shared/ui";
import {
  ASSESSMENT_FIELDS,
  AssessmentFieldDefinition,
  AssessmentFieldKey,
} from "../config/assessment-fields";
import { AssessmentFormValues } from "../types/assessment.types";
import { UnitInput } from "../components/UnitInput";

interface PersonalContextStepProps {
  control: Control<AssessmentFormValues>;
  onFocusField: (key: AssessmentFieldKey) => void;
  onOpenDetails: (def: AssessmentFieldDefinition) => void;
}

export function PersonalContextStep({
  control,
  onFocusField,
  onOpenDetails,
}: PersonalContextStepProps) {
  return (
    <div className="space-y-4 text-left">
      <div className="space-y-1">
        <span className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--primary)]">
          Stage 01 / Personal Context
        </span>
        <h2 className="text-xl font-extrabold text-[var(--foreground)] tracking-tight">
          Maternal Demographic Baseline
        </h2>
        <p className="text-xs text-[var(--muted-foreground)]">
          Enter your current age and total number of pregnancies to establish baseline physiological calibration.
        </p>
      </div>

      <FieldGroup className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
        <UnitInput
          fieldDef={ASSESSMENT_FIELDS.age}
          control={control}
          onFocusField={onFocusField}
          onOpenDetails={onOpenDetails}
          autoFocus
        />
        <UnitInput
          fieldDef={ASSESSMENT_FIELDS.pregnancies}
          control={control}
          onFocusField={onFocusField}
          onOpenDetails={onOpenDetails}
        />
      </FieldGroup>
    </div>
  );
}
