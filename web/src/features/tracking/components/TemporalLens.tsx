import { useState } from "react";
import {
  Calendar03Icon,
  Analytics01Icon,
  TableIcon,
  PlusSignIcon,
} from "@hugeicons/core-free-icons";
import { AppIcon } from "../../../components/common/AppIcon";
import {
  Button,
  ToggleGroup,
  ToggleGroupItem,
  Popover,
  PopoverTrigger,
  PopoverContent,
  Calendar,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Kbd,
} from "../../../shared/ui";
import {
  TrackingMetricType,
  TemporalPeriod,
  TrackingViewMode,
  CustomDateRange,
} from "../types/tracking.types";
import {
  TRACKING_METRIC_LIST,
} from "../config/metric-definitions";

interface TemporalLensProps {
  selectedMetric: TrackingMetricType;
  onMetricChange: (metric: TrackingMetricType) => void;
  selectedPeriod: TemporalPeriod;
  onPeriodChange: (period: TemporalPeriod) => void;
  customRange?: CustomDateRange;
  onCustomRangeChange: (range?: CustomDateRange) => void;
  viewMode: TrackingViewMode;
  onViewModeChange: (mode: TrackingViewMode) => void;
  onOpenQuickAdd: (metric?: TrackingMetricType) => void;
}

export function TemporalLens({
  selectedMetric,
  onMetricChange,
  selectedPeriod,
  onPeriodChange,
  customRange,
  onCustomRangeChange,
  viewMode,
  onViewModeChange,
  onOpenQuickAdd,
}: TemporalLensProps) {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const formatCustomLabel = () => {
    if (selectedPeriod !== "custom" || !customRange?.from) {
      return "Custom Date";
    }
    const fromStr = customRange.from.toLocaleDateString([], {
      month: "short",
      day: "numeric",
    });
    if (!customRange.to) return fromStr;
    const toStr = customRange.to.toLocaleDateString([], {
      month: "short",
      day: "numeric",
    });
    return `${fromStr} – ${toStr}`;
  };

  return (
    <div className="p-2.5 sm:p-3 rounded-md bg-[var(--card)] border border-[var(--border)] shadow-2xs space-y-2.5">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2.5">
        {/* Left Section: Time Horizon + Custom Date + Metric Selector */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Preset Buttons: 7D / 30D / 90D */}
          <ToggleGroup
            type="single"
            value={selectedPeriod !== "custom" ? selectedPeriod : ""}
            onValueChange={(val) => {
              if (val) onPeriodChange(val as TemporalPeriod);
            }}
            variant="outline"
            size="sm"
            className="border border-[var(--border)] rounded-md p-0.5 bg-[var(--surface-soft)]/50 gap-0.5 shrink-0"
            aria-label="Select date range"
          >
            <ToggleGroupItem
              value="7d"
              className="text-xs h-7 px-2.5 font-semibold data-[state=on]:bg-[var(--card)] data-[state=on]:text-[var(--primary)] data-[state=on]:shadow-2xs"
            >
              7D
            </ToggleGroupItem>
            <ToggleGroupItem
              value="30d"
              className="text-xs h-7 px-2.5 font-semibold data-[state=on]:bg-[var(--card)] data-[state=on]:text-[var(--primary)] data-[state=on]:shadow-2xs"
            >
              30D
            </ToggleGroupItem>
            <ToggleGroupItem
              value="90d"
              className="text-xs h-7 px-2.5 font-semibold data-[state=on]:bg-[var(--card)] data-[state=on]:text-[var(--primary)] data-[state=on]:shadow-2xs"
            >
              90D
            </ToggleGroupItem>
          </ToggleGroup>

          {/* Custom Date Range Popover */}
          <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
            <PopoverTrigger asChild>
              <Button
                variant={selectedPeriod === "custom" ? "default" : "outline"}
                size="sm"
                className={`h-8 text-xs font-semibold border-[var(--border)] gap-1.5 shrink-0 ${
                  selectedPeriod === "custom"
                    ? "bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)]"
                    : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                }`}
              >
                <AppIcon icon={Calendar03Icon} size="xs" />
                <span>{formatCustomLabel()}</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent
              position="popper"
              sideOffset={4}
              align="start"
              className="w-auto p-0 bg-[var(--card)] border border-[var(--border)] shadow-xl"
            >
              <Calendar
                mode="range"
                selected={
                  customRange?.from
                    ? { from: customRange.from, to: customRange.to }
                    : undefined
                }
                onSelect={(range) => {
                  if (range?.from) {
                    onCustomRangeChange({ from: range.from, to: range.to });
                    if (range.to) {
                      setIsCalendarOpen(false);
                    }
                  }
                }}
                numberOfMonths={1}
                disabled={(date) => date > new Date()}
              />
            </PopoverContent>
          </Popover>

          {/* Metric Selector (Clean single icon + label, responsive width) */}
          <div className="w-full sm:w-auto min-w-[200px] flex-1 sm:flex-initial">
            <Select
              value={selectedMetric}
              onValueChange={(val) => onMetricChange(val as TrackingMetricType)}
            >
              <SelectTrigger className="h-8 text-xs font-semibold bg-[var(--card)] border-[var(--border)] w-full">
                <SelectValue placeholder="Select metric" />
              </SelectTrigger>
              <SelectContent
                position="popper"
                sideOffset={4}
                align="start"
                className="bg-[var(--card)] border border-[var(--border)] max-w-sm"
              >
                {TRACKING_METRIC_LIST.map((m) => (
                  <SelectItem key={m.type} value={m.type} className="text-xs">
                    <div className="flex items-center gap-2">
                      <AppIcon icon={m.icon} size="xs" className="text-[var(--primary)] shrink-0" />
                      <span className="truncate">{m.label}</span>
                      <span className="text-[10px] font-mono text-[var(--muted-foreground)] ml-auto shrink-0">
                        {m.unit}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Right Section: View Mode Toggle + Quick Add Button */}
        <div className="flex items-center gap-2 justify-between lg:justify-end pt-2 lg:pt-0 border-t lg:border-t-0 border-[var(--border-subtle)]">
          {/* Twin View Toggle */}
          <ToggleGroup
            type="single"
            value={viewMode}
            onValueChange={(val) => {
              if (val) onViewModeChange(val as TrackingViewMode);
            }}
            variant="outline"
            size="sm"
            className="border border-[var(--border)] rounded-md p-0.5 bg-[var(--surface-soft)]/50 gap-0.5 shrink-0"
            aria-label="Select tracking view mode"
          >
            <ToggleGroupItem
              value="chart"
              className="text-xs h-7 px-2.5 font-semibold gap-1.5 data-[state=on]:bg-[var(--card)] data-[state=on]:text-[var(--primary)] data-[state=on]:shadow-2xs"
            >
              <AppIcon icon={Analytics01Icon} size="xs" />
              <span>Chart</span>
            </ToggleGroupItem>
            <ToggleGroupItem
              value="records"
              className="text-xs h-7 px-2.5 font-semibold gap-1.5 data-[state=on]:bg-[var(--card)] data-[state=on]:text-[var(--primary)] data-[state=on]:shadow-2xs"
            >
              <AppIcon icon={TableIcon} size="xs" />
              <span>Records</span>
            </ToggleGroupItem>
          </ToggleGroup>

          {/* Primary Quick Add Action */}
          <Button
            type="button"
            size="sm"
            onClick={() => onOpenQuickAdd(selectedMetric)}
            className="h-8 px-3 text-xs font-bold bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white shadow-2xs gap-1.5 shrink-0"
          >
            <AppIcon icon={PlusSignIcon} size="xs" />
            <span>Add reading</span>
            <Kbd className="hidden md:inline-flex bg-white/20 text-white text-[10px] px-1 py-0.5 ml-0.5">
              A
            </Kbd>
          </Button>
        </div>
      </div>
    </div>
  );
}
