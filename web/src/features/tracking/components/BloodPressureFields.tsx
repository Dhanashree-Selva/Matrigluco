import { UseFormRegister, FieldErrors } from "react-hook-form";
import {
  Field,
  FieldLabel,
  FieldError,
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "../../../shared/ui";
import { MeasurementFormValues } from "../schemas/tracking.schema";

interface BloodPressureFieldsProps {
  register: UseFormRegister<MeasurementFormValues>;
  errors: FieldErrors<MeasurementFormValues>;
  disabled?: boolean;
}

export function BloodPressureFields({
  register,
  errors,
  disabled,
}: BloodPressureFieldsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {/* Systolic Field */}
      <Field data-invalid={Boolean(errors.value_primary)} className="space-y-1.5">
        <FieldLabel htmlFor="bp-systolic" className="text-xs font-bold text-[var(--foreground)]">
          Systolic Pressure (Upper)
        </FieldLabel>
        <InputGroup className="bg-[var(--card)] border-[var(--border)]">
          <InputGroupInput
            id="bp-systolic"
            type="number"
            step="1"
            placeholder="120"
            disabled={disabled}
            className="text-xs font-semibold"
            {...register("value_primary")}
          />
          <InputGroupAddon align="inline-end" className="text-[11px] font-mono text-[var(--muted-foreground)]">
            mmHg
          </InputGroupAddon>
        </InputGroup>
        {errors.value_primary && (
          <FieldError className="text-[11px] text-[var(--destructive)]">
            {errors.value_primary.message}
          </FieldError>
        )}
      </Field>

      {/* Diastolic Field */}
      <Field data-invalid={Boolean(errors.value_secondary)} className="space-y-1.5">
        <FieldLabel htmlFor="bp-diastolic" className="text-xs font-bold text-[var(--foreground)]">
          Diastolic Pressure (Lower)
        </FieldLabel>
        <InputGroup className="bg-[var(--card)] border-[var(--border)]">
          <InputGroupInput
            id="bp-diastolic"
            type="number"
            step="1"
            placeholder="80"
            disabled={disabled}
            className="text-xs font-semibold"
            {...register("value_secondary")}
          />
          <InputGroupAddon align="inline-end" className="text-[11px] font-mono text-[var(--muted-foreground)]">
            mmHg
          </InputGroupAddon>
        </InputGroup>
        {errors.value_secondary && (
          <FieldError className="text-[11px] text-[var(--destructive)]">
            {errors.value_secondary.message}
          </FieldError>
        )}
      </Field>
    </div>
  );
}
