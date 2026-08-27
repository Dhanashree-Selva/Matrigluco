import { apiRequest } from "./http/client";
import { tokenStore } from "./http/token-store";
import {
  AuthResponse,
  LoginPayload,
  RegisterPayload,
  UserProfile,
} from "../types/auth";

export const authService = {
  async login(payload: LoginPayload, signal?: AbortSignal): Promise<AuthResponse> {
    const data = await apiRequest<AuthResponse>({
      url: "/auth/login",
      method: "POST",
      data: payload,
      signal,
    });
    if (data.access_token) {
      tokenStore.setAccessToken(data.access_token);
      tokenStore.setRefreshToken(data.refresh_token);
      tokenStore.setUser(data.user);
    }
    return data;
  },

  async register(payload: RegisterPayload, signal?: AbortSignal): Promise<AuthResponse> {
    const data = await apiRequest<AuthResponse>({
      url: "/auth/register",
      method: "POST",
      data: payload,
      signal,
    });
    if (data.access_token) {
      tokenStore.setAccessToken(data.access_token);
      tokenStore.setRefreshToken(data.refresh_token);
      tokenStore.setUser(data.user);
    }
    return data;
  },

  async getCurrentUser(signal?: AbortSignal): Promise<UserProfile | null> {
    try {
      const user = await apiRequest<UserProfile>({
        url: "/auth/me",
        method: "GET",
        signal,
      });
      tokenStore.setUser(user);
      return user;
    } catch {
      return tokenStore.getUser();
    }
  },

  async logout(signal?: AbortSignal): Promise<void> {
    try {
      await apiRequest<void>({
        url: "/auth/logout",
        method: "POST",
        signal,
      });
    } finally {
      tokenStore.clear();
    }
  },
};
