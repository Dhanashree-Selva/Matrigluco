import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from "axios";
import { tokenStore } from "./token-store";
import { normalizeApiError } from "./errors";
import { config } from "../../app/config";

const BASE_URL = config.apiBaseUrl;

export const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor: Attach Bearer Token
apiClient.interceptors.request.use(
  (reqConfig: InternalAxiosRequestConfig) => {
    const token = tokenStore.getAccessToken();
    if (token && reqConfig.headers) {
      reqConfig.headers.Authorization = `Bearer ${token}`;
    }
    return reqConfig;
  },
  (error) => Promise.reject(normalizeApiError(error))
);

// Single-Flight 401 Refresh Queue
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Response Interceptor: 401 Token Refresh & Envelope Extraction
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (
        originalRequest.url?.includes("/auth/login") ||
        originalRequest.url?.includes("/auth/register") ||
        originalRequest.url?.includes("/auth/refresh")
      ) {
        return Promise.reject(normalizeApiError(error));
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(normalizeApiError(err)));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = tokenStore.getRefreshToken();
      if (!refreshToken) {
        tokenStore.clear();
        isRefreshing = false;
        return Promise.reject(normalizeApiError(error));
      }

      try {
        const refreshResponse = await axios.post(`${BASE_URL}/auth/refresh`, {
          refresh_token: refreshToken,
        });

        const newAccessToken =
          refreshResponse.data?.data?.access_token ||
          refreshResponse.data?.access_token;
        const newRefreshToken =
          refreshResponse.data?.data?.refresh_token ||
          refreshResponse.data?.refresh_token;

        if (newAccessToken) {
          tokenStore.setAccessToken(newAccessToken);
          if (newRefreshToken) {
            tokenStore.setRefreshToken(newRefreshToken);
          }

          apiClient.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

          processQueue(null, newAccessToken);
          return apiClient(originalRequest);
        } else {
          throw new Error("No access token returned from refresh endpoint.");
        }
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        tokenStore.clear();
        return Promise.reject(normalizeApiError(refreshErr));
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(normalizeApiError(error));
  }
);

// Generic Request Helper
export async function apiRequest<T>(
  requestConfig: AxiosRequestConfig
): Promise<T> {
  try {
    const response = await apiClient.request<T>(requestConfig);
    const data = response.data as { data?: T } | T;
    // Unwrap { data: T } envelope if present
    if (data && typeof data === "object" && "data" in data) {
      return (data as { data: T }).data;
    }
    return data as T;
  } catch (err) {
    throw normalizeApiError(err);
  }
}
