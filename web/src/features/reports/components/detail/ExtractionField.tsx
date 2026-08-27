import { Input, Badge } from "../../../../shared/ui";
import { Tick01Icon } from "@hugeicons/core-free-icons";
import { AppIcon } from "../../../../components/common/AppIcon";
import { ExtractedBiomarkerItem } from "../../types/reports.types";
import { SourceTrace } from "./SourceTrace";

interface ExtractionFieldProps {
  item: ExtractedBiomarkerItem;
  isEditing: boolean;
  editValue: string;
  onEditChange: (val: string) => void;
}

export function ExtractionField({
  item,
  isEditing,
  editValue,
  onEditChange,
}: ExtractionFieldProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-lg border border-[var(--border-subtle)] bg-[var(--card)] hover:bg-[var(--surface-soft)]/50 transition-colors">
      <div className="space-y-0.5 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-[var(--foreground)]">
            {item.label}
          </span>
          <SourceTrace pageNumber={item.sourcePage} />
        </div>
        <span className="text-[10px] font-mono text-[var(--muted-foreground)]">
          Canonical key: {item.key}
        </span>
      </div>

      <div className="flex items-center gap-2.5 self-start sm:self-center shrink-0">
        {isEditing ? (
          <div className="flex items-center gap-1.5">
            <Input
              type="text"
              value={editValue}
              onChange={(e) => onEditChange(e.target.value)}
              className="h-8 w-28 text-xs font-bold font-mono bg-[var(--surface-soft)]"
              aria-label={`Edit value for ${item.label}`}
            />
            {item.unit && (
              <span className="text-xs font-bold text-[var(--muted-foreground)] font-mono">
                {item.unit}
              </span>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-sm font-black font-mono text-[var(--foreground)]">
              {item.value}
            </span>
            {item.unit && (
              <Badge
                variant="outline"
                className="text-[10px] font-mono font-bold py-0 px-1.5 bg-[var(--surface-soft)] text-[var(--muted-foreground)] border-[var(--border-subtle)]"
              >
                {item.unit}
              </Badge>
            )}

            {item.isReviewed && (
              <Badge
                variant="outline"
                className="text-[10px] font-bold py-0 px-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 gap-1"
              >
                <AppIcon icon={Tick01Icon} size="xxs" />
                <span>Verified</span>
              </Badge>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
