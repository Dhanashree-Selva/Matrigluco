import { AppApiError } from "../../types/api";
import { NormalizedAppError } from "./error.types";
import { systemStateCopy } from "../../shared/system-state/systemStateCopy";

export function normalizeAppError(error: unknown): NormalizedAppError {
  // 1. Offline Check via navigator if disconnected
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    const copy = systemStateCopy["offline"];
    return {
      kind: "offline",
      headline: copy.headline,
      description: copy.description,
      statusCode: 0,
      isRecoverable: true,
      canRetry: true,
    };
  }

  // 2. Typed AppApiError or Axios error
  if (error instanceof AppApiError) {
    const status = error.status;
    const reqId = error.requestId || null;

    if (status === 404) {
      const copy = systemStateCopy["resource-unavailable"];
      return {
        kind: "resource-unavailable",
        headline: copy.headline,
        description: copy.description,
        statusCode: 404,
        requestId: reqId,
        isRecoverable: false,
        canRetry: true,
      };
    }

    if (status === 403) {
      const copy = systemStateCopy["access-restricted"];
      return {
        kind: "access-restricted",
        headline: copy.headline,
        description: copy.description,
        statusCode: 403,
        requestId: reqId,
        isRecoverable: false,
        canRetry: false,
      };
    }

    if (status === 401) {
      const copy = systemStateCopy["session-ended"];
      return {
        kind: "session-ended",
        headline: copy.headline,
        description: copy.description,
        statusCode: 401,
        requestId: reqId,
        isRecoverable: false,
        canRetry: false,
      };
    }

    if (status === 429) {
      const copy = systemStateCopy["rate-limited"];
      return {
        kind: "rate-limited",
        headline: copy.headline,
        description: copy.description,
        statusCode: 429,
        requestId: reqId,
        isRecoverable: true,
        canRetry: true,
      };
    }

    if (status === 502 || status === 503) {
      const copy = systemStateCopy["service-unavailable"];
      return {
        kind: "service-unavailable",
        headline: copy.headline,
        description: copy.description,
        statusCode: status,
        requestId: reqId,
        isRecoverable: true,
        canRetry: true,
      };
    }

    if (status === 0 || error.code === "NETWORK_ERROR" || error.code === "TIMEOUT") {
      const copy = systemStateCopy["offline"];
      return {
        kind: "offline",
        headline: copy.headline,
        description: copy.description,
        statusCode: status,
        requestId: reqId,
        isRecoverable: true,
        canRetry: true,
      };
    }

    // Default 500 or other API errors
    const copy = systemStateCopy["unexpected-error"];
    return {
      kind: "unexpected-error",
      headline: copy.headline,
      description: copy.description,
      statusCode: status,
      requestId: reqId,
      isRecoverable: true,
      canRetry: true,
    };
  }

  // 3. Standard JS Error
  if (error instanceof Error) {
    const copy = systemStateCopy["unexpected-error"];
    return {
      kind: "unexpected-error",
      headline: copy.headline,
      description: copy.description,
      statusCode: 500,
      isRecoverable: true,
      canRetry: true,
    };
  }

  // 4. Fallback unknown error
  const copy = systemStateCopy["unexpected-error"];
  return {
    kind: "unexpected-error",
    headline: copy.headline,
    description: copy.description,
    statusCode: 500,
    isRecoverable: true,
    canRetry: true,
  };
}
