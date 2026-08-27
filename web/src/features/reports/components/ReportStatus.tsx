import { Badge, Spinner } from "../../../shared/ui";
import {
  Tick01Icon,
  AlertCircleIcon,
  DocumentCodeIcon,
} from "@hugeicons/core-free-icons";
import { AppIcon } from "../../../components/common/AppIcon";
import { ReportProcessingStatus, ReportReviewStatus } from "../types/reports.types";

interface ReportStatusProps {
  processingStatus: ReportProcessingStatus;
  reviewStatus: ReportReviewStatus;
  className?: string;
}

export function ReportStatus({
  processingStatus,
  reviewStatus,
  className = "",
}: ReportStatusProps) {
  if (processingStatus === "failed") {
    return (
      <Badge
        variant="outline"
        className={`gap-1 border-destructive/40 bg-destructive/10 text-destructive text-[11px] font-bold py-0.5 px-2 ${className}`}
      >
        <AppIcon icon={AlertCircleIcon} size="xxs" />
        <span>Processing failed</span>
      </Badge>
    );
  }

  if (processingStatus === "processing") {
    return (
      <Badge
        variant="outline"
        className={`gap-1.5 border-[var(--border)] bg-[var(--surface-soft)] text-[var(--foreground)] text-[11px] font-bold py-0.5 px-2 ${className}`}
      >
        <Spinner className="h-3 w-3 text-[var(--primary)]" />
        <span>Processing report</span>
      </Badge>
    );
  }

  if (reviewStatus === "reviewed") {
    return (
      <Badge
        variant="outline"
        className={`gap-1 border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[11px] font-bold py-0.5 px-2 ${className}`}
      >
        <AppIcon icon={Tick01Icon} size="xxs" />
        <span>Review completed</span>
      </Badge>
    );
  }

  if (reviewStatus === "needs_review") {
    return (
      <Badge
        variant="outline"
        className={`gap-1 border-[var(--primary)]/40 bg-[var(--accent-soft)] text-[var(--primary)] text-[11px] font-bold py-0.5 px-2 ${className}`}
      >
        <AppIcon icon={DocumentCodeIcon} size="xxs" />
        <span>Review required</span>
      </Badge>
    );
  }

  return (
    <Badge
      variant="outline"
      className={`gap-1 border-[var(--border-subtle)] bg-[var(--surface-soft)] text-[var(--muted-foreground)] text-[11px] font-bold py-0.5 px-2 ${className}`}
    >
      <span>Uploaded</span>
    </Badge>
  );
}
