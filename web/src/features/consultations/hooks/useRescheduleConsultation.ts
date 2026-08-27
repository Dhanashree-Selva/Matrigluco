import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { consultationsApi } from "../api/consultations.api";
import { ConsultationUpdatePayload, ConsultationRecord } from "../types/consultation.types";
import { mapApiToConsultationRecord } from "../mappers/consultation.mapper";
import { ACCREDITED_CLINICIANS } from "../data/clinicians.data";
import { CONSULTATIONS_QUERY_KEYS } from "./useConsultations";

interface RescheduleParams {
  id: string;
  payload: ConsultationUpdatePayload;
}

export function useRescheduleConsultation() {
  const queryClient = useQueryClient();

  return useMutation<ConsultationRecord, Error, RescheduleParams>({
    mutationFn: async ({ id, payload }) => {
      const raw = await consultationsApi.updateConsultation(id, payload);
      return mapApiToConsultationRecord(raw, ACCREDITED_CLINICIANS);
    },
    onSuccess: (updatedRecord) => {
      queryClient.invalidateQueries({ queryKey: CONSULTATIONS_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["history"] });

      toast.success("Consultation Rescheduled", {
        description: `Your appointment has been moved to ${updatedRecord.fullDateTimeFormatted}.`,
      });
    },
    onError: (err) => {
      toast.error("Unable to reschedule consultation", {
        description: err.message || "Please select a different available slot.",
      });
    },
  });
}
