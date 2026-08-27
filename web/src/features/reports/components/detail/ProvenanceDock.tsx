import {
  Shield01Icon,
  CpuIcon,
  Clock01Icon,
  DocumentCodeIcon,
} from "@hugeicons/core-free-icons";
import { AppIcon } from "../../../../components/common/AppIcon";
import { ReportViewModel } from "../../types/reports.types";
import { REPORTS_CONFIG } from "../../config/reports.config";

interface ProvenanceDockProps {
  report: ReportViewModel;
}

export function ProvenanceDock({ report }: ProvenanceDockProps) {
  const isReviewed = report.reviewStatus === "reviewed";

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 space-y-3 shadow-xs">
      <div className="flex items-center justify-between pb-2 border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--foreground)] uppercase tracking-wider">
          <AppIcon icon={CpuIcon} size="xs" className="text-[var(--primary)]" />
          <span>Provenance & Audit Trail</span>
        </div>

        <span className="text-[10px] font-mono text-[var(--muted-foreground)]">
          Audit Reference: {report.id.slice(0, 8)}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        {/* Source Document */}
        <div className="space-y-0.5">
          <span className="text-[10px] font-bold text-[var(--muted-foreground)] uppercase">
            Source Document
          </span>
          <p className="font-bold text-[var(--foreground)] truncate">
            {report.originalFilename}
          </p>
        </div>

        {/* OCR Engine */}
        <div className="space-y-0.5">
          <span className="text-[10px] font-bold text-[var(--muted-foreground)] uppercase">
            Extraction Provider
          </span>
          <p className="font-bold text-[var(--foreground)]">
            {REPORTS_CONFIG.ocrProviderName}
          </p>
        </div>

        {/* Timestamp */}
        <div className="space-y-0.5">
          <span className="text-[10px] font-bold text-[var(--muted-foreground)] uppercase">
            Ingestion Timestamp
          </span>
          <p className="font-mono text-[var(--foreground)]">
            {report.formattedDate} · {report.formattedTime}
          </p>
        </div>

        {/* Review Verification */}
        <div className="space-y-0.5">
          <span className="text-[10px] font-bold text-[var(--muted-foreground)] uppercase">
            Clinical Review State
          </span>
          <p className={`font-bold ${isReviewed ? "text-emerald-600 dark:text-emerald-400" : "text-[var(--primary)]"}`}>
            {isReviewed ? "Verified by Patient" : "Pending Patient Verification"}
          </p>
        </div>
      </div>
    </div>
  );
}
