import {
  HealthIcon,
  Activity02Icon,
  DocumentCodeIcon,
  Calendar03Icon,
  Shield01Icon,
} from "@hugeicons/core-free-icons";
import { AppIcon } from "../../../components/common/AppIcon";
import { HISTORY_SOURCE_CONFIG, ALL_HISTORY_SOURCES } from "../config/history-sources.config";
import { HistoryEventType } from "../types/history.types";

interface StoryContextProps {
  totalEvents: number;
  eventCounts: Record<string, number>;
  selectedTypes: HistoryEventType[];
  onSelectTypeOnly: (type: HistoryEventType) => void;
}

export function StoryContext({
  totalEvents,
  eventCounts,
  selectedTypes,
  onSelectTypeOnly,
}: StoryContextProps) {
  return (
    <aside className="w-full lg:w-72 shrink-0 space-y-4">
      {/* Care Chronicle Breakdown Card */}
      <div className="p-4 rounded-xl bg-[var(--card)] border border-[var(--border)] shadow-2xs space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-[var(--border-subtle)]">
          <h3 className="text-xs font-black uppercase tracking-wider text-[var(--foreground)]">
            Chronicle Scope
          </h3>
          <span className="text-[11px] font-mono text-[var(--muted-foreground)]">
            {totalEvents} total
          </span>
        </div>

        {/* Source Categories */}
        <div className="space-y-2">
          {ALL_HISTORY_SOURCES.map((type) => {
            const meta = HISTORY_SOURCE_CONFIG[type];
            const count = eventCounts[type] ?? 0;
            const pct = totalEvents > 0 ? Math.round((count / totalEvents) * 100) : 0;
            const isSelected = selectedTypes.includes(type);

            return (
              <button
                key={type}
                type="button"
                onClick={() => onSelectTypeOnly(type)}
                className={`w-full text-left p-2 rounded-md border transition-all ${
                  isSelected
                    ? "bg-[var(--surface-soft)] border-[var(--border)] hover:border-[var(--primary)]/40"
                    : "opacity-40 hover:opacity-100 border-transparent hover:bg-[var(--surface-soft)]"
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <div className="flex items-center gap-1.5 font-bold text-[var(--foreground)]">
                    <AppIcon icon={meta.icon} size="xs" className={meta.colorClass} />
                    <span>{meta.pluralLabel}</span>
                  </div>
                  <span className="font-mono text-[11px] text-[var(--muted-foreground)]">
                    {count} ({pct}%)
                  </span>
                </div>

                {/* Micro Progress Bar */}
                <div className="w-full h-1 rounded-full bg-[var(--border-subtle)] overflow-hidden">
                  <div
                    className="h-full bg-[var(--primary)] transition-all duration-300"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Verified Medical Privacy & Traceability Note */}
      <div className="p-3.5 rounded-xl bg-[var(--surface-soft)]/50 border border-[var(--border-subtle)] space-y-1 text-xs">
        <div className="flex items-center gap-1.5 font-bold text-[var(--foreground)] text-[11px]">
          <AppIcon icon={Shield01Icon} size="xs" className="text-emerald-500" />
          <span>Longitudinal Integrity</span>
        </div>
        <p className="text-[11px] text-[var(--muted-foreground)] leading-relaxed">
          All entries in your health chronicle are timestamped and cryptographically scoped to your private care record.
        </p>
      </div>
    </aside>
  );
}
