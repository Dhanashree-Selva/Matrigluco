import { describe, it, expect, beforeEach } from "vitest";
import { browserStorage } from "../browser-storage";

describe("browserStorage utility", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stores and retrieves typed JSON values with fallback defaults", () => {
    expect(browserStorage.getItem("non-existent-key", "default-val")).toBe("default-val");

    browserStorage.setItem("user_theme", { mode: "dark", highContrast: false });
    const stored = browserStorage.getItem("user_theme", { mode: "light", highContrast: false });

    expect(stored.mode).toBe("dark");
    expect(stored.highContrast).toBe(false);
  });

  it("removes items safely", () => {
    browserStorage.setItem("dismissed_tip", true);
    expect(browserStorage.getItem("dismissed_tip", false)).toBe(true);

    browserStorage.removeItem("dismissed_tip");
    expect(browserStorage.getItem("dismissed_tip", false)).toBe(false);
  });
});
