import { z } from "zod";
import { METRIC_DEFINITIONS, TrackingMetricType } from "../config/metric-definitions";

export const measurementFormSchema = z
  .object({
    metric_type: z.enum(["glucose", "blood_pressure", "weight", "bmi", "hba1c"] as const),
    value_primary: z.string().refine(
      (val) => {
        if (!val || val.trim() === "") return false;
        const num = Number(val);
        return !isNaN(num) && isFinite(num) && num > 0;
      },
      { message: "Please enter a valid numeric value greater than 0." }
    ),
    value_secondary: z.string().optional(),
    measured_at: z.string().min(1, "Measurement time is required."),
    notes: z.string().max(500, "Notes cannot exceed 500 characters.").optional(),
  })
  .superRefine((data, ctx) => {
    const metricConfig = METRIC_DEFINITIONS[data.metric_type as TrackingMetricType];
    const primaryNum = Number(data.value_primary);

    if (metricConfig) {
      if (primaryNum < metricConfig.min || primaryNum > metricConfig.max) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `${metricConfig.shortLabel} must be between ${metricConfig.min} and ${metricConfig.max} ${metricConfig.unit}.`,
          path: ["value_primary"],
        });
      }
    }

    if (data.metric_type === "blood_pressure") {
      if (!data.value_secondary || data.value_secondary.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Diastolic value is required for blood pressure.",
          path: ["value_secondary"],
        });
        return;
      }

      const secondaryNum = Number(data.value_secondary);
      if (isNaN(secondaryNum) || !isFinite(secondaryNum) || secondaryNum <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Diastolic pressure must be a valid positive number.",
          path: ["value_secondary"],
        });
        return;
      }

      if (metricConfig?.secondaryMin && secondaryNum < metricConfig.secondaryMin) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Diastolic pressure must be at least ${metricConfig.secondaryMin} mmHg.`,
          path: ["value_secondary"],
        });
      }

      if (metricConfig?.secondaryMax && secondaryNum > metricConfig.secondaryMax) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Diastolic pressure cannot exceed ${metricConfig.secondaryMax} mmHg.`,
          path: ["value_secondary"],
        });
      }

      if (primaryNum <= secondaryNum) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Systolic pressure must be greater than diastolic pressure.",
          path: ["value_primary"],
        });
      }
    }
  });

export type MeasurementFormValues = z.infer<typeof measurementFormSchema>;
