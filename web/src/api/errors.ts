import { AxiosError } from "axios";
import { AppApiError, ApiErrorEnvelope } from "../types/api";

export function normalizeApiError(error: unknown): AppApiError {
  if (error instanceof AppApiError) {
    return error;
  }

  if (error && typeof error === "object" && "isAxiosError" in error) {
    const axiosError = error as AxiosError<ApiErrorEnvelope>;
    const status = axiosError.response?.status || 500;
    const data = axiosError.response?.data;
    const requestId = data?.meta?.request_id;

    if (data?.error) {
      return new AppApiError(
        data.error.message || "An unexpected server error occurred.",
        data.error.code || `HTTP_${status}`,
        status,
        data.error.details,
        requestId
      );
    }

    if (axiosError.code === "ECONNABORTED") {
      return new AppApiError(
        "Request timed out. Please check your network connection.",
        "TIMEOUT",
        408,
        null,
        requestId
      );
    }

    if (!axiosError.response) {
      return new AppApiError(
        "Unable to connect to server. Please verify backend connectivity.",
        "NETWORK_ERROR",
        0,
        null,
        requestId
      );
    }

    return new AppApiError(
      axiosError.message || `Request failed with status ${status}`,
      `HTTP_${status}`,
      status,
      null,
      requestId
    );
  }

  if (error instanceof Error) {
    return new AppApiError(error.message, "GENERIC_ERROR", 500);
  }

  return new AppApiError("An unknown error occurred.", "UNKNOWN_ERROR", 500);
}
