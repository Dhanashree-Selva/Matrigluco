import { describe, it, expect } from "vitest";
import {
  primaryCareRailNavigation,
  secondaryCareRailNavigation,
  mobileBottomNavigation,
} from "../navigation";

describe("navigation configuration", () => {
  it("contains 6 primary Care Rail destinations", () => {
    expect(primaryCareRailNavigation).toHaveLength(6);
    expect(primaryCareRailNavigation.map((i) => i.key)).toEqual([
      "dashboard",
      "tracking",
      "assessment",
      "history",
      "reports",
      "assistant",
    ]);
  });

  it("contains 2 secondary Care Rail destinations", () => {
    expect(secondaryCareRailNavigation).toHaveLength(2);
    expect(secondaryCareRailNavigation.map((i) => i.key)).toEqual([
      "notifications",
      "account",
    ]);
  });

  it("contains exactly 5 mobile bottom navigation items including More action", () => {
    expect(mobileBottomNavigation).toHaveLength(5);
    expect(mobileBottomNavigation.map((i) => i.key)).toEqual([
      "home",
      "track",
      "assess",
      "assistant",
      "more",
    ]);
  });
});
