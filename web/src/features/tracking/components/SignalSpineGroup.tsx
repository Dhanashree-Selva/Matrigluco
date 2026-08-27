import {
  MeasurementGroup,
  TrackingMetricType,
} from "../types/tracking.types";
import { SignalSpineItem } from "./SignalSpineItem";

interface SignalSpineGroupProps {
  group: MeasurementGroup;
  selectedMetric: TrackingMetricType;
  onSelectMetric?: (metric: TrackingMetricType) => void;
}

export function SignalSpineGroup({
  group,
  selectedMetric,
  onSelectMetric,
}: SignalSpineGroupProps) {
  const isToday = group.title === "Today";
  const isYesterday = group.title === "Yesterday";

  return (
    <div className="space-y-2.5">
      {/* Date Header Ribbon (Time Fold Visual Cue) */}
      <div className="flex items-center gap-2">
        <span
          className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-sm border ${
            isToday
              ? "bg-[var(--primary)] text-white border-[var(--primary)]"
              : isYesterday
              ? "bg-[var(--surface-soft)] text-[var(--foreground)] border-[var(--border)]"
              : "bg-transparent text-[var(--muted-foreground)] border-transparent"
          }`}
        >
          {group.title}
        </span>
        <div className="flex-1 h-[1px] bg-[var(--border-subtle)]" />
      </div>

      {/* Group Items */}
      <div className="space-y-0">
        {group.items.map((item) => (
          <SignalSpineItem
            key={item.id}
            item={item}
            selectedMetric={selectedMetric}
            onSelectMetric={onSelectMetric}
          />
        ))}
      </div>
    </div>
  );
}
