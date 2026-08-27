import { useState, useEffect } from "react";
import { ReportListFilter } from "../types/reports.types";
import { useReports } from "../hooks/useReports";
import { ReportsHeader } from "../components/ReportsHeader";
import { ReportsFilterBar } from "../components/ReportsFilterBar";
import { ReportCapsule } from "../components/ReportCapsule";
import { SecureIntake } from "../components/SecureIntake";
import { ReportEmptyState } from "../components/ReportEmptyState";
import { ReportsSkeleton } from "../components/ReportsSkeleton";

export default function ReportsPage() {
  const [currentFilter, setCurrentFilter] = useState<ReportListFilter>("all");
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  const { reports, allReports, counts, isLoading, isError, hasReports } = useReports({
    filter: currentFilter,
  });

  useEffect(() => {
    document.title = "Medical Reports — MatriGluco";
  }, []);

  const needsReviewReports = allReports.filter((r) => r.reviewStatus === "needs_review");
  const otherReports = allReports.filter((r) => r.reviewStatus !== "needs_review");

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-in fade-in-50 duration-200">
      {/* 1. Header */}
      <ReportsHeader totalReports={counts.all} />

      {/* 2. Vault Index & Filter Bar */}
      <ReportsFilterBar
        currentFilter={currentFilter}
        onFilterChange={setCurrentFilter}
        onOpenUpload={() => setIsUploadOpen(true)}
        counts={counts}
      />

      {/* 3. Main Content Area */}
      {isLoading ? (
        <ReportsSkeleton />
      ) : isError ? (
        <div className="p-8 text-center rounded-xl border border-destructive/30 bg-destructive/5 text-destructive space-y-2">
          <p className="text-sm font-bold">Failed to load medical reports vault</p>
          <p className="text-xs text-[var(--muted-foreground)]">
            Please check your connection and try refreshing the page.
          </p>
        </div>
      ) : !hasReports ? (
        <ReportEmptyState
          isFiltered={false}
          onUploadClick={() => setIsUploadOpen(true)}
        />
      ) : reports.length === 0 ? (
        <ReportEmptyState
          isFiltered={true}
          onUploadClick={() => setIsUploadOpen(true)}
          onClearFilter={() => setCurrentFilter("all")}
        />
      ) : currentFilter === "all" && needsReviewReports.length > 0 ? (
        /* Categorized Vault Sections when in 'All' view */
        <div className="space-y-8">
          {/* 1. Needs Attention */}
          <section className="space-y-3" aria-label="Reports requiring review">
            <div className="flex items-center justify-between pb-1 border-b border-[var(--border-subtle)]">
              <h2 className="text-xs font-black text-[var(--primary)] uppercase tracking-wider flex items-center gap-1.5">
                <span>Action Required • Verify Extracted Data</span>
                <span className="text-[10px] font-mono font-bold bg-[var(--accent-soft)] px-1.5 py-0.2 rounded">
                  ({needsReviewReports.length})
                </span>
              </h2>
            </div>

            <div className="space-y-3">
              {needsReviewReports.map((report) => (
                <ReportCapsule key={report.id} report={report} />
              ))}
            </div>
          </section>

          {/* 2. All Other Reports */}
          {otherReports.length > 0 && (
            <section className="space-y-3" aria-label="Verified and processed reports">
              <div className="flex items-center justify-between pb-1 border-b border-[var(--border-subtle)]">
                <h2 className="text-xs font-black text-[var(--muted-foreground)] uppercase tracking-wider flex items-center gap-1.5">
                  <span>Vault Archives & Processed Records</span>
                  <span className="text-[10px] font-mono font-bold bg-[var(--surface-soft)] px-1.5 py-0.2 rounded">
                    ({otherReports.length})
                  </span>
                </h2>
              </div>

              <div className="space-y-3">
                {otherReports.map((report) => (
                  <ReportCapsule key={report.id} report={report} />
                ))}
              </div>
            </section>
          )}
        </div>
      ) : (
        /* Filtered List View */
        <div className="space-y-3">
          {reports.map((report) => (
            <ReportCapsule key={report.id} report={report} />
          ))}
        </div>
      )}

      {/* Secure Intake Modal */}
      <SecureIntake open={isUploadOpen} onOpenChange={setIsUploadOpen} />
    </div>
  );
}
