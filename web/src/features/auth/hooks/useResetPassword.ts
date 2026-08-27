import { useMutation } from "@tanstack/react-query";
import { authApi } from "../api/auth.api";
import { ResetPasswordPayload, MessageResponse } from "../types/auth.types";

export function useResetPassword() {
  return useMutation<MessageResponse, Error, ResetPasswordPayload>({
    mutationFn: async (payload: ResetPasswordPayload) => {
      return authApi.resetPassword(payload);
    },
  });
}
