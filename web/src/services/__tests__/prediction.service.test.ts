import { describe, it, expect, vi } from "vitest";
import { predictionService } from "../prediction.service";
import * as clientModule from "../http/client";

describe("predictionService", () => {
  it("invokes apiRequest with POST /predictions and canonical payload", async () => {
    const fakeResult = {
      id: "pred-999",
      risk_level: "low" as const,
      risk_score: 0.12,
      glucose: 98,
      bmi: 23.4,
      blood_pressure: 75,
      skin_thickness: 20,
      insulin: 80,
      diabetes_pedigree_function: 0.47,
      age: 27,
      pregnancies: 1,
      created_at: "2026-08-17T12:00:00Z",
    };

    const apiRequestSpy = vi
      .spyOn(clientModule, "apiRequest")
      .mockResolvedValueOnce(fakeResult);

    const payload = {
      pregnancies: 1,
      glucose: 98,
      blood_pressure: 75,
      skin_thickness: 20,
      insulin: 80,
      bmi: 23.4,
      diabetes_pedigree_function: 0.47,
      age: 27,
    };

    const response = await predictionService.predict(payload);

    expect(apiRequestSpy).toHaveBeenCalledWith({
      url: "/predictions",
      method: "POST",
      data: payload,
      signal: undefined,
    });
    expect(response.id).toBe("pred-999");
    expect(response.risk_level).toBe("low");

    apiRequestSpy.mockRestore();
  });
});
