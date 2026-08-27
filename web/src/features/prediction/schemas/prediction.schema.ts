import { z } from "zod";

export const predictionFormSchema = z.object({
  pregnancies: z
    .number({ invalid_type_error: "Pregnancy count is required." })
    .int("Must be a whole number.")
    .min(0, "Cannot be negative.")
    .max(20, "Please verify pregnancy count."),

  glucose: z
    .number({ invalid_type_error: "Blood glucose is required." })
    .min(40, "Blood glucose is too low (min 40 mg/dL).")
    .max(500, "Blood glucose is too high (max 500 mg/dL)."),

  blood_pressure: z
    .number({ invalid_type_error: "Blood pressure is required." })
    .min(40, "Diastolic blood pressure too low (min 40 mmHg).")
    .max(200, "Diastolic blood pressure too high (max 200 mmHg)."),

  skin_thickness: z
    .number({ invalid_type_error: "Skin thickness is required." })
    .min(5, "Skin thickness must be at least 5 mm.")
    .max(99, "Skin thickness exceeds valid range.")
    .default(20),

  insulin: z
    .number({ invalid_type_error: "Insulin level is required." })
    .min(5, "Insulin must be at least 5 µU/mL.")
    .max(900, "Insulin exceeds valid physiological range.")
    .default(80),

  bmi: z
    .number({ invalid_type_error: "BMI is required." })
    .min(10, "BMI is too low (min 10 kg/m²).")
    .max(80, "BMI exceeds physiological range (max 80 kg/m²)."),

  diabetes_pedigree_function: z
    .number({ invalid_type_error: "Pedigree function is required." })
    .min(0.05, "Pedigree score must be at least 0.05.")
    .max(2.5, "Pedigree score exceeds valid range.")
    .default(0.47),

  age: z
    .number({ invalid_type_error: "Age is required." })
    .int("Age must be an integer.")
    .min(14, "Patient age must be at least 14 years.")
    .max(65, "Patient age exceeds standard obstetric range."),
});

export type PredictionFormValues = z.infer<typeof predictionFormSchema>;

export function mapFormToCanonicalPayload(
  formValues: PredictionFormValues
): PredictionFormValues {
  return {
    pregnancies: formValues.pregnancies,
    glucose: formValues.glucose,
    blood_pressure: formValues.blood_pressure,
    skin_thickness: formValues.skin_thickness ?? 20,
    insulin: formValues.insulin ?? 80,
    bmi: formValues.bmi,
    diabetes_pedigree_function: formValues.diabetes_pedigree_function ?? 0.47,
    age: formValues.age,
  };
}
