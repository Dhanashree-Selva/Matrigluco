import { describe, it, expect } from "vitest";
import {
  predictionFormSchema,
  mapFormToCanonicalPayload,
} from "../prediction.schema";

describe("predictionFormSchema", () => {
  const validData = {
    pregnancies: 1,
    glucose: 110,
    blood_pressure: 78,
    skin_thickness: 22,
    insulin: 90,
    bmi: 26.4,
    diabetes_pedigree_function: 0.35,
    age: 28,
  };

  it("validates a compliant 8-feature clinical input payload", () => {
    const result = predictionFormSchema.safeParse(validData);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.glucose).toBe(110);
      expect(result.data.bmi).toBe(26.4);
    }
  });

  it("rejects non-numeric string values without silent zero coercion", () => {
    const invalidData = {
      ...validData,
      glucose: "high",
    };
    const result = predictionFormSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it("rejects out-of-range clinical inputs", () => {
    const outOfRange = {
      ...validData,
      glucose: 30, // Below min 40
    };
    const result = predictionFormSchema.safeParse(outOfRange);
    expect(result.success).toBe(false);
  });

  it("applies clinical canonical defaults to optional inputs during payload mapping", () => {
    const minimal = {
      pregnancies: 2,
      glucose: 125,
      blood_pressure: 82,
      bmi: 29.1,
      age: 32,
    };

    const parsed = predictionFormSchema.parse(minimal);
    const canonical = mapFormToCanonicalPayload(parsed);

    expect(canonical.pregnancies).toBe(2);
    expect(canonical.glucose).toBe(125);
    expect(canonical.skin_thickness).toBe(20);
    expect(canonical.insulin).toBe(80);
    expect(canonical.diabetes_pedigree_function).toBe(0.47);
  });
});
