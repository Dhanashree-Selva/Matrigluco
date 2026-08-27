import { TimeSlot, ConsultationModeType } from "../types/consultation.types";

/**
 * Universal UTC-aware date parser for appointment strings and ISO timestamps.
 * Handles both "YYYY-MM-DD", "YYYY-MM-DDTHH:mm:ss", and "YYYY-MM-DD HH:mm:ss".
 */
export function parseAppointmentDate(dateInput?: string | Date | null): Date {
  if (!dateInput) return new Date();
  if (dateInput instanceof Date) {
    return isNaN(dateInput.getTime()) ? new Date() : dateInput;
  }
  let str = String(dateInput).trim();
  if (!str) return new Date();

  // If date-only string "YYYY-MM-DD", treat as calendar date
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    const [y, m, d] = str.split("-").map(Number);
    return new Date(y, m - 1, d, 12, 0, 0);
  }

  // If ISO string without timezone or Z, append UTC indicator
  if (/^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}(:\d{2}(\.\d+)?)?$/.test(str)) {
    str = str.replace(" ", "T") + "Z";
  }

  const d = new Date(str);
  return isNaN(d.getTime()) ? new Date() : d;
}

/**
 * Formats calendar date into "YYYY-MM-DD" without timezone shift.
 */
export function formatDateToIsoDateOnly(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Formats date into readable calendar label (e.g. "Aug 22, 2026", "Today", "Tomorrow").
 */
export function formatAppointmentDateLabel(date: Date | string): string {
  const d = parseAppointmentDate(date);
  const now = new Date();
  const isToday =
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear();

  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const isTomorrow =
    d.getDate() === tomorrow.getDate() &&
    d.getMonth() === tomorrow.getMonth() &&
    d.getFullYear() === tomorrow.getFullYear();

  if (isToday) return "Today";
  if (isTomorrow) return "Tomorrow";

  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: d.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}

/**
 * Normalizes time string into 12-hour formatted time (e.g. "04:30 PM", "10:00 AM").
 */
export function normalizeTimeString(timeStr?: string): string {
  if (!timeStr) return "10:00 AM";
  const trimmed = timeStr.trim();

  // If already in "H:MM AM/PM" format
  if (/^\d{1,2}:\d{2}\s*(AM|PM|am|pm)$/i.test(trimmed)) {
    return trimmed.toUpperCase();
  }

  // If in 24-hour "HH:mm" format
  const match24 = /^(\d{1,2}):(\d{2})$/.exec(trimmed);
  if (match24) {
    let hour = parseInt(match24[1], 10);
    const minute = match24[2];
    const ampm = hour >= 12 ? "PM" : "AM";
    hour = hour % 12 || 12;
    return `${hour}:${minute} ${ampm}`;
  }

  return trimmed;
}

/**
 * Standard slots generator for clinical consultations grouped into Morning / Afternoon / Evening.
 */
export function generateDayTimeSlots(targetDate: Date, bookedSlots: string[] = []): TimeSlot[] {
  const isoDate = formatDateToIsoDateOnly(targetDate);
  const rawTimes = [
    { time24: "09:00", formatted: "9:00 AM", period: "morning" as const },
    { time24: "09:30", formatted: "9:30 AM", period: "morning" as const },
    { time24: "10:00", formatted: "10:00 AM", period: "morning" as const },
    { time24: "10:30", formatted: "10:30 AM", period: "morning" as const },
    { time24: "11:00", formatted: "11:00 AM", period: "morning" as const },
    { time24: "11:30", formatted: "11:30 AM", period: "morning" as const },
    { time24: "14:00", formatted: "2:00 PM", period: "afternoon" as const },
    { time24: "14:30", formatted: "2:30 PM", period: "afternoon" as const },
    { time24: "15:00", formatted: "3:00 PM", period: "afternoon" as const },
    { time24: "15:30", formatted: "3:30 PM", period: "afternoon" as const },
    { time24: "16:00", formatted: "4:00 PM", period: "afternoon" as const },
    { time24: "16:30", formatted: "4:30 PM", period: "afternoon" as const },
    { time24: "17:00", formatted: "5:00 PM", period: "evening" as const },
    { time24: "17:30", formatted: "5:30 PM", period: "evening" as const },
    { time24: "18:00", formatted: "6:00 PM", period: "evening" as const },
  ];

  return rawTimes.map((item) => {
    const isBooked = bookedSlots.some(
      (b) => b.toLowerCase() === item.formatted.toLowerCase() || b === item.time24
    );

    return {
      id: `slot-${isoDate}-${item.time24}`,
      time24: item.time24,
      timeFormatted: item.formatted,
      period: item.period,
      isAvailable: !isBooked,
      datetimeIso: `${isoDate}T${item.time24}:00`,
    };
  });
}

/**
 * Resolves canonical consultation mode enum from arbitrary string.
 */
export function resolveConsultationMode(typeStr?: string | null): ConsultationModeType {
  if (!typeStr) return "video";
  const lower = typeStr.toLowerCase();
  if (lower.includes("chat") || lower.includes("message")) return "chat";
  if (lower.includes("in-person") || lower.includes("in_person") || lower.includes("clinic")) return "in_person";
  return "video";
}
