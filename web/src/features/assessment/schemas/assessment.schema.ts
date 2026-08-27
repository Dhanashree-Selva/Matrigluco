import { z } from "zod";
import { ASSESSMENT_FIELDS } from "../config/assessment-fields";

const createNumericField = (
  min: number,
  max: number,
  label: string,
  unit?: string,
  integerOnly = false
) =>
  z
    .string()
    .min(1, `${label} is required.`)
    .refine((val) => !isNaN(Number(val.trim())), {
      message: `${label} must be a valid number.`,
    })
    .refine(
      (val) => {
        const num = Number(val.trim());
        return isFinite(num);
      },
      { message: `${label} must be a finite number.` }
    )
    .refine(
      (val) => {
        const num = Number(val.trim());
        return num >= min && num <= max;
      },
      {
        message: `${label} must be between ${min} and ${max}${unit ? ` ${unit}` : ""}.`,
      }
    )
    .refine(
      (val) => {
        if (!integerOnly) return true;
        const num = Number(val.trim());
        return Number.isInteger(num);
      },
      { message: `${label} must be a whole number.` }
    );

export const personalContextSchema = z.object({
  age: createNumericField(
    ASSESSMENT_FIELDS.age.min,
    ASSESSMENT_FIELDS.age.max,
    ASSESSMENT_FIELDS.age.label,
    ASSESSMENT_FIELDS.age.unit,
    true
  ),
  pregnancies: createNumericField(
    ASSESSMENT_FIELDS.pregnancies.min,
    ASSESSMENT_FIELDS.pregnancies.max,
    ASSESSMENT_FIELDS.pregnancies.label,
    undefined,
    true
  ),
});

export const clinicalSignalsSchema = z.object({
  glucose: createNumericField(
    ASSESSMENT_FIELDS.glucose.min,
    ASSESSMENT_FIELDS.glucose.max,
    ASSESSMENT_FIELDS.glucose.label,
    ASSESSMENT_FIELDS.glucose.unit
  ),
  bloodPressure: createNumericField(
    ASSESSMENT_FIELDS.bloodPressure.min,
    ASSESSMENT_FIELDS.bloodPressure.max,
    ASSESSMENT_FIELDS.bloodPressure.label,
    ASSESSMENT_FIELDS.bloodPressure.unit
  ),
});

export const metabolicContextSchema = z.object({
  skinThickness: createNumericField(
    ASSESSMENT_FIELDS.skinThickness.min,
    ASSESSMENT_FIELDS.skinThickness.max,
    ASSESSMENT_FIELDS.skinThickness.label,
    ASSESSMENT_FIELDS.skinThickness.unit
  ),
  insulin: createNumericField(
    ASSESSMENT_FIELDS.insulin.min,
    ASSESSMENT_FIELDS.insulin.max,
    ASSESSMENT_FIELDS.insulin.label,
    ASSESSMENT_FIELDS.insulin.unit
  ),
  bmi: createNumericField(
    ASSESSMENT_FIELDS.bmi.min,
    ASSESSMENT_FIELDS.bmi.max,
    ASSESSMENT_FIELDS.bmi.label,
    ASSESSMENT_FIELDS.bmi.unit
  ),
});

export const historyContextSchema = z.object({
  diabetesPedigreeFunction: createNumericField(
    ASSESSMENT_FIELDS.diabetesPedigreeFunction.min,
    ASSESSMENT_FIELDS.diabetesPedigreeFunction.max,
    ASSESSMENT_FIELDS.diabetesPedigreeFunction.label,
    undefined
  ),
});

export const fullAssessmentSchema = personalContextSchema
  .merge(clinicalSignalsSchema)
  .merge(metabolicContextSchema)
  .merge(historyContextSchema);

export type AssessmentFormSchema = z.infer<typeof fullAssessmentSchema>;
