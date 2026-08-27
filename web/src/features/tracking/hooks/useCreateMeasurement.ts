import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../../../query/keys";
import { toast } from "../../../shared/ui";
import { trackingApi } from "../api/tracking.api";
import { MeasurementFormValues } from "../schemas/tracking.schema";
import { METRIC_DEFINITIONS } from "../config/metric-definitions";

export function useCreateMeasurement(onSuccessCallback?: () => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: MeasurementFormValues) => {
      const config = METRIC_DEFINITIONS[values.metric_type];
      const primary = Number(values.value_primary);
      const secondary =
        values.metric_type === "blood_pressure" && values.value_secondary
          ? Number(values.value_secondary)
          : null;

      return trackingApi.createMeasurement({
        metric_type: values.metric_type,
        value_primary: primary,
        value_secondary: secondary,
        unit: config.unit,
        measured_at: values.measured_at || new Date().toISOString(),
        notes: values.notes?.trim() || null,
      });
    },
    onSuccess: async (saved) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.health.all });
      await queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
      await queryClient.refetchQueries({ queryKey: queryKeys.health.all, type: "active" });
      await queryClient.refetchQueries({ queryKey: queryKeys.dashboard.all, type: "active" });

      const config = METRIC_DEFINITIONS[saved.metric_type as keyof typeof METRIC_DEFINITIONS];
      const valStr =
        saved.metric_type === "blood_pressure" && saved.value_secondary
          ? `${Math.round(saved.value_primary)} / ${Math.round(saved.value_secondary)}`
          : `${saved.value_primary}`;

      toast.success("Reading recorded", {
        description: `${config?.shortLabel || saved.metric_type} (${valStr} ${saved.unit}) saved to your timeline.`,
      });

      if (onSuccessCallback) {
        onSuccessCallback();
      }
    },
    onError: (err: any) => {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Could not save reading. Please review the values and try again.";
      toast.error("Unable to record reading", {
        description: msg,
      });
    },
  });
}
