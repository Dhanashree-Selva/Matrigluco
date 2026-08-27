import { apiClient } from "../../../api/client";
import {
  LoginPayload,
  RegisterPayload,
  ForgotPasswordPayload,
  ResetPasswordPayload,
  VerifyEmailPayload,
  ResendVerificationPayload,
  TokenPair,
  MessageResponse,
  User,
} from "../types/auth.types";

export const authApi = {
  async login(payload: LoginPayload): Promise<TokenPair> {
    const response = await apiClient.post<TokenPair>("/auth/login", payload);
    return response.data;
  },

  async register(payload: RegisterPayload): Promise<TokenPair> {
    const response = await apiClient.post<TokenPair>("/auth/register", payload);
    return response.data;
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post("/auth/logout");
    } catch {
      // Ignore network errors on logout
    }
  },

  async forgotPassword(payload: ForgotPasswordPayload): Promise<MessageResponse> {
    const response = await apiClient.post<MessageResponse>("/auth/forgot-password", payload);
    return response.data;
  },

  async resetPassword(payload: ResetPasswordPayload): Promise<MessageResponse> {
    const response = await apiClient.post<MessageResponse>("/auth/reset-password", payload);
    return response.data;
  },

  async verifyEmail(payload: VerifyEmailPayload): Promise<MessageResponse> {
    const response = await apiClient.post<MessageResponse>("/auth/verify-email", payload);
    return response.data;
  },

  async resendVerification(payload: ResendVerificationPayload): Promise<MessageResponse> {
    const response = await apiClient.post<MessageResponse>("/auth/resend-verification", payload);
    return response.data;
  },

  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<User>("/auth/me");
    return response.data;
  },
};
