import { useQuery } from "@tanstack/react-query";
import { consultationsApi } from "../api/consultations.api";
import { mapApiToConsultationRecord } from "../mappers/consultation.mapper";
import { ACCREDITED_CLINICIANS } from "../data/clinicians.data";
import { ConsultationRecord } from "../types/consultation.types";
import { CONSULTATIONS_QUERY_KEYS } from "./useConsultations";

export function useConsultation(id?: string | null) {
  return useQuery<ConsultationRecord>({
    queryKey: id ? CONSULTATIONS_QUERY_KEYS.detail(id) : ["consultations", "detail", "empty"],
    queryFn: async ({ signal }) => {
      if (!id) throw new Error("Consultation ID is required");
      const raw = await consultationsApi.getConsultation(id, signal);
      return mapApiToConsultationRecord(raw, ACCREDITED_CLINICIANS);
    },
    enabled: Boolean(id),
    staleTime: 1000 * 30,
  });
}
