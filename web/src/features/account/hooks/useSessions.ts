import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { accountApi } from "../api/account.api";
import { mapApiToSessionRecord } from "../mappers/account.mapper";
import { SessionRecord } from "../types/account.types";
import { ACCOUNT_QUERY_KEYS } from "./useProfile";

export function useSessions() {
  return useQuery<SessionRecord[]>({
    queryKey: ACCOUNT_QUERY_KEYS.sessions(),
    queryFn: async ({ signal }) => {
      const res = await accountApi.getSessions(signal);
      const items = res?.sessions || (Array.isArray(res) ? res : []);
      return items.map(mapApiToSessionRecord);
    },
    staleTime: 1000 * 30, // 30 seconds
  });
}

export function useRevokeSession() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (sessionId: string) => {
      await accountApi.revokeSession(sessionId);
    },
    onSuccess: (_, sessionId) => {
      queryClient.setQueryData<SessionRecord[]>(
        ACCOUNT_QUERY_KEYS.sessions(),
        (old) => (old ? old.filter((s) => s.id !== sessionId && s.publicId !== sessionId) : [])
      );
      toast.success("Session Signed Out", {
        description: "The selected device session has been revoked.",
      });
    },
    onError: (err) => {
      queryClient.invalidateQueries({ queryKey: ACCOUNT_QUERY_KEYS.sessions() });
      toast.error("Unable to sign out session", {
        description: err.message || "Failed to revoke session.",
      });
    },
  });
}

export function useSignOutOtherSessions() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, void>({
    mutationFn: async () => {
      await accountApi.signOutOtherSessions();
    },
    onSuccess: () => {
      queryClient.setQueryData<SessionRecord[]>(
        ACCOUNT_QUERY_KEYS.sessions(),
        (old) => (old ? old.filter((s) => s.isCurrent) : [])
      );
      toast.success("Other Sessions Signed Out", {
        description: "All other devices have been logged out. Your current session remains active.",
      });
    },
    onError: (err) => {
      queryClient.invalidateQueries({ queryKey: ACCOUNT_QUERY_KEYS.sessions() });
      toast.error("Unable to sign out other sessions", {
        description: err.message || "Failed to revoke other sessions.",
      });
    },
  });
}
