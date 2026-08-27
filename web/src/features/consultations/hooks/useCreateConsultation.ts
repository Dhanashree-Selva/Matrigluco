import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { consultationsApi } from "../api/consultations.api";
import { ConsultationCreatePayload, ConsultationRecord } from "../types/consultation.types";
import { mapApiToConsultationRecord } from "../mappers/consultation.mapper";
import { ACCREDITED_CLINICIANS } from "../data/clinicians.data";
import { CONSULTATIONS_QUERY_KEYS } from "./useConsultations";

export function useCreateConsultation() {
  const queryClient = useQueryClient();

  return useMutation<ConsultationRecord, Error, ConsultationCreatePayload>({
    mutationFn: async (payload) => {
      const raw = await consultationsApi.bookConsultation(payload);
      return mapApiToConsultationRecord(raw, ACCREDITED_CLINICIANS);
    },
    onSuccess: (newRecord) => {
      queryClient.invalidateQueries({ queryKey: CONSULTATIONS_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["history"] });

      toast.success("Consultation Scheduled", {
        description: `Your appointment with ${newRecord.doctorName} on ${newRecord.fullDateTimeFormatted} has been confirmed.`,
      });
    },
    onError: (err) => {
      toast.error("Appointment could not be scheduled", {
        description: err.message || "Please check your network and selected slot.",
      });
    },
  });
}
