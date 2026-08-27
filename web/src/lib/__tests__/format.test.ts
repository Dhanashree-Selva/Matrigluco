import { describe, it, expect } from "vitest";
import { formatPercentage, formatMetric } from "../format";

describe("format utility", () => {
  it("formats percentages from decimals and integers safely", () => {
    expect(formatPercentage(0.754)).toBe("75.4%");
    expect(formatPercentage(75.4)).toBe("75.4%");
    expect(formatPercentage(null)).toBe("—");
    expect(formatPercentage(undefined)).toBe("—");
    expect(formatPercentage(NaN)).toBe("—");
  });

  it("formats metrics with units", () => {
    expect(formatMetric(120, "mg/dL")).toBe("120 mg/dL");
    expect(formatMetric(24.5, "kg/m²")).toBe("24.5 kg/m²");
    expect(formatMetric(null, "mmHg")).toBe("—");
    expect(formatMetric(undefined, "%")).toBe("—");
  });
});
