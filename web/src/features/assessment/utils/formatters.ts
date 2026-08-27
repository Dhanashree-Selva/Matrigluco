import { parseDate } from "../../../lib/dates";

/**
 * Formats a raw model probability (0.0 - 1.0 or 0 - 100) into a percentage string
 * with 1 decimal precision when fractional (e.g. 6.4%, 20.6%), or clean integer when whole (e.g. 20%).
 */
export function formatProbabilityPercent(
  prob: number | null | undefined,
  precision: number = 1
): string {
  if (prob === undefined || prob === null || isNaN(Number(prob))) return "—%";
  const num = Number(prob);
  const percent = num <= 1 ? num * 100 : num;
  const formatted = percent.toFixed(precision);
  return `${formatted.replace(/\.0$/, "")}%`;
}

/**
 * Formats an assessment timestamp with full date and time (e.g. "Aug 17, 2026 · 8:15 PM").
 */
export function formatAssessmentDate(
  dateString: string | null | undefined,
  options: { includeYear?: boolean; includeTime?: boolean } = {}
): string {
  if (!dateString) return "—";
  try {
    const d = parseDate(dateString);
    if (!d) return "—";

    const { includeYear = true, includeTime = true } = options;

    const dateFormatted = d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      ...(includeYear ? { year: "numeric" } : {}),
    });

    if (!includeTime) return dateFormatted;

    const timeFormatted = d.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    return `${dateFormatted} · ${timeFormatted}`;
  } catch {
    return "—";
  }
}
