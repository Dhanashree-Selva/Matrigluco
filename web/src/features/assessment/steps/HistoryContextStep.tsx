import { Control } from "react-hook-form";
import { FieldGroup } from "../../../shared/ui";
import {
  ASSESSMENT_FIELDS,
  AssessmentFieldDefinition,
  AssessmentFieldKey,
} from "../config/assessment-fields";
import { AssessmentFormValues } from "../types/assessment.types";
import { UnitInput } from "../components/UnitInput";

interface HistoryContextStepProps {
  control: Control<AssessmentFormValues>;
  onFocusField: (key: AssessmentFieldKey) => void;
  onOpenDetails: (def: AssessmentFieldDefinition) => void;
}

export function HistoryContextStep({
  control,
  onFocusField,
  onOpenDetails,
}: HistoryContextStepProps) {
  return (
    <div className="space-y-4 text-left">
      <div className="space-y-1">
        <span className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--primary)]">
          Stage 04 / History Context
        </span>
        <h2 className="text-xl font-extrabold text-[var(--foreground)] tracking-tight">
          Genetic Pedigree Score
        </h2>
        <p className="text-xs text-[var(--muted-foreground)]">
          The Diabetes Pedigree Function is an algorithmic score (typically 0.08–2.42) calculating family hereditary prevalence.
        </p>
      </div>

      <FieldGroup className="grid grid-cols-1 sm:grid-cols-1 max-w-md gap-4 pt-2">
        <UnitInput
          fieldDef={ASSESSMENT_FIELDS.diabetesPedigreeFunction}
          control={control}
          onFocusField={onFocusField}
          onOpenDetails={onOpenDetails}
          autoFocus
        />
      </FieldGroup>
    </div>
  );
}
