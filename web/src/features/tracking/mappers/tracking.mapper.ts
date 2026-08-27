import {
  HealthMeasurementApiItem,
  MeasurementViewModel,
  MeasurementGroup,
  ArithmeticTrendSummary,
  TemporalPeriod,
  CustomDateRange,
  TrackingMetricType,
} from "../types/tracking.types";
import { METRIC_DEFINITIONS } from "../config/metric-definitions";
import { parseDate } from "../../../lib/dates";

export function formatTimeOnly(isoString: string): string {
  try {
    const d = parseDate(isoString);
    if (!d) return "--:--";
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "--:--";
  }
}

export function formatDateHeading(isoString: string): string {
  try {
    const d = parseDate(isoString);
    if (!d) return "Unknown Date";

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const itemDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());

    const diffDays = Math.round(
      (today.getTime() - itemDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    return d.toLocaleDateString([], {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: d.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  } catch {
    return "Recorded";
  }
}

export function mapApiToMeasurementViewModel(
  apiItem: HealthMeasurementApiItem
): MeasurementViewModel {
  const metricType = (apiItem.metric_type || "glucose").toLowerCase() as TrackingMetricType;
  const config = METRIC_DEFINITIONS[metricType];
  const unit = apiItem.unit || config?.unit || "";

  const primary = Number(apiItem.value_primary ?? apiItem.value ?? 0);
  const secondary =
    apiItem.value_secondary !== undefined && apiItem.value_secondary !== null
      ? Number(apiItem.value_secondary)
      : null;

  const formattedVal =
    metricType === "blood_pressure" && secondary !== null
      ? `${Math.round(primary)} / ${Math.round(secondary)}`
      : `${primary}`;

  const measuredAt = apiItem.measured_at || apiItem.created_at || new Date().toISOString();

  return {
    id: apiItem.id || `temp-${Math.random()}`,
    metricType,
    valuePrimary: primary,
    valueSecondary: secondary,
    unit,
    measuredAt,
    notes: apiItem.notes || null,
    source: apiItem.source || "manual",
    createdAt: apiItem.created_at || measuredAt,
    formattedValue: formattedVal,
    formattedTime: formatTimeOnly(measuredAt),
    formattedDate: formatDateHeading(measuredAt),
  };
}

export function groupMeasurementsByLocalDate(
  items: MeasurementViewModel[]
): MeasurementGroup[] {
  const groupsMap = new Map<string, MeasurementViewModel[]>();

  // Sort items descending by measuredAt timestamp (newest first)
  const sorted = [...items].sort(
    (a, b) =>
      (parseDate(b.measuredAt)?.getTime() || 0) -
      (parseDate(a.measuredAt)?.getTime() || 0)
  );

  for (const item of sorted) {
    const d = parseDate(item.measuredAt);
    const dateKey = d
      ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
          d.getDate()
        ).padStart(2, "0")}`
      : "unknown";

    if (!groupsMap.has(dateKey)) {
      groupsMap.set(dateKey, []);
    }
    groupsMap.get(dateKey)!.push(item);
  }

  const result: MeasurementGroup[] = [];
  for (const [dateKey, groupItems] of groupsMap.entries()) {
    const title = formatDateHeading(groupItems[0].measuredAt);
    result.push({
      dateKey,
      title,
      items: groupItems,
    });
  }

  return result;
}

export function calculateArithmeticTrend(
  items: MeasurementViewModel[],
  metricType: TrackingMetricType
): ArithmeticTrendSummary {
  const config = METRIC_DEFINITIONS[metricType];
  const unit = config?.unit || "";

  // Filter items matching the specific metric
  const metricItems = items.filter((it) => it.metricType === metricType);
  if (metricItems.length === 0) {
    return {
      metricType,
      unit,
      readingCount: 0,
    };
  }

  // Sorted ascending by time for chronologic calculations
  const chronological = [...metricItems].sort(
    (a, b) => new Date(a.measuredAt).getTime() - new Date(b.measuredAt).getTime()
  );

  const latest = chronological[chronological.length - 1];
  const previous =
    chronological.length > 1
      ? chronological[chronological.length - 2]
      : undefined;

  let delta: number | undefined;
  let direction: "higher" | "lower" | "same" | undefined;

  if (previous) {
    delta = Math.round((latest.valuePrimary - previous.valuePrimary) * 10) / 10;
    if (delta > 0) direction = "higher";
    else if (delta < 0) direction = "lower";
    else direction = "same";
  }

  return {
    metricType,
    unit,
    readingCount: metricItems.length,
    latestValue: latest.valuePrimary,
    latestSecondaryValue: latest.valueSecondary ?? undefined,
    latestTimestamp: latest.measuredAt,
    previousValue: previous?.valuePrimary,
    valueDelta: delta !== undefined ? Math.abs(delta) : undefined,
    deltaDirection: direction,
  };
}

export function getDateRangeBounds(
  period: TemporalPeriod,
  customRange?: CustomDateRange
): { dateFrom?: string; dateTo?: string } {
  if (period === "custom") {
    return {
      dateFrom: customRange?.from?.toISOString(),
      dateTo: customRange?.to
        ? new Date(new Date(customRange.to).setHours(23, 59, 59, 999)).toISOString()
        : undefined,
    };
  }

  const now = new Date();
  const days = period === "7d" ? 7 : period === "30d" ? 30 : 90;
  const start = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

  return {
    dateFrom: start.toISOString(),
    dateTo: undefined,
  };
}
