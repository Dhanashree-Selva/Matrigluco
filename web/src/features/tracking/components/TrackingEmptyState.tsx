import { Activity01Icon, PlusSignIcon } from "@hugeicons/core-free-icons";
import { AppIcon } from "../../../components/common/AppIcon";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
  Button,
} from "../../../shared/ui";
import { TrackingMetricType } from "../types/tracking.types";
import { METRIC_DEFINITIONS } from "../config/metric-definitions";

interface TrackingEmptyStateProps {
  type: "no-data-overall" | "no-data-period" | "no-data-metric";
  selectedMetric?: TrackingMetricType;
  onAddReading: () => void;
  onResetFilters?: () => void;
}

export function TrackingEmptyState({
  type,
  selectedMetric = "glucose",
  onAddReading,
  onResetFilters,
}: TrackingEmptyStateProps) {
  const config = METRIC_DEFINITIONS[selectedMetric];

  if (type === "no-data-overall") {
    return (
      <Empty className="py-16 bg-[var(--card)] border border-dashed border-[var(--border)] rounded-md shadow-xs max-w-xl mx-auto">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <AppIcon icon={Activity01Icon} size="md" className="text-[var(--primary)]" />
          </EmptyMedia>
          <EmptyTitle className="text-base font-bold text-[var(--foreground)]">
            Start Your Health Signal Timeline
          </EmptyTitle>
          <EmptyDescription className="text-xs text-[var(--muted-foreground)] max-w-md">
            Nothing has been recorded yet. Add your first fasting glucose, blood pressure, or weight measurement to begin building a continuous longitudinal timeline.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent className="gap-2">
          <Button
            type="button"
            onClick={onAddReading}
            className="h-9 px-4 text-xs font-bold bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white shadow-2xs gap-1.5"
          >
            <AppIcon icon={PlusSignIcon} size="xs" />
            <span>Record First Reading</span>
          </Button>
        </EmptyContent>
      </Empty>
    );
  }

  return (
    <Empty className="py-16 bg-[var(--card)] border border-dashed border-[var(--border)] rounded-md shadow-xs max-w-xl mx-auto">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <AppIcon icon={config.icon} size="md" className="text-[var(--muted-foreground)]" />
        </EmptyMedia>
        <EmptyTitle className="text-base font-bold text-[var(--foreground)]">
          No {config.shortLabel} Readings in this Scope
        </EmptyTitle>
        <EmptyDescription className="text-xs text-[var(--muted-foreground)] max-w-md">
          There are no recorded measurements matching your current date filter. Choose a wider date range or record a new reading.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent className="gap-2">
        <Button
          type="button"
          onClick={onAddReading}
          className="h-8 px-3 text-xs font-bold bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white gap-1.5"
        >
          <AppIcon icon={PlusSignIcon} size="xs" />
          <span>Record {config.shortLabel}</span>
        </Button>
        {onResetFilters && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onResetFilters}
            className="h-8 text-xs font-semibold border-[var(--border)]"
          >
            View 90 Days
          </Button>
        )}
      </EmptyContent>
    </Empty>
  );
}
