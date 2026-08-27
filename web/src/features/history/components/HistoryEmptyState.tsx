import { Link } from "react-router-dom";
import {
  Clock01Icon,
  FilterIcon,
  HealthIcon,
  Activity02Icon,
  DocumentCodeIcon,
} from "@hugeicons/core-free-icons";
import { AppIcon } from "../../../components/common/AppIcon";
import { Button } from "../../../shared/ui";

interface HistoryEmptyStateProps {
  isFiltered: boolean;
  onResetFilters: () => void;
}

export function HistoryEmptyState({
  isFiltered,
  onResetFilters,
}: HistoryEmptyStateProps) {
  if (isFiltered) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center bg-[var(--card)] border border-[var(--border)] rounded-xl space-y-3 shadow-2xs">
        <div className="w-12 h-12 rounded-full bg-[var(--surface-soft)] flex items-center justify-center text-[var(--muted-foreground)]">
          <AppIcon icon={FilterIcon} size="md" />
        </div>

        <div className="space-y-1 max-w-sm">
          <h3 className="text-sm font-bold text-[var(--foreground)]">
            No events match your active filters
          </h3>
          <p className="text-xs text-[var(--muted-foreground)]">
            Try adjusting your source selection, date range, or clear the filters to view your full chronicle.
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onResetFilters}
          className="text-xs font-semibold"
        >
          Reset All Filters
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-[var(--card)] border border-[var(--border)] rounded-xl space-y-4 shadow-2xs">
      <div className="w-14 h-14 rounded-full bg-[var(--accent-soft)] flex items-center justify-center text-[var(--primary)]">
        <AppIcon icon={Clock01Icon} size="lg" />
      </div>

      <div className="space-y-1 max-w-md">
        <h3 className="text-base font-bold text-[var(--foreground)]">
          Your Health Chronicle is Ready to Begin
        </h3>
        <p className="text-xs text-[var(--muted-foreground)]">
          As you evaluate clinical risk, log daily glucose readings, upload medical reports, or schedule consultations, your care story will unfold chronologically right here.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
        <Button asChild size="sm" className="h-8 text-xs font-bold bg-[var(--primary)] text-white gap-1.5">
          <Link to="/app/assessment">
            <AppIcon icon={HealthIcon} size="xs" />
            <span>Check Risk</span>
          </Link>
        </Button>

        <Button asChild variant="outline" size="sm" className="h-8 text-xs font-bold gap-1.5 border-[var(--border)]">
          <Link to="/app/tracking">
            <AppIcon icon={Activity02Icon} size="xs" />
            <span>Log Reading</span>
          </Link>
        </Button>

        <Button asChild variant="outline" size="sm" className="h-8 text-xs font-bold gap-1.5 border-[var(--border)]">
          <Link to="/app/reports">
            <AppIcon icon={DocumentCodeIcon} size="xs" />
            <span>Upload Report</span>
          </Link>
        </Button>
      </div>
    </div>
  );
}
