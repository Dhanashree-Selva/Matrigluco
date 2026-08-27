import { describe, it, expect } from "vitest";
import { formatProbabilityPercent, formatAssessmentDate } from "../formatters";

describe("assessment formatters", () => {
  describe("formatProbabilityPercent", () => {
    it("formats fractional probability with 1 decimal precision", () => {
      expect(formatProbabilityPercent(0.0638)).toBe("6.4%");
      expect(formatProbabilityPercent(0.2058)).toBe("20.6%");
      expect(formatProbabilityPercent(0.71)).toBe("71%");
    });

    it("formats 0-100 scale values properly", () => {
      expect(formatProbabilityPercent(6.38)).toBe("6.4%");
      expect(formatProbabilityPercent(20)).toBe("20%");
    });

    it("handles null and undefined gracefully", () => {
      expect(formatProbabilityPercent(null)).toBe("—%");
      expect(formatProbabilityPercent(undefined)).toBe("—%");
      expect(formatProbabilityPercent(NaN)).toBe("—%");
    });
  });

  describe("formatAssessmentDate", () => {
    it("formats full date and time string", () => {
      const formatted = formatAssessmentDate("2026-08-17T20:45:00Z");
      expect(formatted).toContain("2026");
      expect(formatted).toContain("·");
    });

    it("handles null or invalid date strings", () => {
      expect(formatAssessmentDate(null)).toBe("—");
      expect(formatAssessmentDate("")).toBe("—");
      expect(formatAssessmentDate("invalid-date")).toBe("—");
    });
  });
});
