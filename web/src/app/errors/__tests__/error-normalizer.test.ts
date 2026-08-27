import { describe, it, expect } from "vitest";
import { normalizeAppError } from "../error-normalizer";
import { AppApiError } from "../../../types/api";

describe("normalizeAppError", () => {
  it("maps 404 AppApiError to resource-unavailable state", () => {
    const err = new AppApiError("Report not found", "NOT_FOUND", 404, null, "REQ-991");
    const normalized = normalizeAppError(err);

    expect(normalized.kind).toBe("resource-unavailable");
    expect(normalized.statusCode).toBe(404);
    expect(normalized.requestId).toBe("REQ-991");
    expect(normalized.headline).toBe("This resource isn't available");
  });

  it("maps 403 AppApiError to access-restricted state", () => {
    const err = new AppApiError("Forbidden", "FORBIDDEN", 403);
    const normalized = normalizeAppError(err);

    expect(normalized.kind).toBe("access-restricted");
    expect(normalized.statusCode).toBe(403);
  });

  it("maps 401 AppApiError to session-ended state", () => {
    const err = new AppApiError("Unauthorized", "UNAUTHORIZED", 401);
    const normalized = normalizeAppError(err);

    expect(normalized.kind).toBe("session-ended");
    expect(normalized.statusCode).toBe(401);
  });

  it("maps 429 AppApiError to rate-limited state", () => {
    const err = new AppApiError("Too many requests", "RATE_LIMIT", 429);
    const normalized = normalizeAppError(err);

    expect(normalized.kind).toBe("rate-limited");
    expect(normalized.statusCode).toBe(429);
  });

  it("maps 503 AppApiError to service-unavailable state", () => {
    const err = new AppApiError("Service Unavailable", "SERVICE_UNAVAILABLE", 503);
    const normalized = normalizeAppError(err);

    expect(normalized.kind).toBe("service-unavailable");
    expect(normalized.statusCode).toBe(503);
  });

  it("maps generic Error to unexpected-error state without exposing internals", () => {
    const err = new Error("Uncaught syntax error in module");
    const normalized = normalizeAppError(err);

    expect(normalized.kind).toBe("unexpected-error");
    expect(normalized.headline).toBe("Something interrupted this page");
  });
});
