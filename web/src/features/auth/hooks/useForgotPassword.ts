import { useMutation } from "@tanstack/react-query";
import { authApi } from "../api/auth.api";
import { ForgotPasswordPayload, MessageResponse } from "../types/auth.types";

export function useForgotPassword() {
  return useMutation<MessageResponse, Error, ForgotPasswordPayload>({
    mutationFn: async (payload: ForgotPasswordPayload) => {
      return authApi.forgotPassword(payload);
    },
  });
}
