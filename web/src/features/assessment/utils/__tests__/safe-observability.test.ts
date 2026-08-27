import { describe, it, expect, vi } from "vitest";
import {
  extractSafeContractContext,
  recordSafeObservabilityEvent,
} from "../safe-observability";

describe("Safe Observability & Contract Extraction", () => {
  it("extracts contract mismatch from 422 schema error", () => {
    const error = {
      status: 422,
      code: "CONTRACT_MISMATCH",
      requestId: "REQ-999",
      message: "Unprocessable Entity: schema mismatch",
      response: {
        data: {
          model: { featureContractVersion: "1.2.0" },
        },
      },
    };

    const extracted = extractSafeContractContext(error);
    expect(extracted.isContractMismatch).toBe(true);
    expect(extracted.statusCode).toBe(422);
    expect(extracted.requestId).toBe("REQ-999");
    expect(extracted.backendContractVersion).toBe("1.2.0");
  });

  it("extracts 503 as model unavailable", () => {
    const error = {
      status: 503,
      message: "Model unavailable",
    };

    const extracted = extractSafeContractContext(error);
    expect(extracted.isModelUnavailable).toBe(true);
  });

  it("records safe telemetry without leaking clinical values", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    recordSafeObservabilityEvent({
      event_type: "ASSESSMENT_CONTRACT_MISMATCH",
      route: "/app/assessment",
      status_code: 422,
      error_code: "CONTRACT_MISMATCH",
      request_id: "REQ-999",
      frontend_schema_version: "1.0.0",
      impacted_fields: ["glucose", "insulin"],
    });

    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });
});
