import { describe, it, expect } from "vitest";
import { measurementFormSchema } from "../tracking.schema";

describe("measurementFormSchema", () => {
  it("validates valid glucose input", () => {
    const res = measurementFormSchema.safeParse({
      metric_type: "glucose",
      value_primary: "102",
      measured_at: "2026-08-18T08:15",
      notes: "Fasting morning reading",
    });

    expect(res.success).toBe(true);
  });

  it("validates valid blood pressure input with systolic and diastolic", () => {
    const res = measurementFormSchema.safeParse({
      metric_type: "blood_pressure",
      value_primary: "120",
      value_secondary: "80",
      measured_at: "2026-08-18T08:15",
    });

    expect(res.success).toBe(true);
  });

  it("rejects blood pressure when diastolic is missing", () => {
    const res = measurementFormSchema.safeParse({
      metric_type: "blood_pressure",
      value_primary: "120",
      value_secondary: "",
      measured_at: "2026-08-18T08:15",
    });

    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.error.issues[0].message).toContain("Diastolic value is required");
    }
  });

  it("rejects blood pressure when systolic is less than or equal to diastolic", () => {
    const res = measurementFormSchema.safeParse({
      metric_type: "blood_pressure",
      value_primary: "80",
      value_secondary: "120",
      measured_at: "2026-08-18T08:15",
    });

    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.error.issues[0].message).toContain(
        "Systolic pressure must be greater than diastolic pressure"
      );
    }
  });

  it("rejects out-of-range metric values", () => {
    const res = measurementFormSchema.safeParse({
      metric_type: "glucose",
      value_primary: "1000",
      measured_at: "2026-08-18T08:15",
    });

    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.error.issues[0].message).toContain("Glucose must be between 30 and 500 mg/dL");
    }
  });

  it("validates weight, BMI, and HbA1c within clinical bounds", () => {
    const weightRes = measurementFormSchema.safeParse({
      metric_type: "weight",
      value_primary: "64.5",
      measured_at: "2026-08-18T08:15",
    });
    expect(weightRes.success).toBe(true);

    const bmiRes = measurementFormSchema.safeParse({
      metric_type: "bmi",
      value_primary: "24.2",
      measured_at: "2026-08-18T08:15",
    });
    expect(bmiRes.success).toBe(true);

    const hba1cRes = measurementFormSchema.safeParse({
      metric_type: "hba1c",
      value_primary: "5.6",
      measured_at: "2026-08-18T08:15",
    });
    expect(hba1cRes.success).toBe(true);
  });
});
