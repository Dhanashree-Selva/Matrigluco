import { ChronicleMonthVM } from "../types/history.types";
import { ChronicleDateGroup } from "./ChronicleDateGroup";
import { ChronicleSpine } from "./ChronicleSpine";

interface ChronicleMonthProps {
  month: ChronicleMonthVM;
}

export function ChronicleMonth({ month }: ChronicleMonthProps) {
  return (
    <section
      id={`month-${month.monthKey}`}
      className="space-y-4 pt-2 first:pt-0"
      aria-label={`History for ${month.monthTitle}`}
    >
      {/* Month Separator Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[var(--border-subtle)]">
        <h2 className="text-xs font-black text-[var(--foreground)] uppercase tracking-widest flex items-center gap-2">
          <span className="w-2 h-2 rounded-xs bg-[var(--primary)]" />
          <span>{month.monthTitle}</span>
        </h2>

        <span className="text-[11px] font-mono text-[var(--muted-foreground)]">
          {month.totalEvents} {month.totalEvents === 1 ? "event" : "events"}
        </span>
      </div>

      {/* Date groups with Chronicle Spine */}
      <ChronicleSpine>
        <div className="space-y-2">
          {month.dateGroups.map((group) => (
            <ChronicleDateGroup key={group.dateKey} dateGroup={group} />
          ))}
        </div>
      </ChronicleSpine>
    </section>
  );
}
