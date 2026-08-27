import { Control, Controller } from "react-hook-form";
import {
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
  InputGroupText,
} from "../../../shared/ui";
import {
  AssessmentFieldDefinition,
  AssessmentFieldKey,
} from "../config/assessment-fields";
import { AssessmentFormValues } from "../types/assessment.types";
import { InputRationale } from "./InputRationale";

interface UnitInputProps {
  fieldDef: AssessmentFieldDefinition;
  control: Control<AssessmentFormValues>;
  onFocusField?: (fieldKey: AssessmentFieldKey) => void;
  onOpenDetails?: (fieldDef: AssessmentFieldDefinition) => void;
  autoFocus?: boolean;
}

export function UnitInput({
  fieldDef,
  control,
  onFocusField,
  onOpenDetails,
  autoFocus = false,
}: UnitInputProps) {
  return (
    <Controller
      name={fieldDef.key}
      control={control}
      render={({ field, fieldState }) => (
        <Field
          data-invalid={fieldState.invalid}
          className="space-y-1.5 w-full text-left"
        >
          {/* Label + Rationale Trigger */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <FieldLabel
                htmlFor={fieldDef.key}
                className="text-xs font-bold text-[var(--foreground)]"
              >
                {fieldDef.label}
              </FieldLabel>
              <InputRationale
                field={fieldDef}
                onOpenDetails={onOpenDetails}
              />
            </div>
            {fieldDef.unit && (
              <span className="text-[10px] font-semibold text-[var(--muted-foreground)] uppercase">
                {fieldDef.unit}
              </span>
            )}
          </div>

          {/* Unit-Aware InputGroup */}
          <InputGroup
            className={`h-11 rounded-md transition-colors bg-[var(--background)] ${
              fieldState.invalid
                ? "border-[var(--destructive)] ring-1 ring-[var(--destructive)]/30"
                : "border-[var(--border)] focus-within:border-[var(--primary)] focus-within:ring-1 focus-within:ring-[var(--primary)]/30"
            }`}
          >
            <InputGroupInput
              {...field}
              id={fieldDef.key}
              autoFocus={autoFocus}
              type="text"
              inputMode={fieldDef.inputMode}
              placeholder={fieldDef.placeholder}
              aria-invalid={fieldState.invalid}
              aria-describedby={
                fieldState.invalid
                  ? `${fieldDef.key}-error`
                  : `${fieldDef.key}-desc`
              }
              onFocus={() => onFocusField?.(fieldDef.key)}
              className="text-sm font-semibold text-[var(--foreground)] px-3"
            />
            {fieldDef.unit && (
              <InputGroupAddon align="inline-end">
                <InputGroupText className="text-xs font-bold text-[var(--muted-foreground)] px-2">
                  {fieldDef.unit}
                </InputGroupText>
              </InputGroupAddon>
            )}
          </InputGroup>

          {/* Short Helper Description */}
          <FieldDescription
            id={`${fieldDef.key}-desc`}
            className="text-[11px] text-[var(--muted-foreground)]"
          >
            {fieldDef.clinicalNote || fieldDef.rationale}
          </FieldDescription>

          {/* Field Error Presentation */}
          {fieldState.invalid && fieldState.error && (
            <FieldError
              id={`${fieldDef.key}-error`}
              errors={[fieldState.error]}
              className="text-[11px] font-bold text-[var(--destructive)] mt-1"
            />
          )}
        </Field>
      )}
    />
  );
}
