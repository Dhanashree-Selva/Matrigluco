import { useMemo } from "react";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";
import {
  Analytics01Icon,
  PlusSignIcon,
} from "@hugeicons/core-free-icons";
import { AppIcon } from "../../../components/common/AppIcon";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
  Button,
  ChartContainer,
  ChartTooltip,
} from "../../../shared/ui";
import {
  MeasurementViewModel,
  TrackingMetricType,
  ArithmeticTrendSummary,
} from "../types/tracking.types";
import { METRIC_DEFINITIONS } from "../config/metric-definitions";
import { parseDate } from "../../../lib/dates";

interface MeasurementChartProps {
  items: MeasurementViewModel[];
  selectedMetric: TrackingMetricType;
  trend: ArithmeticTrendSummary;
  onAddReading: () => void;
}

export function MeasurementChart({
  items,
  selectedMetric,
  trend,
  onAddReading,
}: MeasurementChartProps) {
  const config = METRIC_DEFINITIONS[selectedMetric];

  // Filter items matching the selected metric and sort ascending by date for chart plotting
  const chartData = useMemo(() => {
    return items
      .filter((it) => it.metricType === selectedMetric)
      .sort(
        (a, b) =>
          (parseDate(a.measuredAt)?.getTime() || 0) -
          (parseDate(b.measuredAt)?.getTime() || 0)
      )
      .map((it) => {
        const d = parseDate(it.measuredAt);
        const dateLabel = d
          ? d.toLocaleDateString([], { month: "short", day: "numeric" })
          : "Date";
        const timeLabel = d
          ? d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
          : "";

        return {
          id: it.id,
          dateLabel,
          timeLabel,
          fullDate: it.measuredAt,
          primary: it.valuePrimary,
          secondary: it.valueSecondary ?? undefined,
          unit: it.unit,
          notes: it.notes ?? undefined,
        };
      });
  }, [items, selectedMetric]);

  const chartConfig = useMemo(
    () => ({
      primary: {
        label: selectedMetric === "blood_pressure" ? "Systolic" : config.label,
        color: "var(--primary)",
      },
      secondary: {
        label: "Diastolic",
        color: "var(--foreground)",
      },
    }),
    [selectedMetric, config.label]
  );

  if (chartData.length < 2) {
    return (
      <Empty className="py-12 bg-[var(--surface-soft)]/40 border border-dashed border-[var(--border)] rounded-md">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <AppIcon icon={Analytics01Icon} size="md" className="text-[var(--muted-foreground)]" />
          </EmptyMedia>
          <EmptyTitle className="text-xs font-bold text-[var(--foreground)]">
            {chartData.length === 1
              ? "1 reading recorded — more needed for trend line"
              : `No ${config.shortLabel.toLowerCase()} readings in this period`}
          </EmptyTitle>
          <EmptyDescription className="text-[11px] text-[var(--muted-foreground)] max-w-sm">
            {chartData.length === 1
              ? `You recorded ${chartData[0].primary} ${config.unit}. Add at least one more reading to plot a longitudinal progression.`
              : `Record your daily ${config.shortLabel.toLowerCase()} measurement or choose a wider date horizon in the Temporal Lens.`}
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onAddReading}
            className="h-8 text-xs font-semibold border-[var(--border)] gap-1.5"
          >
            <AppIcon icon={PlusSignIcon} size="xs" />
            <span>Record {config.shortLabel}</span>
          </Button>
        </EmptyContent>
      </Empty>
    );
  }

  // Calculate Y-axis domain padding
  const primaryVals = chartData.map((d) => d.primary);
  const secondaryVals = chartData
    .map((d) => d.secondary)
    .filter((v): v is number => v !== undefined);
  const allVals = [...primaryVals, ...secondaryVals];
  const minVal = Math.floor(Math.min(...allVals) * 0.95);
  const maxVal = Math.ceil(Math.max(...allVals) * 1.05);

  return (
    <div className="space-y-3">
      {/* Chart Narrative Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
        <div>
          <h3 className="font-bold text-[var(--foreground)]">
            {config.label} over time
          </h3>
          <p className="text-[11px] text-[var(--muted-foreground)]">
            {trend.readingCount} {trend.readingCount === 1 ? "reading" : "readings"} in selected scope
          </p>
        </div>

        {/* Objective Arithmetic Delta */}
        {trend.previousValue !== undefined && trend.latestValue !== undefined && (
          <div className="text-[11px] font-mono text-[var(--muted-foreground)] flex items-center gap-1">
            <span>Delta:</span>
            <strong className="text-[var(--foreground)] font-semibold">
              {trend.valueDelta} {config.unit}
            </strong>
            <span>({trend.deltaDirection})</span>
          </div>
        )}
      </div>

      {/* Responsive Recharts Plot Area with ChartContainer */}
      <div className="w-full pt-2">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[280px] sm:h-[320px] w-full"
        >
          <LineChart
            accessibilityLayer
            data={chartData}
            margin={{ top: 10, right: 15, left: -20, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.6} />
            <XAxis
              dataKey="dateLabel"
              stroke="var(--muted-foreground)"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: "var(--border)" }}
            />
            <YAxis
              domain={[minVal, maxVal]}
              stroke="var(--muted-foreground)"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: "var(--border)" }}
            />
            <ChartTooltip
              content={({ active, payload }) => {
                if (!active || !payload || !payload.length) return null;
                const data = payload[0].payload;
                return (
                  <div className="p-3 rounded-md bg-[var(--card)] border border-[var(--border)] shadow-2xl text-xs space-y-1.5 min-w-[160px]">
                    <div className="flex items-center justify-between gap-2 pb-1 border-b border-[var(--border-subtle)] text-[10px] font-mono text-[var(--muted-foreground)]">
                      <span>{data.dateLabel}</span>
                      <span>{data.timeLabel}</span>
                    </div>
                    {selectedMetric === "blood_pressure" && data.secondary !== undefined ? (
                      <div className="space-y-1 pt-0.5">
                        <div className="flex items-center justify-between gap-3 text-xs">
                          <span className="text-[var(--muted-foreground)] font-medium">Systolic:</span>
                          <span className="font-bold text-[var(--primary)] font-mono">{data.primary} mmHg</span>
                        </div>
                        <div className="flex items-center justify-between gap-3 text-xs">
                          <span className="text-[var(--muted-foreground)] font-medium">Diastolic:</span>
                          <span className="font-bold text-[var(--foreground)] font-mono">{data.secondary} mmHg</span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between gap-3 pt-0.5">
                        <span className="text-[var(--muted-foreground)] font-medium">{config.shortLabel}:</span>
                        <span className="font-black text-sm text-[var(--primary)] font-mono">
                          {data.primary} <span className="text-xs font-normal text-[var(--muted-foreground)]">{data.unit}</span>
                        </span>
                      </div>
                    )}
                    {data.notes && (
                      <div className="pt-1 border-t border-[var(--border-subtle)] text-[10px] italic text-[var(--muted-foreground)] truncate max-w-[200px]">
                        "{data.notes}"
                      </div>
                    )}
                  </div>
                );
              }}
            />

            {/* Primary Value Line */}
            <Line
              type="monotone"
              dataKey="primary"
              name={selectedMetric === "blood_pressure" ? "Systolic" : config.shortLabel}
              stroke="var(--primary)"
              strokeWidth={2.5}
              dot={{ r: 4, fill: "var(--primary)", strokeWidth: 2, stroke: "var(--card)" }}
              activeDot={{ r: 6, fill: "var(--primary)" }}
            />

            {/* Secondary Diastolic Line for Blood Pressure */}
            {selectedMetric === "blood_pressure" && (
              <Line
                type="monotone"
                dataKey="secondary"
                name="Diastolic"
                stroke="var(--foreground)"
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={{ r: 3.5, fill: "var(--foreground)", strokeWidth: 1.5, stroke: "var(--card)" }}
                activeDot={{ r: 5, fill: "var(--foreground)" }}
              />
            )}
          </LineChart>
        </ChartContainer>
      </div>

      {/* Accessible Chart Caption */}
      <p className="text-[10px] text-[var(--muted-foreground)] text-right">
        Longitudinal visualization of {config.shortLabel} ({config.unit}). Use the Records tab for complete tabular access.
      </p>
    </div>
  );
}
