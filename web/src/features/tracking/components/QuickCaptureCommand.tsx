import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "../../../shared/ui";
import { AppIcon } from "../../../components/common/AppIcon";
import { TRACKING_METRIC_LIST, TrackingMetricType } from "../config/metric-definitions";

interface QuickCaptureCommandProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMetric: (metric: TrackingMetricType) => void;
}

export function QuickCaptureCommand({
  isOpen,
  onClose,
  onSelectMetric,
}: QuickCaptureCommandProps) {
  return (
    <CommandDialog
      open={isOpen}
      onOpenChange={(open) => !open && onClose()}
    >
      <CommandInput placeholder="Search health reading type to record..." />
      <CommandList className="bg-[var(--card)] border-[var(--border)]">
        <CommandEmpty className="text-xs text-[var(--muted-foreground)] p-4 text-center">
          No matching health metrics found.
        </CommandEmpty>
        <CommandGroup heading="Record Canonical Metric">
          {TRACKING_METRIC_LIST.map((m) => (
            <CommandItem
              key={m.type}
              value={`${m.label} ${m.shortLabel} ${m.unit}`}
              onSelect={() => {
                onSelectMetric(m.type);
                onClose();
              }}
              className="flex items-center gap-2.5 p-2 text-xs cursor-pointer hover:bg-[var(--surface-soft)] rounded-md"
            >
              <div className="w-6 h-6 rounded-md bg-[var(--surface-soft)] border border-[var(--border)] text-[var(--primary)] flex items-center justify-center shrink-0">
                <AppIcon icon={m.icon} size="xs" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-[var(--foreground)]">{m.label}</span>
                <span className="text-[10px] text-[var(--muted-foreground)]">{m.description}</span>
              </div>
              <span className="ml-auto text-[10px] font-mono text-[var(--muted-foreground)]">
                {m.unit}
              </span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
