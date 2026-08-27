import { describe, it, expect } from "vitest";
import { routePaths } from "../route-paths";

describe("routePaths constants and builders", () => {
  it("builds correct dynamic assessment detail paths", () => {
    expect(routePaths.app.assessmentDetail("pred-123")).toBe(
      "/app/assessment/pred-123"
    );
  });

  it("builds correct dynamic report detail paths", () => {
    expect(routePaths.app.reportDetail("rep-999")).toBe("/app/reports/rep-999");
  });

  it("defines standard public, auth, and application roots", () => {
    expect(routePaths.home).toBe("/");
    expect(routePaths.auth.login).toBe("/login");
    expect(routePaths.auth.register).toBe("/register");
    expect(routePaths.onboarding).toBe("/onboarding");
    expect(routePaths.app.dashboard).toBe("/app/dashboard");
    expect(routePaths.app.account.profile).toBe("/app/account/profile");
  });
});
