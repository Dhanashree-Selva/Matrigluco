import { describe, it, expect } from "vitest";
import { parseDate, formatDate, formatTime, calculatePregnancyWeek } from "../dates";

describe("dates utility", () => {
  it("normalizes naive ISO strings to UTC in parseDate", () => {
    const naiveParsed = parseDate("2026-08-18T06:52:00");
    const utcParsed = parseDate("2026-08-18T06:52:00Z");

    expect(naiveParsed).not.toBeNull();
    expect(utcParsed).not.toBeNull();
    expect(naiveParsed?.getTime()).toBe(utcParsed?.getTime());
  });

  it("formats date strings safely", () => {
    expect(formatDate("2026-08-17T12:00:00Z")).toContain("2026");
    expect(formatDate("2026-08-17T12:00:00")).toContain("2026");
    expect(formatDate("")).toBe("—");
    expect(formatDate(null)).toBe("—");
    expect(formatDate("invalid-date")).toBe("—");
  });

  it("formats time strings safely and accurately converts UTC", () => {
    expect(formatTime("2026-08-17T14:30:00Z")).toMatch(/\d{1,2}:\d{2}\s?(AM|PM)/i);
    expect(formatTime("2026-08-17T14:30:00")).toBe(formatTime("2026-08-17T14:30:00Z"));
    expect(formatTime("")).toBe("—");
    expect(formatTime(null)).toBe("—");
  });

  it("calculates gestational week accurately within bounded range [1, 40]", () => {
    // 10 weeks from now
    const futureDate = new Date(Date.now() + 10 * 7 * 24 * 60 * 60 * 1000).toISOString();
    const week = calculatePregnancyWeek(futureDate);
    expect(typeof week).toBe("number");
    expect(week).toBeGreaterThanOrEqual(1);
    expect(week).toBeLessThanOrEqual(40);
  });

  it("handles missing due date gracefully", () => {
    expect(calculatePregnancyWeek(null)).toBe("—");
    expect(calculatePregnancyWeek("")).toBe("—");
  });
});
