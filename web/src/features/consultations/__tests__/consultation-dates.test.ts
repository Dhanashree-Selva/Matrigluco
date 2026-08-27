import { describe, it, expect } from "vitest";
import {
  parseAppointmentDate,
  formatDateToIsoDateOnly,
  formatAppointmentDateLabel,
  normalizeTimeString,
  generateDayTimeSlots,
  resolveConsultationMode,
} from "../utils/consultation-dates";

describe("Consultations Date & Timezone Utilities", () => {
  it("parses date-only string YYYY-MM-DD reliably", () => {
    const d = parseAppointmentDate("2026-08-22");
    expect(d.getFullYear()).toBe(2026);
    expect(d.getMonth()).toBe(7); // August (0-indexed)
    expect(d.getDate()).toBe(22);
  });

  it("normalizes ISO string without Z into UTC Date", () => {
    const d = parseAppointmentDate("2026-08-22T10:30:00");
    expect(d).toBeInstanceOf(Date);
    expect(isNaN(d.getTime())).toBe(false);
  });

  it("formats date to ISO date-only format YYYY-MM-DD", () => {
    const date = new Date(2026, 7, 22);
    expect(formatDateToIsoDateOnly(date)).toBe("2026-08-22");
  });

  it("formats appointment date labels for today, tomorrow, and future dates", () => {
    const today = new Date();
    expect(formatAppointmentDateLabel(today)).toBe("Today");

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    expect(formatAppointmentDateLabel(tomorrow)).toBe("Tomorrow");

    const futureDate = new Date(2026, 11, 25);
    const label = formatAppointmentDateLabel(futureDate);
    expect(label).toContain("Dec 25");
  });

  it("normalizes 24-hour and 12-hour time strings correctly", () => {
    expect(normalizeTimeString("16:30")).toBe("4:30 PM");
    expect(normalizeTimeString("09:00")).toBe("9:00 AM");
    expect(normalizeTimeString("12:00")).toBe("12:00 PM");
    expect(normalizeTimeString("10:30 AM")).toBe("10:30 AM");
  });

  it("generates morning, afternoon, and evening slots and flags booked slots", () => {
    const targetDate = new Date(2026, 7, 22);
    const slots = generateDayTimeSlots(targetDate, ["10:00 AM", "4:30 PM"]);

    expect(slots.length).toBeGreaterThan(10);
    const slot10 = slots.find((s) => s.timeFormatted === "10:00 AM");
    expect(slot10?.isAvailable).toBe(false);

    const slot430 = slots.find((s) => s.timeFormatted === "4:30 PM");
    expect(slot430?.isAvailable).toBe(false);

    const slot930 = slots.find((s) => s.timeFormatted === "9:30 AM");
    expect(slot930?.isAvailable).toBe(true);
    expect(slot930?.period).toBe("morning");
  });

  it("resolves consultation mode strings into standard mode enum", () => {
    expect(resolveConsultationMode("Video Consultation")).toBe("video");
    expect(resolveConsultationMode("Live Chat")).toBe("chat");
    expect(resolveConsultationMode("In-Person Clinic")).toBe("in_person");
    expect(resolveConsultationMode(null)).toBe("video");
  });
});
