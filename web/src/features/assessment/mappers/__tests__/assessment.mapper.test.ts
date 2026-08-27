import { describe, it, expect } from "vitest";
import {
  mapAssessmentFormToDto,
  mapApiToAssessmentDetail,
} from "../assessment.mapper";
import { AssessmentFormValues } from "../../types/assessment.types";

describe("mapAssessmentFormToDto", () => {
  it("strictly maps all 8 form string values to canonical numeric DTO", () => {
    const formValues: AssessmentFormValues = {
      age: "29",
      pregnancies: "1",
      glucose: "102.5",
      bloodPressure: "72",
      skinThickness: "23.4",
      insulin: "85",
      bmi: "24.3",
      diabetesPedigreeFunction: "0.45",
    };

    const dto = mapAssessmentFormToDto(formValues);

    expect(dto).toEqual({
      age: 29,
      pregnancies: 1,
      glucose: 102.5,
      blood_pressure: 72,
      skin_thickness: 23.4,
      insulin: 85,
      bmi: 24.3,
      diabetes_pedigree_function: 0.45,
    });
  });

  it("throws an error and never supplies hidden zero defaults for empty fields", () => {
    const invalidForm: AssessmentFormValues = {
      age: "29",
      pregnancies: "1",
      glucose: "",
      bloodPressure: "72",
      skinThickness: "23",
      insulin: "85",
      bmi: "24.3",
      diabetesPedigreeFunction: "0.45",
    };

    expect(() => mapAssessmentFormToDto(invalidForm)).toThrow(
      "Field glucose is required and cannot be empty."
    );
  });

  it("throws error for non-numeric or NaN strings", () => {
    const invalidForm: AssessmentFormValues = {
      age: "abc",
      pregnancies: "1",
      glucose: "100",
      bloodPressure: "72",
      skinThickness: "23",
      insulin: "85",
      bmi: "24.3",
      diabetesPedigreeFunction: "0.45",
    };

    expect(() => mapAssessmentFormToDto(invalidForm)).toThrow(
      "Field age must be a valid finite number."
    );
  });
});

describe("mapApiToAssessmentDetail", () => {
  it("maps snake_case API payload into normalized AssessmentDetail object", () => {
    const apiPayload = {
      id: "pred-abc-123",
      probability: 0.6438,
      probability_score: 64.38,
      risk_band: "moderate",
      prediction_result: "Diabetes Risk",
      source: "manual",
      model: {
        key: "diabetes-risk",
        version: "1.0.0",
        feature_contract_version: "1.0",
      },
      features_snapshot: {
        Age: 31,
        Glucose: 145,
        BloodPressure: 82,
      },
      created_at: "2026-08-18T02:00:00Z",
    };

    const detail = mapAssessmentFormToDto && mapApiToAssessmentDetail(apiPayload);
    expect(detail.id).toBe("pred-abc-123");
    expect(detail.probability).toBe(0.6438);
    expect(detail.riskBand).toBe("moderate");
    expect(detail.featuresSnapshot).toEqual({ Age: 31, Glucose: 145, BloodPressure: 82 });
    expect(detail.createdAt).toBe("2026-08-18T02:00:00Z");
  });
});

