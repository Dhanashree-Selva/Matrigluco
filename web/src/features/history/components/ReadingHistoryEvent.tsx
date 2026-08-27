import { Link } from "react-router-dom";
import { ArrowRight01Icon, Activity02Icon } from "@hugeicons/core-free-icons";
import { AppIcon } from "../../../components/common/AppIcon";
import { HistoryEventVM } from "../types/history.types";

interface ReadingHistoryEventProps {
  event: HistoryEventVM;
}

export function ReadingHistoryEvent({ event }: ReadingHistoryEventProps) {
  const metricType = (event.details.metric_type as string) || "reading";
  const notes = (event.details.notes as string) || null;

  return (
    <div className="group relative flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-lg bg-[var(--card)] border border-[var(--border)] shadow-2xs hover:border-amber-500/40 hover:shadow-xs transition-all">
      <div className="flex items-start gap-2.5">
        <div className="p-1.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 mt-0.5">
          <AppIcon icon={Activity02Icon} size="xs" />
        </div>

        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[var(--foreground)]">
              {event.title}
            </span>
            <span className="text-[10px] font-mono text-[var(--muted-foreground)]">
              {event.timeLabel}
            </span>
          </div>

          <div className="flex items-baseline gap-1.5">
            <span className="text-base font-black text-[var(--foreground)] tracking-tight">
              {event.summary}
            </span>
          </div>

          {notes && (
            <p className="text-[11px] text-[var(--muted-foreground)] italic line-clamp-1">
              "{notes}"
            </p>
          )}
        </div>
      </div>

      <div className="self-end sm:self-center">
        <Link
          to={event.deepLink}
          className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400 hover:underline group-hover:translate-x-0.5 transition-transform"
        >
          <span>View in Tracking</span>
          <AppIcon icon={ArrowRight01Icon} size="xs" />
        </Link>
      </div>
    </div>
  );
}
