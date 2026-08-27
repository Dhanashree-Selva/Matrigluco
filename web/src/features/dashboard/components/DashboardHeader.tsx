import { SparklesIcon, Clock01Icon } from "@hugeicons/core-free-icons";
import { AppIcon } from "../../../components/common/AppIcon";
import { Badge, Button } from "../../../shared/ui";
import { DashboardPeriod } from "../hooks/useDashboardPeriod";

export interface DashboardHeaderProps {
  userName?: string;
  pregnancyWeek?: number | null;
  recencyText?: string;
  period: DashboardPeriod;
  onPeriodChange: (period: DashboardPeriod) => void;
}

export function DashboardHeader({
  userName,
  pregnancyWeek,
  recencyText = "Updated recently",
  period,
  onPeriodChange,
}: DashboardHeaderProps) {
  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-xs font-bold text-[var(--primary)] uppercase tracking-wider">
          <AppIcon icon={SparklesIcon} size="xs" />
          <span>Care Orbit Workspace</span>
          {Boolean(typeof pregnancyWeek === "number" && pregnancyWeek > 0) && (
            <Badge
              variant="outline"
              className="bg-[var(--accent-soft)] text-[var(--primary)] border-[var(--primary)]/20 text-[10px] font-extrabold px-2 py-0.5"
            >
              Week {pregnancyWeek}
            </Badge>
          )}
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-[var(--foreground)] tracking-tight">
          {getGreeting()}, {userName || "Mama"}
        </h1>
        <div className="flex items-center gap-1.5 text-xs text-[var(--muted-foreground)]">
          <AppIcon icon={Clock01Icon} size="xs" className="shrink-0" />
          <span>{recencyText}</span>
        </div>
      </div>

      {/* Period Selector Tabs */}
      <div className="flex items-center gap-1 bg-[var(--surface-soft)] p-1 rounded-md border border-[var(--border)] self-start sm:self-center">
        <Button
          type="button"
          size="sm"
          variant={period === "7d" ? "default" : "ghost"}
          onClick={() => onPeriodChange("7d")}
          className={`h-8 px-3 text-xs font-bold cursor-pointer rounded-md ${
            period === "7d"
              ? "bg-[var(--primary)] text-[var(--primary-foreground)] shadow-xs"
              : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          }`}
        >
          Last 7 Days
        </Button>
        <Button
          type="button"
          size="sm"
          variant={period === "30d" ? "default" : "ghost"}
          onClick={() => onPeriodChange("30d")}
          className={`h-8 px-3 text-xs font-bold cursor-pointer rounded-md ${
            period === "30d"
              ? "bg-[var(--primary)] text-[var(--primary-foreground)] shadow-xs"
              : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          }`}
        >
          Last 30 Days
        </Button>
      </div>
    </header>
  );
}
