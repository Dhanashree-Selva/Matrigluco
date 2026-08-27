import { Link } from "react-router-dom";
import {
  ArrowLeft02Icon,
  PlusSignIcon,
  Clock01Icon,
} from "@hugeicons/core-free-icons";
import { AppIcon } from "../../../../components/common/AppIcon";
import { Button, Badge } from "../../../../shared/ui";
import { AssessmentDetail } from "../../types/assessment.types";
import { formatAssessmentDate } from "../../utils/formatters";

interface ResultHeaderProps {
  assessment: AssessmentDetail;
}

export function ResultHeader({ assessment }: ResultHeaderProps) {
  const formattedDate = formatAssessmentDate(assessment.createdAt);
  const modelVersion = assessment.model?.version || "1.0.0";

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border)]">
      {/* Left: Breadcrumb / Identity */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-xs text-[var(--muted-foreground)]">
          <Link
            to="/app/assessment"
            className="hover:text-[var(--foreground)] transition-colors inline-flex items-center gap-1"
          >
            <AppIcon icon={ArrowLeft02Icon} size="xs" />
            <span>Assessments</span>
          </Link>
          <span>/</span>
          <span className="text-[var(--foreground)] font-semibold">Result</span>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-[var(--foreground)]">
            Assessment Result
          </h1>
          <Badge
            variant="outline"
            className="text-[11px] font-mono border-[var(--border)] text-[var(--muted-foreground)] bg-[var(--surface-soft)] px-2 py-0.5"
          >
            v{modelVersion}
          </Badge>
        </div>
        <p className="text-xs text-[var(--muted-foreground)] flex items-center gap-1.5">
          <AppIcon icon={Clock01Icon} size="xs" className="shrink-0" />
          <span>Completed {formattedDate}</span>
        </p>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 self-start sm:self-center">
        <Button
          variant="outline"
          size="sm"
          asChild
          className="h-8 text-xs font-semibold border-[var(--border)]"
        >
          <Link to="/app/assessment">
            <AppIcon icon={PlusSignIcon} size="xs" className="mr-1.5" />
            <span>New Assessment</span>
          </Link>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="h-8 text-xs font-semibold text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
        >
          <Link to="/app/history">
            <span>View History</span>
          </Link>
        </Button>
      </div>
    </div>
  );
}
