import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { accountApi } from "../api/account.api";
import { mapApiToAccountUser } from "../mappers/account.mapper";
import { AccountUser, UserProfileUpdatePayload } from "../types/account.types";
import { useAuth } from "../../../app/providers/AuthProvider";

export const ACCOUNT_QUERY_KEYS = {
  all: ["account"] as const,
  profile: () => [...ACCOUNT_QUERY_KEYS.all, "profile"] as const,
  preferences: () => [...ACCOUNT_QUERY_KEYS.all, "preferences"] as const,
  sessions: () => [...ACCOUNT_QUERY_KEYS.all, "sessions"] as const,
  aiConsent: () => [...ACCOUNT_QUERY_KEYS.all, "ai-consent"] as const,
};

export function useProfile() {
  return useQuery<AccountUser>({
    queryKey: ACCOUNT_QUERY_KEYS.profile(),
    queryFn: async ({ signal }) => {
      const raw = await accountApi.getProfile(signal);
      return mapApiToAccountUser(raw);
    },
    staleTime: 1000 * 60, // 1 minute
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const { refreshUser } = useAuth();

  return useMutation<AccountUser, Error, UserProfileUpdatePayload>({
    mutationFn: async (payload) => {
      const raw = await accountApi.updateProfile(payload);
      return mapApiToAccountUser(raw);
    },
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(ACCOUNT_QUERY_KEYS.profile(), updatedUser);
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      refreshUser?.();

      toast.success("Profile Updated", {
        description: "Your identity and care context changes have been saved.",
      });
    },
    onError: (err) => {
      toast.error("Unable to update profile", {
        description: err.message || "Please check your inputs and try again.",
      });
    },
  });
}
