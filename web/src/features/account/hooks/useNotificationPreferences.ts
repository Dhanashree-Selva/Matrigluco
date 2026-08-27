import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { accountApi } from "../api/account.api";
import { mapApiToNotificationPreferences } from "../mappers/account.mapper";
import {
  NotificationPreferencesRecord,
  NotificationPreferencesUpdatePayload,
} from "../types/account.types";
import { ACCOUNT_QUERY_KEYS } from "./useProfile";

export function useNotificationPreferences() {
  return useQuery<NotificationPreferencesRecord>({
    queryKey: ACCOUNT_QUERY_KEYS.preferences(),
    queryFn: async ({ signal }) => {
      const raw = await accountApi.getNotificationPreferences(signal);
      return mapApiToNotificationPreferences(raw);
    },
    staleTime: 1000 * 60,
  });
}

export function useUpdateNotificationPreferences() {
  const queryClient = useQueryClient();

  return useMutation<
    NotificationPreferencesRecord,
    Error,
    NotificationPreferencesUpdatePayload
  >({
    mutationFn: async (payload) => {
      const raw = await accountApi.updateNotificationPreferences(payload);
      return mapApiToNotificationPreferences(raw);
    },
    onSuccess: (updatedPrefs) => {
      queryClient.setQueryData(ACCOUNT_QUERY_KEYS.preferences(), updatedPrefs);
      toast.success("Preferences Saved", {
        description: "Your notification settings have been updated.",
      });
    },
    onError: (err) => {
      queryClient.invalidateQueries({ queryKey: ACCOUNT_QUERY_KEYS.preferences() });
      toast.error("Unable to update preferences", {
        description: err.message || "Failed to update notification settings.",
      });
    },
  });
}
