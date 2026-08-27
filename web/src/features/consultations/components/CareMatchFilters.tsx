import React from "react";
import { ClinicianFilters } from "../hooks/useClinicians";
import { ConsultationModeType } from "../types/consultation.types";
import { Button, Input } from "../../../shared/ui";
import { AppIcon } from "../../../components/common/AppIcon";
import {
  Search01Icon,
  FilterIcon,
  Video01Icon,
  Message01Icon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons";

interface CareMatchFiltersProps {
  filters: ClinicianFilters;
  onFilterChange: (newFilters: ClinicianFilters) => void;
  specialties: string[];
}

export function CareMatchFilters({
  filters,
  onFilterChange,
  specialties,
}: CareMatchFiltersProps) {
  return (
    <div className="p-3.5 sm:p-4 rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-2xs space-y-3 mb-6">
      <div className="flex flex-col sm:flex-row items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1 w-full">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] pointer-events-none">
            <AppIcon icon={Search01Icon} size="sm" />
          </div>
          <Input
            type="search"
            placeholder="Search clinician name, specialty, or expertise..."
            value={filters.searchQuery || ""}
            onChange={(e) =>
              onFilterChange({ ...filters, searchQuery: e.target.value })
            }
            className="pl-9 h-9.5 text-xs rounded-xl bg-[var(--background)] border-[var(--border)] focus-visible:ring-[var(--primary)]"
          />
        </div>

        {/* Mode Filter Pills */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <Button
            type="button"
            variant={!filters.mode || filters.mode === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => onFilterChange({ ...filters, mode: "all" })}
            className={`h-8 px-2.5 text-xs rounded-lg font-semibold gap-1.5 ${
              !filters.mode || filters.mode === "all"
                ? "bg-[var(--primary)] text-white"
                : "border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--accent-soft)]"
            }`}
          >
            <AppIcon icon={UserGroupIcon} size="xxs" /> All Modes
          </Button>

          <Button
            type="button"
            variant={filters.mode === "video" ? "default" : "outline"}
            size="sm"
            onClick={() => onFilterChange({ ...filters, mode: "video" })}
            className={`h-8 px-2.5 text-xs rounded-lg font-semibold gap-1.5 ${
              filters.mode === "video"
                ? "bg-[var(--primary)] text-white"
                : "border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--accent-soft)]"
            }`}
          >
            <AppIcon icon={Video01Icon} size="xxs" /> Video
          </Button>

          <Button
            type="button"
            variant={filters.mode === "chat" ? "default" : "outline"}
            size="sm"
            onClick={() => onFilterChange({ ...filters, mode: "chat" })}
            className={`h-8 px-2.5 text-xs rounded-lg font-semibold gap-1.5 ${
              filters.mode === "chat"
                ? "bg-[var(--primary)] text-white"
                : "border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--accent-soft)]"
            }`}
          >
            <AppIcon icon={Message01Icon} size="xxs" /> Chat
          </Button>
        </div>
      </div>

      {/* Specialty Filter Chips */}
      {specialties.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1 pb-0.5 text-xs scrollbar-none">
          <span className="text-[10px] uppercase font-bold text-[var(--muted-foreground)] tracking-wider shrink-0 mr-1 flex items-center gap-1">
            <AppIcon icon={FilterIcon} size="xxs" /> Specialty:
          </span>

          <button
            type="button"
            onClick={() => onFilterChange({ ...filters, specialty: "all" })}
            className={`px-2.5 py-1 rounded-full text-xs font-medium shrink-0 transition-colors cursor-pointer ${
              !filters.specialty || filters.specialty === "all"
                ? "bg-[var(--primary)] text-white font-semibold"
                : "bg-[var(--accent-soft)]/50 text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            }`}
          >
            All Specialties
          </button>

          {specialties.map((spec) => {
            const isSelected = filters.specialty === spec;
            return (
              <button
                key={spec}
                type="button"
                onClick={() =>
                  onFilterChange({
                    ...filters,
                    specialty: isSelected ? "all" : spec,
                  })
                }
                className={`px-2.5 py-1 rounded-full text-xs font-medium shrink-0 transition-colors cursor-pointer ${
                  isSelected
                    ? "bg-[var(--primary)] text-white font-semibold shadow-2xs"
                    : "bg-[var(--accent-soft)]/50 text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                }`}
              >
                {spec}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
