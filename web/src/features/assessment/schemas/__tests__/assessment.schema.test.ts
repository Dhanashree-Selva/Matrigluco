import { describe, it, expect } from "vitest";
import {
  fullAssessmentSchema,
  personalContextSchema,
  clinicalSignalsSchema,
  metabolicContextSchema,
  historyContextSchema,
} from "../assessment.schema";

describe("Assessment Zod Schemas", () => {
  describe("Personal Context Schema", () => {
    it("accepts valid maternal age and pregnancy count", () => {
      const valid = { age: "29", pregnancies: "1" };
      expect(personalContextSchema.safeParse(valid).success).toBe(true);
    });

    it("rejects non-integer age or out-of-bound age", () => {
      expect(personalContextSchema.safeParse({ age: "12", pregnancies: "0" }).success).toBe(false);
      expect(personalContextSchema.safeParse({ age: "29.5", pregnancies: "0" }).success).toBe(false);
      expect(personalContextSchema.safeParse({ age: "115", pregnancies: "0" }).success).toBe(false);
    });

    it("rejects negative or excessive pregnancy count", () => {
      expect(personalContextSchema.safeParse({ age: "25", pregnancies: "-1" }).success).toBe(false);
      expect(personalContextSchema.safeParse({ age: "25", pregnancies: "30" }).success).toBe(false);
    });
  });

  describe("Clinical Signals Schema", () => {
    it("accepts valid glucose and diastolic blood pressure", () => {
      const valid = { glucose: "102.5", bloodPressure: "72" };
      expect(clinicalSignalsSchema.safeParse(valid).success).toBe(true);
    });

    it("rejects glucose out of accepted range 40-500", () => {
      expect(clinicalSignalsSchema.safeParse({ glucose: "35", bloodPressure: "70" }).success).toBe(false);
      expect(clinicalSignalsSchema.safeParse({ glucose: "550", bloodPressure: "70" }).success).toBe(false);
    });

    it("rejects diastolic blood pressure out of accepted range 40-250", () => {
      expect(clinicalSignalsSchema.safeParse({ glucose: "100", bloodPressure: "30" }).success).toBe(false);
      expect(clinicalSignalsSchema.safeParse({ glucose: "100", bloodPressure: "260" }).success).toBe(false);
    });
  });

  describe("Metabolic Context Schema", () => {
    it("accepts valid skinfold, insulin, and BMI", () => {
      const valid = { skinThickness: "23", insulin: "85.4", bmi: "24.3" };
      expect(metabolicContextSchema.safeParse(valid).success).toBe(true);
    });

    it("rejects skin thickness out of 5-120 range", () => {
      expect(
        metabolicContextSchema.safeParse({ skinThickness: "2", insulin: "80", bmi: "25" }).success
      ).toBe(false);
    });

    it("rejects BMI out of 10-80 range", () => {
      expect(
        metabolicContextSchema.safeParse({ skinThickness: "20", insulin: "80", bmi: "5" }).success
      ).toBe(false);
    });
  });

  describe("History Context Schema", () => {
    it("accepts valid pedigree score in 0.05-3.0 range", () => {
      expect(
        historyContextSchema.safeParse({ diabetesPedigreeFunction: "0.45" }).success
      ).toBe(true);
    });

    it("rejects pedigree score outside range", () => {
      expect(
        historyContextSchema.safeParse({ diabetesPedigreeFunction: "0.01" }).success
      ).toBe(false);
      expect(
        historyContextSchema.safeParse({ diabetesPedigreeFunction: "4.5" }).success
      ).toBe(false);
    });
  });

  describe("Full Assessment Schema", () => {
    it("validates all 8 canonical features together", () => {
      const allValid = {
        age: "29",
        pregnancies: "2",
        glucose: "115",
        bloodPressure: "76",
        skinThickness: "28",
        insulin: "110",
        bmi: "26.4",
        diabetesPedigreeFunction: "0.62",
      };
      expect(fullAssessmentSchema.safeParse(allValid).success).toBe(true);
    });

    it("fails if any feature is missing or empty string", () => {
      const missingOne = {
        age: "29",
        pregnancies: "2",
        glucose: "",
        bloodPressure: "76",
        skinThickness: "28",
        insulin: "110",
        bmi: "26.4",
        diabetesPedigreeFunction: "0.62",
      };
      expect(fullAssessmentSchema.safeParse(missingOne).success).toBe(false);
    });
  });
});
