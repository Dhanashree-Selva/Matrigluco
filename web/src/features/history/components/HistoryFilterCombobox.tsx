import { useState, useRef, useEffect } from "react";
import {
  Cancel01Icon,
  FilterIcon,
  Tick02Icon,
  ArrowDown01Icon,
} from "@hugeicons/core-free-icons";
import { AppIcon } from "../../../components/common/AppIcon";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  Button,
} from "../../../shared/ui";
import { HistoryEventType } from "../types/history.types";
import {
  HISTORY_SOURCE_CONFIG,
  ALL_HISTORY_SOURCES,
} from "../config/history-sources.config";

interface HistoryFilterComboboxProps {
  selectedTypes: HistoryEventType[];
  onTypesChange: (types: HistoryEventType[]) => void;
  eventCounts?: Record<string, number>;
}

export function HistoryFilterCombobox({
  selectedTypes,
  onTypesChange,
  eventCounts = {},
}: HistoryFilterComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const isAllSelected =
    selectedTypes.length === ALL_HISTORY_SOURCES.length ||
    selectedTypes.length === 0;

  const toggleType = (type: HistoryEventType) => {
    if (selectedTypes.includes(type)) {
      const next = selectedTypes.filter((t) => t !== type);
      onTypesChange(next.length === 0 ? [] : next);
    } else {
      onTypesChange([...selectedTypes, type]);
    }
  };

  const removeChip = (e: React.MouseEvent, type: HistoryEventType) => {
    e.stopPropagation();
    const next = selectedTypes.filter((t) => t !== type);
    onTypesChange(next.length === 0 ? [] : next);
  };

  const selectAll = () => {
    onTypesChange(ALL_HISTORY_SOURCES);
  };

  const clearAll = () => {
    onTypesChange([]);
  };

  const filteredSources = ALL_HISTORY_SOURCES.filter((type) => {
    const meta = HISTORY_SOURCE_CONFIG[type];
    return (
      meta.label.toLowerCase().includes(search.toLowerCase()) ||
      meta.pluralLabel.toLowerCase().includes(search.toLowerCase()) ||
      meta.description.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <div
          role="button"
          aria-label="Filter history sources"
          tabIndex={0}
          className="min-h-8 w-full sm:w-auto min-w-[240px] max-w-md flex flex-wrap items-center gap-1.5 px-2.5 py-1 rounded-md bg-[var(--card)] border border-[var(--border)] text-xs cursor-pointer shadow-2xs hover:border-[var(--primary)]/40 transition-colors select-none"
        >
          <AppIcon icon={FilterIcon} size="xs" className="text-[var(--primary)] shrink-0 mr-0.5" />

          {isAllSelected ? (
            <span className="text-xs font-semibold text-[var(--foreground)]">
              All Sources ({ALL_HISTORY_SOURCES.length})
            </span>
          ) : selectedTypes.length === 0 ? (
            <span className="text-xs text-[var(--muted-foreground)]">
              No sources selected
            </span>
          ) : (
            <div className="flex flex-wrap items-center gap-1">
              {selectedTypes.map((type) => {
                const meta = HISTORY_SOURCE_CONFIG[type];
                return (
                  <span
                    key={type}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm bg-[var(--accent-soft)] text-[var(--primary)] text-[11px] font-bold border border-[var(--primary)]/20"
                  >
                    <AppIcon icon={meta.icon} size="xs" />
                    <span>{meta.pluralLabel}</span>
                    <button
                      type="button"
                      onClick={(e) => removeChip(e, type)}
                      className="hover:opacity-75 focus:outline-none p-0.5"
                      aria-label={`Remove ${meta.label} filter`}
                    >
                      <AppIcon icon={Cancel01Icon} size="xs" />
                    </button>
                  </span>
                );
              })}
            </div>
          )}

          <AppIcon
            icon={ArrowDown01Icon}
            size="xs"
            className="text-[var(--muted-foreground)] ml-auto shrink-0"
          />
        </div>
      </PopoverTrigger>

      <PopoverContent
        position="popper"
        sideOffset={6}
        align="start"
        className="w-[280px] p-2 bg-[var(--card)] border border-[var(--border)] shadow-2xl rounded-md space-y-2 text-xs"
      >
        {/* Search input */}
        <div className="px-1">
          <input
            ref={inputRef}
            type="text"
            placeholder="Search history sources..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-7 px-2 text-xs bg-[var(--surface-soft)] border border-[var(--border)] rounded-md text-[var(--foreground)] focus:border-[var(--primary)] focus:outline-none"
          />
        </div>

        {/* Source List */}
        <div className="space-y-0.5 max-h-56 overflow-y-auto pr-1">
          {filteredSources.map((type) => {
            const meta = HISTORY_SOURCE_CONFIG[type];
            const isChecked = selectedTypes.includes(type) || isAllSelected;
            const count = eventCounts[type] ?? 0;

            return (
              <button
                key={type}
                type="button"
                onClick={() => toggleType(type)}
                className={`w-full flex items-center justify-between px-2 py-1.5 rounded-sm text-left transition-colors ${
                  isChecked
                    ? "bg-[var(--accent-soft)]/50 text-[var(--foreground)]"
                    : "hover:bg-[var(--surface-soft)] text-[var(--muted-foreground)]"
                }`}
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`w-4 h-4 rounded-xs flex items-center justify-center border transition-colors ${
                      isChecked
                        ? "bg-[var(--primary)] border-[var(--primary)] text-white"
                        : "border-[var(--border)] bg-[var(--card)]"
                    }`}
                  >
                    {isChecked && <AppIcon icon={Tick02Icon} size="xs" />}
                  </div>
                  <AppIcon icon={meta.icon} size="xs" className={meta.colorClass} />
                  <span className="font-semibold">{meta.pluralLabel}</span>
                </div>

                {count > 0 && (
                  <span className="text-[10px] font-mono text-[var(--muted-foreground)]">
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Footer actions */}
        <div className="pt-1.5 border-t border-[var(--border-subtle)] flex items-center justify-between text-[11px]">
          <Button
            type="button"
            variant="ghost"
            size="xs"
            onClick={selectAll}
            className="h-6 px-1.5 text-[10px] font-bold text-[var(--primary)]"
          >
            Select All
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="xs"
            onClick={clearAll}
            className="h-6 px-1.5 text-[10px] font-bold text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          >
            Clear
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
