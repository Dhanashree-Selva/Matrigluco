import { describe, it, expect, vi } from "vitest";
import { assessmentApi } from "../assessment.api";
import * as clientModule from "../../../../services/http/client";

describe("assessmentApi", () => {
  it("calls evaluateRisk via POST /predictions", async () => {
    const fakePrediction = {
      id: "pred-1",
      risk_level: "low" as const,
      risk_score: 0.15,
      glucose: 105,
      blood_pressure: 80,
      skin_thickness: 20,
      insulin: 80,
      bmi: 24.5,
      diabetes_pedigree_function: 0.47,
      age: 29,
      pregnancies: 1,
      created_at: "2026-08-17T12:00:00Z",
    };

    const spy = vi
      .spyOn(clientModule, "apiRequest")
      .mockResolvedValueOnce(fakePrediction);

    const result = await assessmentApi.evaluateRisk({
      pregnancies: 1,
      glucose: 105,
      blood_pressure: 80,
      skin_thickness: 20,
      insulin: 80,
      bmi: 24.5,
      diabetes_pedigree_function: 0.47,
      age: 29,
    });

    expect(spy).toHaveBeenCalledWith({
      url: "/predictions",
      method: "POST",
      data: expect.objectContaining({ glucose: 105 }),
      signal: undefined,
    });
    expect(result.risk_level).toBe("low");

    spy.mockRestore();
  });
});
