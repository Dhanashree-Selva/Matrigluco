import { describe, it, expect } from "vitest";
import { normalizeApiError } from "../errors";
import { AppApiError } from "../../types/api";

describe("normalizeApiError", () => {
  it("returns AppApiError instance unchanged", () => {
    const custom = new AppApiError("Custom error", "CUSTOM_CODE", 400);
    const result = normalizeApiError(custom);
    expect(result).toBe(custom);
    expect(result.code).toBe("CUSTOM_CODE");
    expect(result.status).toBe(400);
  });

  it("extracts structured error envelope from Axios error", () => {
    const fakeAxiosError = {
      isAxiosError: true,
      response: {
        status: 422,
        data: {
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid medical parameter value.",
            details: { field: "glucose" },
          },
          meta: {
            request_id: "req-12345",
          },
        },
      },
    };

    const result = normalizeApiError(fakeAxiosError);
    expect(result.message).toBe("Invalid medical parameter value.");
    expect(result.code).toBe("VALIDATION_ERROR");
    expect(result.status).toBe(422);
    expect(result.requestId).toBe("req-12345");
  });

  it("handles network connection failures gracefully", () => {
    const networkError = {
      isAxiosError: true,
      response: undefined,
    };

    const result = normalizeApiError(networkError);
    expect(result.code).toBe("NETWORK_ERROR");
    expect(result.status).toBe(0);
  });

  it("handles timeout errors", () => {
    const timeoutError = {
      isAxiosError: true,
      code: "ECONNABORTED",
      response: undefined,
    };

    const result = normalizeApiError(timeoutError);
    expect(result.code).toBe("TIMEOUT");
    expect(result.status).toBe(408);
  });
});
