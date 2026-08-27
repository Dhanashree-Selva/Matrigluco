import { useQuery } from "@tanstack/react-query";
import { consultationsApi } from "../api/consultations.api";
import { mapApiToConsultationRecord } from "../mappers/consultation.mapper";
import { ACCREDITED_CLINICIANS } from "../data/clinicians.data";
import { ConsultationRecord } from "../types/consultation.types";

export const CONSULTATIONS_QUERY_KEYS = {
  all: ["consultations"] as const,
  lists: () => [...CONSULTATIONS_QUERY_KEYS.all, "list"] as const,
  list: (limit?: number) => [...CONSULTATIONS_QUERY_KEYS.lists(), { limit }] as const,
  details: () => [...CONSULTATIONS_QUERY_KEYS.all, "detail"] as const,
  detail: (id: string) => [...CONSULTATIONS_QUERY_KEYS.details(), id] as const,
  clinicians: ["clinicians"] as const,
  clinician: (id: string) => [...CONSULTATIONS_QUERY_KEYS.clinicians, id] as const,
  availability: (clinicianId: string, date: string) =>
    [...CONSULTATIONS_QUERY_KEYS.all, "availability", clinicianId, date] as const,
};

export function useConsultations(limit: number = 50) {
  return useQuery<ConsultationRecord[]>({
    queryKey: CONSULTATIONS_QUERY_KEYS.list(limit),
    queryFn: async ({ signal }) => {
      const rawList = await consultationsApi.getConsultations(limit, signal);
      return rawList.map((item) => mapApiToConsultationRecord(item, ACCREDITED_CLINICIANS));
    },
    staleTime: 1000 * 30, // 30 seconds
  });
}
