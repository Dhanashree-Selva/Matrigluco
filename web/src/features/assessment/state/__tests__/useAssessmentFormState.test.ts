import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useAssessmentFormState } from "../useAssessmentFormState";
import { AssessmentDetail } from "../../types/assessment.types";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

const mockInvalidateQueries = vi.fn();
vi.mock("@tanstack/react-query", () => ({
  useQueryClient: () => ({
    invalidateQueries: mockInvalidateQueries,
  }),
}));

const mockToastSuccess = vi.fn();
vi.mock("../../../../shared/ui", () => ({
  toast: {
    success: (...args: any[]) => mockToastSuccess(...args),
    error: vi.fn(),
  },
}));

describe("useAssessmentFormState", () => {
  it("initializes in PRISTINE state without validation errors", () => {
    const { result } = renderHook(() => useAssessmentFormState());

    expect(result.current.status).toBe("PRISTINE");
    expect(result.current.errors).toEqual([]);
    expect(result.current.isSubmitting).toBe(false);
  });

  it("transitions to EDITING when fields are modified", () => {
    const { result } = renderHook(() => useAssessmentFormState());

    act(() => {
      result.current.markEditing();
    });

    expect(result.current.status).toBe("EDITING");
  });

  it("transitions to INVALID when validation errors are set", () => {
    const { result } = renderHook(() => useAssessmentFormState());

    act(() => {
      result.current.setValidationErrors([
        {
          fieldKey: "glucose",
          stepId: "signals",
          label: "Glucose",
          message: "Glucose must be between 40 and 500 mg/dL.",
        },
      ]);
    });

    expect(result.current.status).toBe("INVALID");
    expect(result.current.errors.length).toBe(1);
    expect(result.current.firstInvalidField).toBe("glucose");
  });

  it("transitions to REVIEW_READY when all inputs are confirmed valid", () => {
    const { result } = renderHook(() => useAssessmentFormState());

    act(() => {
      result.current.setReviewReady();
    });

    expect(result.current.status).toBe("REVIEW_READY");
    expect(result.current.errors).toEqual([]);
  });

  it("locks duplicate submissions in SUBMITTING state", () => {
    const { result } = renderHook(() => useAssessmentFormState());

    let canSubmitFirst = false;
    let canSubmitSecond = false;

    act(() => {
      canSubmitFirst = result.current.startSubmitting();
    });
    expect(canSubmitFirst).toBe(true);
    expect(result.current.status).toBe("SUBMITTING");
    expect(result.current.isSubmitting).toBe(true);

    act(() => {
      canSubmitSecond = result.current.startSubmitting();
    });
    expect(canSubmitSecond).toBe(false);
  });

  it("handles SUCCESS by invalidating caches, showing toast, and navigating without diagnostic conclusions in toast", () => {
    const { result } = renderHook(() => useAssessmentFormState());

    const mockDetail: AssessmentDetail = {
      id: "assess-777",
      probability: 0.72,
      probabilityScore: 0.72,
      riskBand: "high",
      predictionResult: "Diabetes Risk",
      source: "manual",
      model: {
        key: "diabetes-risk",
        version: "1.0.0",
        featureContractVersion: "1.0.0",
      },
      featuresSnapshot: {},
      containsImputedValues: false,
      mappingVersion: "1.0",
      createdAt: "2026-08-18T10:00:00Z",
      disclaimer: "Educational risk only",
    };

    act(() => {
      result.current.handleSubmissionSuccess(mockDetail);
    });

    expect(result.current.status).toBe("SUCCESS");
    expect(mockInvalidateQueries).toHaveBeenCalled();
    expect(mockToastSuccess).toHaveBeenCalledWith(
      "Assessment completed",
      expect.objectContaining({
        description: "Your result has been saved to your history.",
      })
    );
    expect(mockNavigate).toHaveBeenCalledWith("/app/assessment/assess-777");
  });

  it("handles 422 contract mismatch by setting VALIDATION_MISMATCH state", () => {
    const { result } = renderHook(() => useAssessmentFormState());

    const contractError = {
      status: 422,
      code: "CONTRACT_MISMATCH",
      requestId: "REQ-SCHEMA-101",
      message: "Unprocessable Entity: schema mismatch",
    };

    act(() => {
      result.current.handleSubmissionError(contractError);
    });

    expect(result.current.status).toBe("VALIDATION_MISMATCH");
    expect(result.current.errorContext?.requestId).toBe("REQ-SCHEMA-101");
  });

  it("handles 503 by setting MODEL_UNAVAILABLE state without client-side fake fallback", () => {
    const { result } = renderHook(() => useAssessmentFormState());

    const modelError = {
      status: 503,
      code: "MODEL_UNAVAILABLE",
      message: "Model service temporarily unavailable",
    };

    act(() => {
      result.current.handleSubmissionError(modelError);
    });

    expect(result.current.status).toBe("MODEL_UNAVAILABLE");
  });

  it("handles generic 500 by setting BACKEND_UNAVAILABLE state", () => {
    const { result } = renderHook(() => useAssessmentFormState());

    const serverError = {
      status: 500,
      message: "Internal Server Error",
    };

    act(() => {
      result.current.handleSubmissionError(serverError);
    });

    expect(result.current.status).toBe("BACKEND_UNAVAILABLE");
  });
});
