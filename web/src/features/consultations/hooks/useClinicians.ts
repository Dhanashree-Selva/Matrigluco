import { useMemo } from "react";
import { ACCREDITED_CLINICIANS } from "../data/clinicians.data";
import { ClinicianProfile, ConsultationModeType } from "../types/consultation.types";

export interface ClinicianFilters {
  specialty?: string;
  mode?: ConsultationModeType | "all";
  searchQuery?: string;
}

export function useClinicians(filters?: ClinicianFilters) {
  const clinicians = useMemo(() => {
    let list = [...ACCREDITED_CLINICIANS];

    if (filters?.specialty && filters.specialty !== "all") {
      list = list.filter((c) => c.specialty.toLowerCase() === filters.specialty?.toLowerCase());
    }

    if (filters?.mode && filters.mode !== "all") {
      list = list.filter((c) => c.supportedModes.includes(filters.mode as ConsultationModeType));
    }

    if (filters?.searchQuery?.trim()) {
      const q = filters.searchQuery.toLowerCase().trim();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.specialty.toLowerCase().includes(q) ||
          c.title.toLowerCase().includes(q)
      );
    }

    return list;
  }, [filters?.specialty, filters?.mode, filters?.searchQuery]);

  const specialties = useMemo(() => {
    return Array.from(new Set(ACCREDITED_CLINICIANS.map((c) => c.specialty)));
  }, []);

  return {
    clinicians,
    specialties,
    totalCount: ACCREDITED_CLINICIANS.length,
  };
}

export function useClinician(idOrName?: string | null): ClinicianProfile | undefined {
  return useMemo(() => {
    if (!idOrName) return undefined;
    const target = idOrName.toLowerCase().trim();
    return ACCREDITED_CLINICIANS.find(
      (c) =>
        c.id.toLowerCase() === target ||
        c.name.toLowerCase() === target ||
        target.includes(c.name.toLowerCase()) ||
        c.name.toLowerCase().includes(target)
    );
  }, [idOrName]);
}
