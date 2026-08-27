import { Link } from "react-router-dom";
import {
  Clock01Icon,
  AlertCircleIcon,
  PlusSignIcon,
  ArrowRight02Icon,
  Calendar03Icon,
} from "@hugeicons/core-free-icons";
import { AppIcon } from "../../../../components/common/AppIcon";
import {
  Badge,
  Button,
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from "../../../../shared/ui";
import { AssessmentDetail, AssessmentHistoryItem } from "../../types/assessment.types";
import { useAssessmentComparison } from "../../hooks/useAssessmentComparison";
import { HistorySelector } from "./HistorySelector";
import { formatProbabilityPercent, formatAssessmentDate } from "../../utils/formatters";

interface HistoricalTrajectoryProps {
  assessment: AssessmentDetail;
  historyItems: AssessmentHistoryItem[];
}

export function HistoricalTrajectory({
  assessment,
  historyItems,
}: HistoricalTrajectoryProps) {
  const {
    comparison,
    previousHistory,
    selectedPreviousId,
    setSelectedPreviousId,
  } = useAssessmentComparison(assessment, historyItems);

  const getRiskBandBadge = (band: string) => {
    switch (band?.toLowerCase()) {
      case "low":
        return (
          <Badge
            variant="outline"
            className="text-[11px] font-bold border-[var(--success)]/30 bg-[var(--color-success-soft)] text-[var(--success)]"
          >
            Low
          </Badge>
        );
      case "high":
        return (
          <Badge
            variant="outline"
            className="text-[11px] font-bold border-[var(--destructive)]/30 bg-[var(--color-danger-soft)] text-[var(--destructive)]"
          >
            High
          </Badge>
        );
      case "moderate":
      default:
        return (
          <Badge
            variant="outline"
            className="text-[11px] font-bold border-[var(--warning)]/30 bg-[var(--color-warning-soft)] text-[var(--warning)]"
          >
            Moderate
          </Badge>
        );
    }
  };

  return (
    <section
      aria-labelledby="historical-trajectory-title"
      className="p-6 rounded-md bg-[var(--card)] border border-[var(--border)] space-y-5 shadow-xs"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <AppIcon icon={Clock01Icon} size="xs" className="text-[var(--primary)] shrink-0" />
            <h3
              id="historical-trajectory-title"
              className="text-xs font-black uppercase tracking-wider text-[var(--foreground)]"
            >
              Historical Trajectory
            </h3>
          </div>
          <p className="text-xs text-[var(--muted-foreground)]">
            Persisted assessment comparison over time
          </p>
        </div>

        <Button
          variant="ghost"
          size="xs"
          asChild
          className="h-7 text-[11px] font-semibold text-[var(--muted-foreground)] hover:text-[var(--foreground)] self-start sm:self-auto"
        >
          <Link to="/app/history">
            <span>View Full Timeline</span>
            <AppIcon icon={ArrowRight02Icon} size="xs" className="ml-1" />
          </Link>
        </Button>
      </div>

      {/* When NO previous assessments exist */}
      {!comparison.hasPrevious ? (
        <Empty className="py-8 bg-[var(--surface-soft)]/40 border border-dashed border-[var(--border)] rounded-md">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <AppIcon icon={Calendar03Icon} size="sm" className="text-[var(--muted-foreground)]" />
            </EmptyMedia>
            <EmptyTitle className="text-xs font-bold text-[var(--foreground)]">
              No earlier assessments
            </EmptyTitle>
            <EmptyDescription className="text-[11px] text-[var(--muted-foreground)] max-w-sm">
              This is your first stored assessment, so there is no previous result to compare yet.
              Your historical trajectory will appear here as future assessments are completed.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button
              variant="outline"
              size="sm"
              asChild
              className="h-8 text-xs font-semibold border-[var(--border)]"
            >
              <Link to="/app/assessment">
                <AppIcon icon={PlusSignIcon} size="xs" className="mr-1.5" />
                <span>Start a future assessment</span>
              </Link>
            </Button>
          </EmptyContent>
        </Empty>
      ) : (
        <div className="space-y-4">
          {/* Optional History Selector when multiple prior records exist */}
          <HistorySelector
            historyItems={previousHistory}
            selectedId={selectedPreviousId}
            onSelectId={setSelectedPreviousId}
          />

          {/* Two-Point Comparison Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Previous Assessment */}
            <div className="p-4 rounded-md bg-[var(--surface-soft)] border border-[var(--border-subtle)] space-y-2">
              <div className="flex items-center justify-between text-xs text-[var(--muted-foreground)]">
                <span className="font-bold uppercase tracking-wider text-[10px]">
                  Previous Assessment
                </span>
                <span className="font-medium">
                  {formatAssessmentDate(comparison.previousAssessment?.createdAt || "")}
                </span>
              </div>

              <div className="flex items-baseline justify-between pt-1">
                <div>
                  <span className="text-xl font-mono font-black text-[var(--foreground)]">
                    {formatProbabilityPercent(
                      comparison.previousAssessment?.probability ??
                        comparison.previousAssessment?.probabilityScore ??
                        0
                    )}
                  </span>
                  <span className="text-[11px] text-[var(--muted-foreground)] block">
                    model probability
                  </span>
                </div>
                {getRiskBandBadge(comparison.previousAssessment?.riskBand || "moderate")}
              </div>

              <div className="text-[10px] font-mono text-[var(--muted-foreground)] pt-1">
                Model v{comparison.previousAssessment?.modelVersion || "1.0.0"}
              </div>
            </div>

            {/* Current Assessment */}
            <div className="p-4 rounded-md bg-[var(--card)] border border-[var(--primary)]/30 shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-extrabold uppercase tracking-wider text-[10px] text-[var(--primary)]">
                  Current Assessment
                </span>
                <span className="text-[var(--muted-foreground)] font-medium">
                  {formatAssessmentDate(comparison.currentAssessment.createdAt)}
                </span>
              </div>

              <div className="flex items-baseline justify-between pt-1">
                <div>
                  <span className="text-xl font-mono font-black text-[var(--foreground)]">
                    {formatProbabilityPercent(
                      comparison.currentAssessment.probability ??
                        comparison.currentAssessment.probabilityScore ??
                        0
                    )}
                  </span>
                  <span className="text-[11px] text-[var(--muted-foreground)] block">
                    model probability
                  </span>
                </div>
                {getRiskBandBadge(comparison.currentAssessment.riskBand)}
              </div>

              <div className="text-[10px] font-mono text-[var(--muted-foreground)] pt-1">
                Model v{comparison.currentAssessment.model?.version || "1.0.0"}
              </div>
            </div>
          </div>

          {/* Arithmetic Delta Banner */}
          {comparison.probabilityDelta !== null && (
            <div className="p-3 rounded-md bg-[var(--surface-soft)]/60 border border-[var(--border-subtle)] flex items-center justify-between text-xs">
              <span className="text-[var(--muted-foreground)] font-medium">
                Probability difference from selected record:
              </span>
              <span className="font-mono font-bold text-[var(--foreground)]">
                {comparison.probabilityDelta > 0
                  ? `+${comparison.probabilityDelta} percentage points`
                  : comparison.probabilityDelta < 0
                  ? `${comparison.probabilityDelta} percentage points`
                  : "0.0 percentage points (Unchanged)"}
              </span>
            </div>
          )}

          {/* Model Version Discrepancy Notice */}
          {!comparison.isSameModelVersion && (
            <div className="p-3 rounded-md bg-[var(--surface-soft)] border border-[var(--border)] flex items-start gap-2 text-xs text-[var(--muted-foreground)]">
              <AppIcon icon={AlertCircleIcon} size="xs" className="text-[var(--warning)] shrink-0 mt-0.5" />
              <p className="text-[11px] leading-relaxed">
                <strong>Different Model Versions:</strong> The compared assessments were evaluated under different model versions (v{comparison.previousAssessment?.modelVersion} vs v{comparison.currentAssessment.model?.version}). Direct probability comparison reflects differing underlying algorithms.
              </p>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
