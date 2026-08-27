import { apiRequest } from "../../../services/http/client";
import {
  UserProfileUpdatePayload,
  NotificationPreferencesUpdatePayload,
} from "../types/account.types";
import {
  RawUserApiItem,
  RawSessionApiItem,
  RawNotificationPreferencesApiItem,
} from "../mappers/account.mapper";
import { ChangePasswordFormValues } from "../schemas/security.schema";

export const accountApi = {
  /**
   * Retrieves authenticated user's full profile and care context.
   */
  async getProfile(signal?: AbortSignal): Promise<RawUserApiItem> {
    return apiRequest<RawUserApiItem>({
      url: "/users/me",
      method: "GET",
      signal,
    });
  },

  /**
   * Updates authenticated user's profile and care context.
   */
  async updateProfile(
    payload: UserProfileUpdatePayload,
    signal?: AbortSignal
  ): Promise<RawUserApiItem> {
    return apiRequest<RawUserApiItem>({
      url: "/users/me",
      method: "PATCH",
      data: payload,
      signal,
    });
  },

  /**
   * Retrieves current notification preferences.
   */
  async getNotificationPreferences(
    signal?: AbortSignal
  ): Promise<RawNotificationPreferencesApiItem> {
    return apiRequest<RawNotificationPreferencesApiItem>({
      url: "/notifications/preferences",
      method: "GET",
      signal,
    });
  },

  /**
   * Updates notification preferences.
   */
  async updateNotificationPreferences(
    payload: NotificationPreferencesUpdatePayload,
    signal?: AbortSignal
  ): Promise<RawNotificationPreferencesApiItem> {
    return apiRequest<RawNotificationPreferencesApiItem>({
      url: "/notifications/preferences",
      method: "PATCH",
      data: payload,
      signal,
    });
  },

  /**
   * Lists all active login sessions for the authenticated user.
   */
  async getSessions(
    signal?: AbortSignal
  ): Promise<{ sessions: RawSessionApiItem[]; total: number }> {
    return apiRequest<{ sessions: RawSessionApiItem[]; total: number }>({
      url: "/auth/sessions",
      method: "GET",
      signal,
    });
  },

  /**
   * Revokes a specific active session by public UUID.
   */
  async revokeSession(sessionId: string, signal?: AbortSignal): Promise<void> {
    return apiRequest<void>({
      url: `/auth/sessions/${sessionId}`,
      method: "DELETE",
      signal,
    });
  },

  /**
   * Signs out of all other active sessions except current.
   */
  async signOutOtherSessions(signal?: AbortSignal): Promise<void> {
    return apiRequest<void>({
      url: "/auth/logout-all",
      method: "POST",
      signal,
    });
  },

  /**
   * Changes account password and rotates sessions.
   */
  async changePassword(
    payload: ChangePasswordFormValues,
    signal?: AbortSignal
  ): Promise<{ message: string }> {
    return apiRequest<{ message: string }>({
      url: "/auth/change-password",
      method: "POST",
      data: {
        current_password: payload.currentPassword,
        new_password: payload.newPassword,
      },
      signal,
    });
  },

  /**
   * Resends email verification link for unverified accounts.
   */
  async resendVerification(
    email: string,
    signal?: AbortSignal
  ): Promise<{ message: string }> {
    return apiRequest<{ message: string }>({
      url: "/auth/resend-verification",
      method: "POST",
      data: { email },
      signal,
    });
  },
};
