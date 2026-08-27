import { DocumentCodeIcon } from "@hugeicons/core-free-icons";
import { AppIcon } from "../../../components/common/AppIcon";

interface ReportsHeaderProps {
  totalReports: number;
}

export function ReportsHeader({ totalReports }: ReportsHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[var(--border-subtle)]">
      <div className="space-y-0.5">
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-[var(--primary)] uppercase tracking-wider">
          <AppIcon icon={DocumentCodeIcon} size="xs" />
          <span>Private Evidence Vault</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-[var(--foreground)] tracking-tight">
          Medical Reports
        </h1>
        <p className="text-xs text-[var(--muted-foreground)]">
          A continuous chronological story of your risk assessments, daily readings, medical reports, and consultations.
        </p>
      </div>

      {totalReports > 0 && (
        <div className="self-start sm:self-auto px-2.5 py-1 rounded-md bg-[var(--surface-soft)] border border-[var(--border-subtle)] text-[11px] font-mono text-[var(--muted-foreground)]">
          <span className="font-bold text-[var(--foreground)]">{totalReports}</span> {totalReports === 1 ? "recorded report" : "recorded reports"}
        </div>
      )}
    </div>
  );
}
