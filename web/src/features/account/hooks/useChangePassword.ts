import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { accountApi } from "../api/account.api";
import { ChangePasswordFormValues } from "../schemas/security.schema";
import { ACCOUNT_QUERY_KEYS } from "./useProfile";

export function useChangePassword() {
  const queryClient = useQueryClient();

  return useMutation<{ message: string }, Error, ChangePasswordFormValues>({
    mutationFn: async (payload) => {
      return accountApi.changePassword(payload);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ACCOUNT_QUERY_KEYS.sessions() });
      toast.success("Password Changed Successfully", {
        description: data.message || "Your password has been updated and all other sessions revoked.",
      });
    },
    onError: (err) => {
      toast.error("Password Change Failed", {
        description: err.message || "Please verify your current password.",
      });
    },
  });
}

export function useResendVerification() {
  return useMutation<{ message: string }, Error, string>({
    mutationFn: async (email: string) => {
      return accountApi.resendVerification(email);
    },
    onSuccess: (data) => {
      toast.success("Verification Email Sent", {
        description: data.message || "Please check your inbox for instructions.",
      });
    },
    onError: (err) => {
      toast.error("Verification Request Failed", {
        description: err.message || "Unable to send verification link.",
      });
    },
  });
}
