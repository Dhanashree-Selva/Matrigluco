import { Link } from "react-router-dom";
import { ArrowRight01Icon, Calendar03Icon } from "@hugeicons/core-free-icons";
import { AppIcon } from "../../../components/common/AppIcon";
import { HistoryEventVM } from "../types/history.types";
import { Badge } from "../../../shared/ui";

interface ConsultationHistoryEventProps {
  event: HistoryEventVM;
}

export function ConsultationHistoryEvent({
  event,
}: ConsultationHistoryEventProps) {
  const doctorName = (event.details.doctor_name as string) || "Physician";
  const specialty = (event.details.specialty as string) || "Clinical Care";
  const status = (event.status || (event.details.status as string) || "scheduled").toLowerCase();
  const notes = (event.details.notes as string) || null;

  const getStatusBadge = () => {
    if (status.includes("completed")) {
      return (
        <Badge className="h-5 px-1.5 text-[10px] uppercase font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
          Completed
        </Badge>
      );
    }
    if (status.includes("cancelled")) {
      return (
        <Badge variant="outline" className="h-5 px-1.5 text-[10px] uppercase font-bold text-destructive border-destructive/30">
          Cancelled
        </Badge>
      );
    }
    return (
      <Badge className="h-5 px-1.5 text-[10px] uppercase font-bold bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30">
        Scheduled
      </Badge>
    );
  };

  return (
    <div className="group relative flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-lg bg-[var(--card)] border border-[var(--border)] shadow-2xs hover:border-emerald-500/40 hover:shadow-xs transition-all">
      <div className="flex items-start gap-2.5">
        <div className="p-1.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mt-0.5">
          <AppIcon icon={Calendar03Icon} size="xs" />
        </div>

        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[var(--foreground)]">
              Doctor Consultation
            </span>
            {getStatusBadge()}
            <span className="text-[10px] font-mono text-[var(--muted-foreground)]">
              {event.timeLabel}
            </span>
          </div>

          <div className="text-xs font-bold text-[var(--foreground)]">
            Dr. {doctorName} · <span className="text-[var(--muted-foreground)] font-normal">{specialty}</span>
          </div>

          {notes ? (
            <p className="text-[11px] text-[var(--muted-foreground)] italic line-clamp-1">
              "{notes}"
            </p>
          ) : (
            <p className="text-[11px] text-[var(--muted-foreground)]">
              {event.summary || "Clinical care appointment"}
            </p>
          )}
        </div>
      </div>

      <div className="self-end sm:self-center">
        <Link
          to={event.deepLink}
          className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline group-hover:translate-x-0.5 transition-transform"
        >
          <span>View Session</span>
          <AppIcon icon={ArrowRight01Icon} size="xs" />
        </Link>
      </div>
    </div>
  );
}
