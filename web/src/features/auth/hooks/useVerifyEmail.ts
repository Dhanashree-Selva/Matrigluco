import { useMutation } from "@tanstack/react-query";
import { authApi } from "../api/auth.api";
import {
  VerifyEmailPayload,
  ResendVerificationPayload,
  MessageResponse,
} from "../types/auth.types";

export function useVerifyEmail() {
  return useMutation<MessageResponse, Error, VerifyEmailPayload>({
    mutationFn: async (payload: VerifyEmailPayload) => {
      return authApi.verifyEmail(payload);
    },
  });
}

export function useResendVerification() {
  return useMutation<MessageResponse, Error, ResendVerificationPayload>({
    mutationFn: async (payload: ResendVerificationPayload) => {
      return authApi.resendVerification(payload);
    },
  });
}
