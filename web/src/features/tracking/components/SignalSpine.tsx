import {
  Clock01Icon,
  PlusSignIcon,
} from "@hugeicons/core-free-icons";
import { AppIcon } from "../../../components/common/AppIcon";
import { Button } from "../../../shared/ui";
import {
  MeasurementGroup,
  TrackingMetricType,
} from "../types/tracking.types";
import { SignalSpineGroup } from "./SignalSpineGroup";

interface SignalSpineProps {
  groups: MeasurementGroup[];
  selectedMetric: TrackingMetricType;
  onSelectMetric?: (metric: TrackingMetricType) => void;
  onAddReading: () => void;
}

export function SignalSpine({
  groups,
  selectedMetric,
  onSelectMetric,
  onAddReading,
}: SignalSpineProps) {
  return (
    <section
      aria-label="Signal Spine Timeline"
      className="p-5 sm:p-6 rounded-md bg-[var(--card)] border border-[var(--border)] shadow-xs space-y-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-[var(--surface-soft)] border border-[var(--border)] text-[var(--primary)] flex items-center justify-center">
            <AppIcon icon={Clock01Icon} size="xs" />
          </div>
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-[var(--foreground)]">
              Signal Spine
            </h3>
            <p className="text-[10px] text-[var(--muted-foreground)]">
              Chronological telemetry stream
            </p>
          </div>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="xs"
          onClick={onAddReading}
          className="text-xs text-[var(--primary)] hover:text-[var(--primary-hover)] gap-1 h-7 font-bold"
        >
          <AppIcon icon={PlusSignIcon} size="xs" />
          <span>Quick Log</span>
        </Button>
      </div>

      {/* Timeline Groups */}
      {groups.length === 0 ? (
        <div className="py-8 text-center bg-[var(--surface-soft)]/30 border border-dashed border-[var(--border)] rounded-md space-y-2">
          <p className="text-xs font-semibold text-[var(--muted-foreground)]">
            No chronological readings in this period.
          </p>
          <Button
            type="button"
            variant="outline"
            size="xs"
            onClick={onAddReading}
            className="h-7 text-xs font-semibold border-[var(--border)]"
          >
            Record First Reading
          </Button>
        </div>
      ) : (
        <div className="space-y-4 pt-1">
          {groups.map((group) => (
            <SignalSpineGroup
              key={group.dateKey}
              group={group}
              selectedMetric={selectedMetric}
              onSelectMetric={onSelectMetric}
            />
          ))}
        </div>
      )}
    </section>
  );
}
