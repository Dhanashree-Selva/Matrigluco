import {
  Button,
} from "../../../shared/ui";
import { ReportListFilter } from "../types/reports.types";
import {
  DocumentCodeIcon,
  PlusSignIcon,
} from "@hugeicons/core-free-icons";
import { AppIcon } from "../../../components/common/AppIcon";

interface ReportsFilterBarProps {
  currentFilter: ReportListFilter;
  onFilterChange: (filter: ReportListFilter) => void;
  onOpenUpload: () => void;
  counts: {
    all: number;
    needs_review: number;
    processing: number;
    reviewed: number;
    failed: number;
  };
}

export function ReportsFilterBar({
  currentFilter,
  onFilterChange,
  onOpenUpload,
  counts,
}: ReportsFilterBarProps) {
  const filterItems = [
    { key: "all" as ReportListFilter, label: "ALL", count: counts.all },
    {
      key: "needs_review" as ReportListFilter,
      label: "NEEDS REVIEW",
      count: counts.needs_review,
    },
    ...(counts.processing > 0
      ? [
          {
            key: "processing" as ReportListFilter,
            label: "PROCESSING",
            count: counts.processing,
          },
        ]
      : []),
    {
      key: "reviewed" as ReportListFilter,
      label: "REVIEWED",
      count: counts.reviewed,
    },
  ];

  return (
    <div className="w-full bg-[var(--surface-soft)]/60 border border-[var(--border-subtle)] rounded-lg p-1.5 sm:p-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 select-none shadow-2xs">
      <div className="flex items-center gap-2 flex-wrap flex-1 min-w-0">
        {/* Index Label */}
        <div className="hidden sm:flex items-center gap-1.5 px-2 text-[11px] font-bold text-[var(--muted-foreground)] uppercase tracking-wider shrink-0">
          <AppIcon icon={DocumentCodeIcon} size="xs" className="text-[var(--primary)]" />
          <span>Vault Index</span>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {filterItems.map((item) => {
            const isActive = currentFilter === item.key;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => onFilterChange(item.key)}
                className={`group relative flex items-center justify-center h-9 px-3.5 py-1 rounded-md text-xs font-bold transition-all ${
                  isActive
                    ? "bg-[var(--primary)] text-white shadow-sm"
                    : "bg-[var(--card)] text-[var(--foreground)] border border-[var(--border-subtle)] hover:border-[var(--primary)]/40 hover:bg-[var(--surface-soft)]"
                }`}
                aria-label={`Filter reports by ${item.label}`}
                aria-current={isActive ? "true" : undefined}
              >
                <span className="text-[11px] tracking-wider uppercase">
                  {item.label}
                </span>
                <span
                  className={`ml-1.5 text-[10px] font-mono px-1 rounded ${
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-[var(--surface-soft)] text-[var(--muted-foreground)]"
                  }`}
                >
                  {item.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Upload Action */}
      <div className="shrink-0 self-end sm:self-center">
        <Button
          type="button"
          onClick={onOpenUpload}
          className="h-9 gap-1.5 bg-[var(--primary)] text-white hover:bg-[var(--primary)]/90 shadow-2xs font-bold text-xs px-3.5 rounded-md"
        >
          <AppIcon icon={PlusSignIcon} size="xs" />
          <span>Upload Report</span>
        </Button>
      </div>
    </div>
  );
}
