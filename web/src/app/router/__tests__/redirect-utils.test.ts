import { describe, it, expect } from "vitest";
import { getSafeRedirectPath } from "../redirect-utils";

describe("getSafeRedirectPath utility", () => {
  it("allows safe internal application paths", () => {
    expect(getSafeRedirectPath("/app/reports/123")).toBe("/app/reports/123");
    expect(getSafeRedirectPath("/app/dashboard")).toBe("/app/dashboard");
    expect(getSafeRedirectPath("/onboarding")).toBe("/onboarding");
  });

  it("rejects open redirects and external protocol attacks", () => {
    expect(getSafeRedirectPath("https://malicious.com")).toBe("/app/dashboard");
    expect(getSafeRedirectPath("//evil.com")).toBe("/app/dashboard");
    expect(getSafeRedirectPath("javascript:alert(1)")).toBe("/app/dashboard");
  });

  it("falls back to default dashboard on null, undefined, or empty strings", () => {
    expect(getSafeRedirectPath(null)).toBe("/app/dashboard");
    expect(getSafeRedirectPath(undefined)).toBe("/app/dashboard");
    expect(getSafeRedirectPath("")).toBe("/app/dashboard");
  });
});
