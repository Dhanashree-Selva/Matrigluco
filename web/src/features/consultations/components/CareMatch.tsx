import React, { useState } from "react";
import { useClinicians, ClinicianFilters } from "../hooks/useClinicians";
import { CareMatchFilters } from "./CareMatchFilters";
import { CareProfileRow } from "./CareProfileRow";
import { ConsultationEmptyState } from "./ConsultationEmptyState";

interface CareMatchProps {
  onSelectDoctor?: (clinicianId: string) => void;
  className?: string;
}

export function CareMatch({ onSelectDoctor, className = "" }: CareMatchProps) {
  const [filters, setFilters] = useState<ClinicianFilters>({
    specialty: "all",
    mode: "all",
    searchQuery: "",
  });

  const { clinicians, specialties, totalCount } = useClinicians(filters);

  return (
    <section aria-labelledby="care-match-heading" className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <h2
            id="care-match-heading"
            className="text-base sm:text-lg font-bold text-[var(--foreground)] tracking-tight"
          >
            Care Match
          </h2>
          <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
            Connect with certified obstetricians, endocrinologists, and maternal nutritionists.
          </p>
        </div>

        <span className="text-xs font-semibold text-[var(--muted-foreground)]">
          {clinicians.length} of {totalCount} Specialists
        </span>
      </div>

      {/* Filter Surface */}
      <CareMatchFilters
        filters={filters}
        onFilterChange={setFilters}
        specialties={specialties}
      />

      {/* Clinician Rows List */}
      {clinicians.length > 0 ? (
        <div className="space-y-3">
          {clinicians.map((clinician) => (
            <CareProfileRow
              key={clinician.id}
              clinician={clinician}
              onBook={onSelectDoctor}
            />
          ))}
        </div>
      ) : (
        <ConsultationEmptyState
          title="No clinicians match your search"
          description="Try broadening your specialty filter or clear your search term to view all available accredited providers."
          onAction={() =>
            setFilters({ specialty: "all", mode: "all", searchQuery: "" })
          }
          actionLabel="Reset Filters"
        />
      )}
    </section>
  );
}
