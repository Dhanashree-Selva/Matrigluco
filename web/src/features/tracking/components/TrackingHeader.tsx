import { Activity01Icon } from "@hugeicons/core-free-icons";
import { AppIcon } from "../../../components/common/AppIcon";
import { ArithmeticTrendSummary, TrackingMetricType } from "../types/tracking.types";
import { METRIC_DEFINITIONS } from "../config/metric-definitions";

interface TrackingHeaderProps {
  trend: ArithmeticTrendSummary;
  selectedMetric: TrackingMetricType;
  periodLabel: string;
}

export function TrackingHeader({
  trend,
  selectedMetric,
  periodLabel,
}: TrackingHeaderProps) {
  const metricConfig = METRIC_DEFINITIONS[selectedMetric];

  const formatLatestValue = () => {
    if (trend.latestValue === undefined) return "No readings in scope";
    if (selectedMetric === "blood_pressure" && trend.latestSecondaryValue !== undefined) {
      return `${Math.round(trend.latestValue)} / ${Math.round(trend.latestSecondaryValue)} ${metricConfig.unit}`;
    }
    return `${trend.latestValue} ${metricConfig.unit}`;
  };

  return (
    <div className="space-y-3 pb-2 border-b border-[var(--border-subtle)]">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-[var(--accent-soft)] text-[var(--primary)] flex items-center justify-center shrink-0">
              <AppIcon icon={metricConfig.icon || Activity01Icon} size="xs" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
              Health Telemetry · Longitudinal Timeline
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[var(--foreground)] tracking-tight mt-0.5">
            Health Tracking
          </h1>
        </div>

        {/* Narrative Signal Summary Strip */}
        <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-md bg-[var(--surface-soft)]/80 border border-[var(--border-subtle)] text-xs text-[var(--muted-foreground)] self-start sm:self-auto">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[var(--primary)] shrink-0" />
            <span className="font-semibold text-[var(--foreground)]">
              {metricConfig.shortLabel}
            </span>
          </div>
          <span className="text-[var(--border)]">|</span>
          <span>{periodLabel}</span>
          <span className="text-[var(--border)]">|</span>
          <span className="font-mono text-[var(--foreground)] font-bold">
            {formatLatestValue()}
          </span>
          {trend.readingCount > 0 && (
            <span className="text-[10px] text-[var(--muted-foreground)]">
              ({trend.readingCount} {trend.readingCount === 1 ? "entry" : "entries"})
            </span>
          )}
        </div>
      </div>
      <p className="text-xs text-[var(--muted-foreground)] max-w-3xl">
        Continuous, non-diagnostic timeline of your recorded metabolic signals, blood pressure vitals, and maternal biomarkers.
      </p>
    </div>
  );
}
