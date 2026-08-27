import { ChronicleDateGroupVM } from "../types/history.types";
import { HistoryEventItem } from "./HistoryEventItem";
import { ChronicleSpineNode } from "./ChronicleSpine";
import { Calendar03Icon } from "@hugeicons/core-free-icons";
import { AppIcon } from "../../../components/common/AppIcon";

interface ChronicleDateGroupProps {
  dateGroup: ChronicleDateGroupVM;
}

export function ChronicleDateGroup({ dateGroup }: ChronicleDateGroupProps) {
  return (
    <div className="relative space-y-3 pb-6 last:pb-2">
      {/* Date Ribbon Header */}
      <div className="relative flex items-center gap-2">
        <ChronicleSpineNode isHighlight={dateGroup.isToday} />

        <div
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold shadow-2xs border ${
            dateGroup.isToday
              ? "bg-[var(--accent-soft)] text-[var(--primary)] border-[var(--primary)]/30"
              : dateGroup.isYesterday
              ? "bg-[var(--surface-soft)] text-[var(--foreground)] border-[var(--border)]"
              : "bg-[var(--card)] text-[var(--muted-foreground)] border-[var(--border-subtle)]"
          }`}
        >
          <AppIcon icon={Calendar03Icon} size="xs" />
          <span>{dateGroup.dateHeading}</span>
          <span className="ml-1 text-[10px] font-mono text-[var(--muted-foreground)]">
            ({dateGroup.eventCount})
          </span>
        </div>
      </div>

      {/* Events for this day */}
      <div className="space-y-2.5 pt-1">
        {dateGroup.events.map((event) => (
          <HistoryEventItem key={event.id} event={event} />
        ))}
      </div>
    </div>
  );
}
