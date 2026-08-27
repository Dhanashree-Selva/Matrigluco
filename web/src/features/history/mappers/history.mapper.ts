import {
  HistoryEventDto,
  HistoryEventVM,
  ChronicleDateGroupVM,
  ChronicleMonthVM,
  ChronicleIndexMonth,
} from "../types/history.types";
import { HISTORY_SOURCE_CONFIG } from "../config/history-sources.config";
import { parseDate } from "../../../lib/dates";

export function mapApiToHistoryEventVM(dto: HistoryEventDto): HistoryEventVM {
  const d = parseDate(dto.occurred_at) || new Date();

  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");

  const monthYearKey = `${y}-${m}`;
  const dateKey = `${y}-${m}-${day}`;

  const timeLabel = d.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  const dateLabel = d.toLocaleDateString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const config = HISTORY_SOURCE_CONFIG[dto.type];
  let deepLink = `${config?.deepLinkPrefix || "/app"}/${dto.resource_id}`;
  if (dto.type === "measurement") {
    deepLink = "/app/tracking";
  }

  return {
    id: dto.id,
    type: dto.type,
    occurredAt: dto.occurred_at,
    resourceId: dto.resource_id,
    title: dto.title,
    summary: dto.summary ?? undefined,
    status: dto.status ?? undefined,
    episodeId: dto.episode_id ?? undefined,
    episodeType: dto.episode_type ?? undefined,
    timeLabel,
    dateLabel,
    monthYearKey,
    dateKey,
    deepLink,
    details: dto.details || {},
  };
}

export function groupEventsIntoChronicle(events: HistoryEventVM[]): ChronicleMonthVM[] {
  if (!events || events.length === 0) return [];

  // Group by Month ("YYYY-MM")
  const monthMap = new Map<string, HistoryEventVM[]>();
  for (const ev of events) {
    const list = monthMap.get(ev.monthYearKey) || [];
    list.push(ev);
    monthMap.set(ev.monthYearKey, list);
  }

  const now = new Date();
  const todayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(
    now.getDate()
  ).padStart(2, "0")}`;

  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const yesterdayKey = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(yesterday.getDate()).padStart(2, "0")}`;

  const months: ChronicleMonthVM[] = [];

  for (const [monthKey, monthEvents] of monthMap.entries()) {
    // Determine Month Title e.g. "August 2026"
    const sampleDate = new Date(`${monthKey}-01T00:00:00Z`);
    const monthTitle = !isNaN(sampleDate.getTime())
      ? sampleDate.toLocaleDateString([], { month: "long", year: "numeric", timeZone: "UTC" })
      : monthKey;

    // Group monthEvents by Date ("YYYY-MM-DD")
    const dateMap = new Map<string, HistoryEventVM[]>();
    for (const ev of monthEvents) {
      const list = dateMap.get(ev.dateKey) || [];
      list.push(ev);
      dateMap.set(ev.dateKey, list);
    }

    const dateGroups: ChronicleDateGroupVM[] = [];

    for (const [dateKey, dayEvents] of dateMap.entries()) {
      const isToday = dateKey === todayKey;
      const isYesterday = dateKey === yesterdayKey;

      const dateObj = new Date(`${dateKey}T00:00:00Z`);
      const weekday = !isNaN(dateObj.getTime())
        ? dateObj.toLocaleDateString([], { weekday: "long", timeZone: "UTC" })
        : "";
      const formattedShort = !isNaN(dateObj.getTime())
        ? dateObj.toLocaleDateString([], { day: "numeric", month: "short", timeZone: "UTC" })
        : dateKey;

      let dateHeading = `${formattedShort} ${dateObj.getFullYear()}`;
      if (isToday) {
        dateHeading = `Today · ${weekday}, ${formattedShort}`;
      } else if (isYesterday) {
        dateHeading = `Yesterday · ${weekday}, ${formattedShort}`;
      } else {
        dateHeading = `${weekday} · ${formattedShort}`;
      }

      // Sort day events newest first
      dayEvents.sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime());

      dateGroups.push({
        dateKey,
        dateHeading,
        isToday,
        isYesterday,
        events: dayEvents,
        eventCount: dayEvents.length,
      });
    }

    // Sort date groups newest first
    dateGroups.sort((a, b) => b.dateKey.localeCompare(a.dateKey));

    months.push({
      monthKey,
      monthTitle,
      dateGroups,
      totalEvents: monthEvents.length,
    });
  }

  // Sort months newest first
  months.sort((a, b) => b.monthKey.localeCompare(a.monthKey));

  return months;
}

export function buildChronicleIndexMonths(availableMonths: string[]): ChronicleIndexMonth[] {
  if (!availableMonths || availableMonths.length === 0) {
    const now = new Date();
    const currentKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    return [
      {
        key: currentKey,
        label: now.toLocaleDateString([], { month: "short" }).toUpperCase(),
        year: String(now.getFullYear()),
        fullLabel: now.toLocaleDateString([], { month: "long", year: "numeric" }),
        hasData: false,
      },
    ];
  }

  return availableMonths.map((key) => {
    const d = new Date(`${key}-01T00:00:00Z`);
    const isValid = !isNaN(d.getTime());
    const label = isValid
      ? d.toLocaleDateString([], { month: "short", timeZone: "UTC" }).toUpperCase()
      : key;
    const year = isValid ? String(d.getUTCFullYear()) : "";
    const fullLabel = isValid
      ? d.toLocaleDateString([], { month: "long", year: "numeric", timeZone: "UTC" })
      : key;

    return {
      key,
      label,
      year,
      fullLabel,
      hasData: true,
    };
  });
}
