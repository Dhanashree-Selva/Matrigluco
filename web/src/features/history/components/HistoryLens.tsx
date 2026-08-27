import { useState } from "react";
import {
  Calendar03Icon,
  Cancel01Icon,
  Layers01Icon,
  Clock01Icon,
} from "@hugeicons/core-free-icons";
import { AppIcon } from "../../../components/common/AppIcon";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  Calendar,
  ToggleGroup,
  ToggleGroupItem,
  Button,
} from "../../../shared/ui";
import { HistoryEventType, HistoryViewMode } from "../types/history.types";
import { HistoryFilterCombobox } from "./HistoryFilterCombobox";
import { HistoryFilterSheet } from "./HistoryFilterSheet";

interface HistoryLensProps {
  selectedTypes: HistoryEventType[];
  onTypesChange: (types: HistoryEventType[]) => void;
  selectedMonth?: string;
  dateFrom?: string;
  dateTo?: string;
  onDateRangeChange: (from?: string, to?: string) => void;
  viewMode: HistoryViewMode;
  onViewModeChange: (mode: HistoryViewMode) => void;
  onReset: () => void;
  isFiltered: boolean;
  eventCounts?: Record<string, number>;
}

export function HistoryLens({
  selectedTypes,
  onTypesChange,
  dateFrom,
  dateTo,
  onDateRangeChange,
  viewMode,
  onViewModeChange,
  onReset,
  isFiltered,
  eventCounts,
}: HistoryLensProps) {
  const [calendarOpen, setCalendarOpen] = useState(false);

  const selectedDateRange = {
    from: dateFrom ? new Date(dateFrom) : undefined,
    to: dateTo ? new Date(dateTo) : undefined,
  };

  const handleRangeSelect = (range: any) => {
    if (!range) {
      onDateRangeChange(undefined, undefined);
      return;
    }
    const fromIso = range.from ? range.from.toISOString() : undefined;
    const toIso = range.to ? range.to.toISOString() : undefined;
    onDateRangeChange(fromIso, toIso);
  };

  const hasCustomDateRange = Boolean(dateFrom || dateTo);

  const formattedDateRange = () => {
    if (!dateFrom && !dateTo) return "Date Range";
    if (dateFrom && !dateTo) {
      return `From ${new Date(dateFrom).toLocaleDateString([], { month: "short", day: "numeric" })}`;
    }
    if (dateFrom && dateTo) {
      const fromStr = new Date(dateFrom).toLocaleDateString([], { month: "short", day: "numeric" });
      const toStr = new Date(dateTo).toLocaleDateString([], { month: "short", day: "numeric" });
      return `${fromStr} – ${toStr}`;
    }
    return "Custom Date";
  };

  return (
    <div className="w-full flex flex-col md:flex-row md:items-center justify-between gap-2.5 p-2 bg-[var(--card)] border border-[var(--border)] rounded-lg shadow-2xs">
      {/* Left side: Source filters (Desktop combobox, Mobile sheet) + Custom Date Range */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Desktop Combobox */}
        <div className="hidden sm:block">
          <HistoryFilterCombobox
            selectedTypes={selectedTypes}
            onTypesChange={onTypesChange}
            eventCounts={eventCounts}
          />
        </div>

        {/* Mobile Filter Sheet */}
        <div className="block sm:hidden">
          <HistoryFilterSheet
            selectedTypes={selectedTypes}
            onTypesChange={onTypesChange}
            eventCounts={eventCounts}
          />
        </div>

        {/* Custom Date Range Popover */}
        <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className={`h-8 px-2.5 text-xs font-semibold gap-1.5 border-[var(--border)] bg-[var(--card)] ${
                hasCustomDateRange
                  ? "border-[var(--primary)] text-[var(--primary)] bg-[var(--accent-soft)]"
                  : "text-[var(--foreground)]"
              }`}
            >
              <AppIcon icon={Calendar03Icon} size="xs" />
              <span>{formattedDateRange()}</span>
            </Button>
          </PopoverTrigger>

          <PopoverContent
            position="popper"
            sideOffset={6}
            align="start"
            className="w-auto p-2 bg-[var(--card)] border border-[var(--border)] shadow-2xl rounded-md"
          >
            <Calendar
              mode="range"
              selected={selectedDateRange}
              onSelect={handleRangeSelect}
              numberOfMonths={1}
            />
            {hasCustomDateRange && (
              <div className="pt-2 border-t border-[var(--border-subtle)] flex justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  size="xs"
                  onClick={() => {
                    onDateRangeChange(undefined, undefined);
                    setCalendarOpen(false);
                  }}
                  className="text-[10px] text-destructive hover:bg-destructive/10"
                >
                  Clear Date Range
                </Button>
              </div>
            )}
          </PopoverContent>
        </Popover>

        {/* Reset Filters Action */}
        {isFiltered && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="h-8 px-2 text-xs font-semibold text-[var(--muted-foreground)] hover:text-[var(--foreground)] gap-1"
          >
            <AppIcon icon={Cancel01Icon} size="xs" />
            <span>Reset</span>
          </Button>
        )}
      </div>

      {/* Right side: View Mode ToggleGroup (Story vs Events) */}
      <div className="flex items-center self-end md:self-auto gap-1 bg-[var(--surface-soft)] p-0.5 rounded-md border border-[var(--border-subtle)]">
        <ToggleGroup
          type="single"
          value={viewMode}
          onValueChange={(val) => {
            if (val) onViewModeChange(val as HistoryViewMode);
          }}
          className="gap-0.5"
        >
          <ToggleGroupItem
            value="story"
            size="sm"
            className="h-7 px-2.5 text-xs font-bold gap-1 rounded-sm data-[state=on]:bg-[var(--card)] data-[state=on]:text-[var(--foreground)] data-[state=on]:shadow-2xs"
            aria-label="Care narrative view"
          >
            <AppIcon icon={Layers01Icon} size="xs" />
            <span>Story</span>
          </ToggleGroupItem>

          <ToggleGroupItem
            value="events"
            size="sm"
            className="h-7 px-2.5 text-xs font-bold gap-1 rounded-sm data-[state=on]:bg-[var(--card)] data-[state=on]:text-[var(--foreground)] data-[state=on]:shadow-2xs"
            aria-label="Raw event stream view"
          >
            <AppIcon icon={Clock01Icon} size="xs" />
            <span>Events</span>
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
    </div>
  );
}
