import {
  Delete02Icon,
} from "@hugeicons/core-free-icons";
import { AppIcon } from "../../../components/common/AppIcon";
import {
  Button,
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "../../../shared/ui";
import {
  MeasurementViewModel,
  TrackingMetricType,
} from "../types/tracking.types";
import { METRIC_DEFINITIONS } from "../config/metric-definitions";
import { useDeleteMeasurement } from "../hooks/useDeleteMeasurement";

interface SignalSpineItemProps {
  item: MeasurementViewModel;
  selectedMetric: TrackingMetricType;
  onSelectMetric?: (metric: TrackingMetricType) => void;
}

export function SignalSpineItem({
  item,
  selectedMetric,
  onSelectMetric,
}: SignalSpineItemProps) {
  const isSelected = item.metricType === selectedMetric;
  const config = METRIC_DEFINITIONS[item.metricType];
  const deleteMutation = useDeleteMeasurement();

  return (
    <div className="relative pl-6 pb-4 group last:pb-0">
      {/* Spine Vertical Line */}
      <div className="absolute left-[9px] top-3 bottom-0 w-[2px] bg-[var(--border)] group-last:hidden" />

      {/* Spine Node Dot */}
      <div
        className={`absolute left-[4px] top-1.5 w-3 h-3 rounded-full border-2 transition-colors ${
          isSelected
            ? "bg-[var(--primary)] border-[var(--card)] shadow-xs"
            : "bg-[var(--card)] border-[var(--muted-foreground)]/60 group-hover:border-[var(--primary)]"
        }`}
      />

      {/* Measurement Item Body */}
      <div
        onClick={() => onSelectMetric && onSelectMetric(item.metricType)}
        className={`p-2.5 rounded-md border transition-all cursor-pointer flex flex-col gap-1.5 ${
          isSelected
            ? "bg-[var(--accent-soft)]/40 border-[var(--primary)]/30 shadow-2xs"
            : "bg-[var(--card)] border-[var(--border-subtle)] hover:border-[var(--border)] hover:bg-[var(--surface-soft)]/50"
        }`}
      >
        <div className="flex items-center justify-between gap-2">
          {/* Metric Icon & Label */}
          <div className="flex items-center gap-2 min-w-0">
            <div
              className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 border ${
                isSelected
                  ? "bg-[var(--primary)] text-white border-[var(--primary)]"
                  : "bg-[var(--surface-soft)] text-[var(--foreground)] border-[var(--border)]"
              }`}
            >
              <AppIcon icon={config?.icon} size="xs" />
            </div>
            <span className="text-xs font-bold text-[var(--foreground)] truncate">
              {config?.shortLabel || item.metricType}
            </span>
          </div>

          {/* Time & Delete Action */}
          <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
            <span className="text-[10px] font-mono text-[var(--muted-foreground)]">
              {item.formattedTime}
            </span>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-[var(--muted-foreground)] hover:text-[var(--destructive)] h-5 w-5"
                >
                  <AppIcon icon={Delete02Icon} size="xs" />
                  <span className="sr-only">Delete</span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-[var(--card)] border border-[var(--border)]">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-base font-bold text-[var(--foreground)]">
                    Remove this entry?
                  </AlertDialogTitle>
                  <AlertDialogDescription className="text-xs text-[var(--muted-foreground)]">
                    Delete the {item.formattedValue} {item.unit} reading recorded at {item.formattedTime}.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="text-xs">Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => deleteMutation.mutate(item.id)}
                    className="text-xs font-bold bg-[var(--destructive)] text-white"
                  >
                    Delete Reading
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        {/* Value + Unit Row */}
        <div className="flex items-center justify-between pl-8">
          <div className="flex items-baseline gap-1">
            <span className="text-sm font-mono font-black text-[var(--foreground)]">
              {item.formattedValue}
            </span>
            <span className="text-[10px] font-mono text-[var(--muted-foreground)]">
              {item.unit}
            </span>
          </div>

          {item.notes && (
            <span className="text-[10px] text-[var(--muted-foreground)] max-w-[140px] truncate italic">
              "{item.notes}"
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
