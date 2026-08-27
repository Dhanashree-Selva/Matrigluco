import { apiRequest } from "./http/client";
import { UserProfile } from "../types/auth";

export const profileService = {
  async getProfile(signal?: AbortSignal): Promise<UserProfile> {
    return apiRequest<UserProfile>({
      url: "/profiles/me",
      method: "GET",
      signal,
    });
  },

  async updateProfile(
    updates: Partial<UserProfile>,
    signal?: AbortSignal
  ): Promise<UserProfile> {
    return apiRequest<UserProfile>({
      url: "/profiles/me",
      method: "PATCH",
      data: updates,
      signal,
    });
  },
};
