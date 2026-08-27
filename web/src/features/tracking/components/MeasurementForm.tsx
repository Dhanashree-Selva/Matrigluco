import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect } from "react";
import {
  Field,
  FieldLabel,
  FieldError,
  FieldDescription,
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  Button,
  Spinner,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../../../shared/ui";
import { AppIcon } from "../../../components/common/AppIcon";
import {
  measurementFormSchema,
  MeasurementFormValues,
} from "../schemas/tracking.schema";
import {
  METRIC_DEFINITIONS,
  TRACKING_METRIC_LIST,
  TrackingMetricType,
} from "../config/metric-definitions";
import { BloodPressureFields } from "./BloodPressureFields";
import { DateTimePicker } from "./DateTimePicker";
import { useCreateMeasurement } from "../hooks/useCreateMeasurement";

interface MeasurementFormProps {
  initialMetric?: TrackingMetricType;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function MeasurementForm({
  initialMetric = "glucose",
  onSuccess,
  onCancel,
}: MeasurementFormProps) {
  // Format current local time for datetime-local input (YYYY-MM-DDTHH:MM)
  const getLocalIsoString = () => {
    const now = new Date();
    const offsetMs = now.getTimezoneOffset() * 60000;
    const localTime = new Date(now.getTime() - offsetMs);
    return localTime.toISOString().slice(0, 16);
  };

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<MeasurementFormValues>({
    resolver: zodResolver(measurementFormSchema),
    defaultValues: {
      metric_type: initialMetric,
      value_primary: "",
      value_secondary: "",
      measured_at: getLocalIsoString(),
      notes: "",
    },
  });

  const currentMetric = watch("metric_type") as TrackingMetricType;
  const config = METRIC_DEFINITIONS[currentMetric] || METRIC_DEFINITIONS.glucose;

  const createMutation = useCreateMeasurement(() => {
    reset();
    if (onSuccess) onSuccess();
  });

  useEffect(() => {
    if (initialMetric) {
      setValue("metric_type", initialMetric);
    }
  }, [initialMetric, setValue]);

  const onSubmit = async (values: MeasurementFormValues) => {
    // Convert datetime-local string to UTC ISO string before submitting
    const localDate = new Date(values.measured_at);
    const utcIso = !isNaN(localDate.getTime())
      ? localDate.toISOString()
      : new Date().toISOString();

    await createMutation.mutateAsync({
      ...values,
      measured_at: utcIso,
    });
  };

  const isPending = isSubmitting || createMutation.isPending;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* 1. Metric Type Selection */}
      <Field className="space-y-1.5">
        <FieldLabel className="text-xs font-bold text-[var(--foreground)]">
          Measurement Type
        </FieldLabel>
        <Controller
          name="metric_type"
          control={control}
          render={({ field }) => (
            <Select
              value={field.value}
              onValueChange={(val) => {
                field.onChange(val);
                setValue("value_primary", "");
                setValue("value_secondary", "");
              }}
              disabled={isPending}
            >
              <SelectTrigger className="h-9 text-xs font-semibold bg-[var(--card)] border-[var(--border)]">
                <SelectValue placeholder="Select measurement type" />
              </SelectTrigger>
              <SelectContent className="bg-[var(--card)] border border-[var(--border)]">
                {TRACKING_METRIC_LIST.map((m) => (
                  <SelectItem key={m.type} value={m.type} className="text-xs">
                    <div className="flex items-center gap-2">
                      <AppIcon icon={m.icon} size="xs" className="text-[var(--primary)]" />
                      <span className="font-semibold">{m.label}</span>
                      <span className="text-[10px] font-mono text-[var(--muted-foreground)] ml-auto">
                        {m.unit}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        <FieldDescription className="text-[11px] text-[var(--muted-foreground)]">
          {config.description}
        </FieldDescription>
      </Field>

      {/* 2. Value Input(s) */}
      {currentMetric === "blood_pressure" ? (
        <BloodPressureFields
          register={register}
          errors={errors}
          disabled={isPending}
        />
      ) : (
        <Field data-invalid={Boolean(errors.value_primary)} className="space-y-1.5">
          <FieldLabel htmlFor="primary-value" className="text-xs font-bold text-[var(--foreground)]">
            {config.shortLabel} Value
          </FieldLabel>
          <InputGroup className="bg-[var(--card)] border-[var(--border)]">
            <InputGroupInput
              id="primary-value"
              type="number"
              step={config.step}
              placeholder={config.placeholder}
              disabled={isPending}
              className="text-xs font-semibold"
              {...register("value_primary")}
            />
            <InputGroupAddon align="inline-end" className="text-[11px] font-mono text-[var(--muted-foreground)]">
              {config.unit}
            </InputGroupAddon>
          </InputGroup>
          {errors.value_primary && (
            <FieldError className="text-[11px] text-[var(--destructive)]">
              {errors.value_primary.message}
            </FieldError>
          )}
        </Field>
      )}

      {/* 3. Measurement Timestamp */}
      <Field data-invalid={Boolean(errors.measured_at)} className="space-y-1.5">
        <FieldLabel className="text-xs font-bold text-[var(--foreground)]">
          Measurement Date & Time
        </FieldLabel>
        <Controller
          name="measured_at"
          control={control}
          render={({ field }) => (
            <DateTimePicker
              value={field.value}
              onChange={field.onChange}
              disabled={isPending}
            />
          )}
        />
        {errors.measured_at && (
          <FieldError className="text-[11px] text-[var(--destructive)]">
            {errors.measured_at.message}
          </FieldError>
        )}
      </Field>

      {/* 4. Optional Context Notes */}
      <Field data-invalid={Boolean(errors.notes)} className="space-y-1.5">
        <FieldLabel htmlFor="measurement-notes" className="text-xs font-bold text-[var(--foreground)]">
          Optional Observation Note
        </FieldLabel>
        <InputGroup className="bg-[var(--card)] border-[var(--border)]">
          <InputGroupInput
            id="measurement-notes"
            type="text"
            placeholder="e.g. 2 hours post-prandial, fasting, morning reading"
            disabled={isPending}
            className="text-xs"
            {...register("notes")}
          />
        </InputGroup>
        {errors.notes && (
          <FieldError className="text-[11px] text-[var(--destructive)]">
            {errors.notes.message}
          </FieldError>
        )}
      </Field>

      {/* 5. Actions */}
      <div className="pt-2 flex items-center justify-end gap-2 border-t border-[var(--border-subtle)]">
        {onCancel && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onCancel}
            disabled={isPending}
            className="text-xs"
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          size="sm"
          disabled={isPending}
          className="h-8 px-4 text-xs font-bold bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white shadow-2xs gap-1.5"
        >
          {isPending && <Spinner className="w-3.5 h-3.5" />}
          <span>{isPending ? "Recording..." : "Save Reading"}</span>
        </Button>
      </div>
    </form>
  );
}
