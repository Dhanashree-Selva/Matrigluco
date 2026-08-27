import { Calendar03Icon, CheckmarkCircle01Icon } from "@hugeicons/core-free-icons";
import { AppIcon } from "../../../../components/common/AppIcon";
import { ScrollArea, ScrollBar, Badge } from "../../../../shared/ui";
import { AssessmentHistoryItem } from "../../types/assessment.types";
import { formatProbabilityPercent, formatAssessmentDate } from "../../utils/formatters";

interface HistorySelectorProps {
  historyItems: AssessmentHistoryItem[];
  selectedId: string | null;
  onSelectId: (id: string) => void;
}

export function HistorySelector({
  historyItems,
  selectedId,
  onSelectId,
}: HistorySelectorProps) {
  if (historyItems.length <= 1) return null;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs text-[var(--muted-foreground)]">
        <span className="text-[11px] font-bold uppercase tracking-wider">
          Compare with other assessments
        </span>
        <span className="text-[10px]">{historyItems.length} prior records</span>
      </div>

      <ScrollArea className="w-full whitespace-nowrap rounded-md border border-[var(--border-subtle)] bg-[var(--surface-soft)]/50 p-1.5">
        <div className="flex space-x-2">
          {historyItems.map((item) => {
            const isSelected = item.id === selectedId;
            const prob = item.probability ?? item.probabilityScore ?? 0;
            const probPercent = formatProbabilityPercent(prob);
            // Format as "Aug 17 · 8:15 PM" (or with year if not current year)
            const dateStr = formatAssessmentDate(item.createdAt, {
              includeYear: new Date(item.createdAt).getFullYear() !== new Date().getFullYear(),
              includeTime: true,
            });

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectId(item.id)}
                aria-current={isSelected ? "true" : undefined}
                className={`inline-flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs font-semibold transition-all shrink-0 ${
                  isSelected
                    ? "bg-[var(--card)] text-[var(--foreground)] border border-[var(--primary)]/40 shadow-2xs font-bold"
                    : "bg-[var(--surface-soft)] text-[var(--muted-foreground)] border border-transparent hover:text-[var(--foreground)] hover:bg-[var(--card)]"
                }`}
              >
                <AppIcon
                  icon={isSelected ? CheckmarkCircle01Icon : Calendar03Icon}
                  size="xs"
                  className={isSelected ? "text-[var(--primary)]" : "text-[var(--muted-foreground)]"}
                />
                <span>{dateStr}</span>
                <span className="font-mono text-[10px] text-[var(--primary)]">({probPercent})</span>
                <Badge
                  variant="outline"
                  className="text-[9px] font-mono border-[var(--border)] px-1 py-0"
                >
                  v{item.modelVersion}
                </Badge>
              </button>
            );
          })}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}
