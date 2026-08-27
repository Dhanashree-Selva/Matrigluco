import { Link } from "react-router-dom";
import { ArrowRight01Icon, DocumentCodeIcon } from "@hugeicons/core-free-icons";
import { AppIcon } from "../../../components/common/AppIcon";
import { HistoryEventVM } from "../types/history.types";
import { Badge } from "../../../shared/ui";

interface ReportHistoryEventProps {
  event: HistoryEventVM;
}

export function ReportHistoryEvent({ event }: ReportHistoryEventProps) {
  const fileName = (event.details.file_name as string) || "Medical Document";
  const hasExtractedData = Boolean(event.details.has_extracted_data);

  return (
    <div className="group relative flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-lg bg-[var(--card)] border border-[var(--border)] shadow-2xs hover:border-blue-500/40 hover:shadow-xs transition-all">
      <div className="flex items-start gap-2.5">
        <div className="p-1.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 mt-0.5">
          <AppIcon icon={DocumentCodeIcon} size="xs" />
        </div>

        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[var(--foreground)]">
              Medical Report
            </span>
            <Badge variant="outline" className="h-5 px-1.5 text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400 border-blue-500/30">
              Processed
            </Badge>
            <span className="text-[10px] font-mono text-[var(--muted-foreground)]">
              {event.timeLabel}
            </span>
          </div>

          <div className="text-xs font-bold text-[var(--foreground)] truncate max-w-sm">
            {fileName}
          </div>

          <p className="text-[11px] text-[var(--muted-foreground)]">
            {event.summary || (hasExtractedData ? "Biomarkers parsed and synchronized" : "Document attached")}
          </p>
        </div>
      </div>

      <div className="self-end sm:self-center">
        <Link
          to={event.deepLink}
          className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline group-hover:translate-x-0.5 transition-transform"
        >
          <span>View Report</span>
          <AppIcon icon={ArrowRight01Icon} size="xs" />
        </Link>
      </div>
    </div>
  );
}
