import { Link } from "react-router-dom";
import { ArrowRight01Icon, HealthIcon } from "@hugeicons/core-free-icons";
import { AppIcon } from "../../../components/common/AppIcon";
import { HistoryEventVM } from "../types/history.types";
import { Badge } from "../../../shared/ui";

interface AssessmentHistoryEventProps {
  event: HistoryEventVM;
}

export function AssessmentHistoryEvent({ event }: AssessmentHistoryEventProps) {
  const riskLevel = String(event.status || event.details.risk_level || "evaluated").toLowerCase();
  const probability = (event.details.probability_score as number) ?? 0;
  const probabilityPct = Math.round(probability * 100);
  const modelVersion = (event.details.model_version as string) || "v1.0";

  const getRiskBadge = () => {
    if (riskLevel.includes("high")) {
      return (
        <Badge variant="destructive" className="h-5 px-1.5 text-[10px] uppercase font-bold">
          High Risk
        </Badge>
      );
    }
    if (riskLevel.includes("moderate") || riskLevel.includes("medium")) {
      return (
        <Badge className="h-5 px-1.5 text-[10px] uppercase font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
          Moderate Risk
        </Badge>
      );
    }
    return (
      <Badge className="h-5 px-1.5 text-[10px] uppercase font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
        Low Risk
      </Badge>
    );
  };

  return (
    <div className="group relative flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3.5 rounded-lg bg-[var(--card)] border border-[var(--border)] shadow-2xs hover:border-[var(--primary)]/40 hover:shadow-xs transition-all">
      <div className="flex items-start gap-2.5">
        <div className="p-1.5 rounded-md bg-[var(--accent-soft)] text-[var(--primary)] mt-0.5">
          <AppIcon icon={HealthIcon} size="xs" />
        </div>

        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-[var(--foreground)]">
              AI Risk Evaluation
            </span>
            {getRiskBadge()}
            <span className="text-[10px] font-mono text-[var(--muted-foreground)]">
              {event.timeLabel}
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-sm font-bold text-[var(--foreground)]">
              {probabilityPct}% Calculated Probability
            </span>
            <span className="text-[10px] font-mono text-[var(--muted-foreground)]">
              Model {modelVersion}
            </span>
          </div>

          <p className="text-[11px] text-[var(--muted-foreground)]">
            Metabolic indicators and clinical biomarkers evaluated for gestational health risk.
          </p>
        </div>
      </div>

      <div className="self-end sm:self-center">
        <Link
          to={event.deepLink}
          className="inline-flex items-center gap-1 text-[11px] font-bold text-[var(--primary)] hover:underline group-hover:translate-x-0.5 transition-transform"
        >
          <span>View Result</span>
          <AppIcon icon={ArrowRight01Icon} size="xs" />
        </Link>
      </div>
    </div>
  );
}
