import {
  ChronicleMonthVM,
  HistoryEventVM,
  HistoryViewMode,
} from "../types/history.types";
import { ChronicleMonth } from "./ChronicleMonth";
import { ChronicleSpine } from "./ChronicleSpine";
import { HistoryEventItem } from "./HistoryEventItem";
import { HistoryEmptyState } from "./HistoryEmptyState";
import { HistorySkeleton } from "./HistorySkeleton";

interface HealthChronicleProps {
  isLoading: boolean;
  chronicleMonths: ChronicleMonthVM[];
  events: HistoryEventVM[];
  viewMode: HistoryViewMode;
  isFiltered: boolean;
  onResetFilters: () => void;
}

export function HealthChronicle({
  isLoading,
  chronicleMonths,
  events,
  viewMode,
  isFiltered,
  onResetFilters,
}: HealthChronicleProps) {
  if (isLoading) {
    return <HistorySkeleton />;
  }

  if (events.length === 0) {
    return (
      <HistoryEmptyState
        isFiltered={isFiltered}
        onResetFilters={onResetFilters}
      />
    );
  }

  if (viewMode === "events") {
    return (
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between pb-2 border-b border-[var(--border-subtle)]">
          <h2 className="text-xs font-black text-[var(--foreground)] uppercase tracking-widest">
            Chronological Events Stream
          </h2>
          <span className="text-[11px] font-mono text-[var(--muted-foreground)]">
            {events.length} {events.length === 1 ? "event" : "events"}
          </span>
        </div>

        <ChronicleSpine>
          <div className="space-y-3">
            {events.map((event) => (
              <HistoryEventItem key={event.id} event={event} />
            ))}
          </div>
        </ChronicleSpine>
      </div>
    );
  }

  // Story Mode: Month -> Date -> Spine
  return (
    <div className="space-y-8">
      {chronicleMonths.map((month) => (
        <ChronicleMonth key={month.monthKey} month={month} />
      ))}
    </div>
  );
}
