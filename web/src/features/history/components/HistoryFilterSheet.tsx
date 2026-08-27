import { useState, useEffect } from "react";
import { FilterIcon, Cancel01Icon } from "@hugeicons/core-free-icons";
import { AppIcon } from "../../../components/common/AppIcon";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  Button,
  Badge,
} from "../../../shared/ui";
import { Checkbox } from "../../../components/ui/checkbox";
import { HistoryEventType } from "../types/history.types";
import {
  HISTORY_SOURCE_CONFIG,
  ALL_HISTORY_SOURCES,
} from "../config/history-sources.config";

interface HistoryFilterSheetProps {
  selectedTypes: HistoryEventType[];
  onTypesChange: (types: HistoryEventType[]) => void;
  eventCounts?: Record<string, number>;
}

export function HistoryFilterSheet({
  selectedTypes,
  onTypesChange,
  eventCounts = {},
}: HistoryFilterSheetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [localTypes, setLocalTypes] = useState<HistoryEventType[]>(selectedTypes);

  useEffect(() => {
    setLocalTypes(selectedTypes);
  }, [selectedTypes, isOpen]);

  const toggleType = (type: HistoryEventType) => {
    if (localTypes.includes(type)) {
      setLocalTypes(localTypes.filter((t) => t !== type));
    } else {
      setLocalTypes([...localTypes, type]);
    }
  };

  const handleApply = () => {
    onTypesChange(localTypes);
    setIsOpen(false);
  };

  const handleReset = () => {
    setLocalTypes(ALL_HISTORY_SOURCES);
    onTypesChange(ALL_HISTORY_SOURCES);
    setIsOpen(false);
  };

  const activeCount =
    selectedTypes.length < ALL_HISTORY_SOURCES.length
      ? selectedTypes.length
      : 0;

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="relative h-8 px-2.5 text-xs font-semibold gap-1.5 border-[var(--border)] bg-[var(--card)]"
        >
          <AppIcon icon={FilterIcon} size="xs" className="text-[var(--primary)]" />
          <span>Filters</span>
          {activeCount > 0 && (
            <Badge
              variant="default"
              className="h-4 px-1 text-[10px] bg-[var(--primary)] text-white"
            >
              {activeCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>

      <SheetContent
        side="bottom"
        className="max-h-[85vh] rounded-t-xl p-4 bg-[var(--card)] border-t border-[var(--border)] space-y-4"
      >
        <SheetHeader className="text-left space-y-1">
          <SheetTitle className="text-base font-bold text-[var(--foreground)]">
            Filter Health Chronicle
          </SheetTitle>
          <SheetDescription className="text-xs text-[var(--muted-foreground)]">
            Select the health sources you want to display in your care narrative.
          </SheetDescription>
        </SheetHeader>

        {/* Source Checkboxes */}
        <div className="space-y-2 py-2">
          {ALL_HISTORY_SOURCES.map((type) => {
            const meta = HISTORY_SOURCE_CONFIG[type];
            const isChecked = localTypes.includes(type);
            const count = eventCounts[type] ?? 0;

            return (
              <label
                key={type}
                htmlFor={`filter-${type}`}
                className={`flex items-center justify-between p-3 rounded-lg border transition-colors cursor-pointer ${
                  isChecked
                    ? "bg-[var(--accent-soft)]/50 border-[var(--primary)]/30 text-[var(--foreground)]"
                    : "bg-[var(--surface-soft)]/40 border-[var(--border-subtle)] text-[var(--muted-foreground)]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Checkbox
                    id={`filter-${type}`}
                    checked={isChecked}
                    onCheckedChange={() => toggleType(type)}
                  />
                  <AppIcon icon={meta.icon} size="sm" className={meta.colorClass} />
                  <div>
                    <div className="text-xs font-bold text-[var(--foreground)]">
                      {meta.pluralLabel}
                    </div>
                    <div className="text-[11px] text-[var(--muted-foreground)]">
                      {meta.description}
                    </div>
                  </div>
                </div>

                {count > 0 && (
                  <span className="text-xs font-mono font-bold text-[var(--muted-foreground)]">
                    {count}
                  </span>
                )}
              </label>
            );
          })}
        </div>

        <SheetFooter className="flex flex-row items-center gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            className="flex-1 h-9 text-xs"
            onClick={handleReset}
          >
            Reset All
          </Button>
          <Button
            type="button"
            className="flex-1 h-9 text-xs font-bold bg-[var(--primary)] text-white"
            onClick={handleApply}
          >
            Apply Filters
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
