import { describe, it, expect } from "vitest";
import { resolveNotificationTarget } from "../utils/notification-targets";
import { routePaths } from "../../../app/route-paths";

describe("resolveNotificationTarget", () => {
  it("resolves report targets with encoded resource ID", () => {
    expect(resolveNotificationTarget("report", "rep-123")).toBe("/app/reports/rep-123");
    expect(resolveNotificationTarget("report", undefined)).toBe(routePaths.app.reports);
  });

  it("resolves consultation targets with encoded ID", () => {
    expect(resolveNotificationTarget("consultation", "c-456")).toBe("/app/consultations/c-456");
    expect(resolveNotificationTarget("consultation", undefined)).toBe(routePaths.app.consultations);
  });

  it("resolves tracking targets", () => {
    expect(resolveNotificationTarget("tracking")).toBe(routePaths.app.tracking);
    expect(resolveNotificationTarget("glucose")).toBe(routePaths.app.tracking);
  });

  it("resolves account security and preferences targets", () => {
    expect(resolveNotificationTarget("security")).toBe(routePaths.app.account.security);
    expect(resolveNotificationTarget("preferences")).toBe(routePaths.app.account.preferences);
  });

  it("returns undefined for unknown or unsafe resource types", () => {
    expect(resolveNotificationTarget("https://malicious.com")).toBeUndefined();
    expect(resolveNotificationTarget(undefined)).toBeUndefined();
  });
});
