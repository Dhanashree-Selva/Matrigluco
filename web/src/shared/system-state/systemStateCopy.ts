import { SystemStateKind } from "../illustrations/system-states/system-state.types";

export interface SystemStateCopyConfig {
  codeLabel?: string;
  headline: string;
  description: string;
  primaryActionLabel: string;
  secondaryActionLabel?: string;
}

export const systemStateCopy: Record<SystemStateKind, SystemStateCopyConfig> = {
  "not-found": {
    codeLabel: "ERROR 404",
    headline: "This path doesn't exist",
    description:
      "We couldn't find the Matrigluco page you're looking for. Your account and health information haven't been changed.",
    primaryActionLabel: "Go to dashboard",
    secondaryActionLabel: "Go back",
  },
  "resource-unavailable": {
    codeLabel: "UNAVAILABLE",
    headline: "This resource isn't available",
    description:
      "It may no longer exist or may not be accessible from this account. Return to your health records to continue.",
    primaryActionLabel: "View health records",
    secondaryActionLabel: "Go back",
  },
  "access-restricted": {
    codeLabel: "ERROR 403",
    headline: "This area isn't available to your account",
    description:
      "You don't have access to this part of Matrigluco. Return to a workspace available to you.",
    primaryActionLabel: "Go to dashboard",
    secondaryActionLabel: "Go back",
  },
  "session-ended": {
    codeLabel: "SESSION ENDED",
    headline: "Your session has ended",
    description:
      "Sign in again to continue securely with your maternal health records and care timeline.",
    primaryActionLabel: "Sign in",
    secondaryActionLabel: "Go home",
  },
  "unexpected-error": {
    codeLabel: "ERROR 500",
    headline: "Something interrupted this page",
    description:
      "Matrigluco couldn't complete this request. Try again, or return to your workspace.",
    primaryActionLabel: "Try again",
    secondaryActionLabel: "Go to dashboard",
  },
  "service-unavailable": {
    codeLabel: "SERVICE PAUSED",
    headline: "Matrigluco is temporarily unavailable",
    description:
      "The service couldn't complete your request right now. Try again shortly.",
    primaryActionLabel: "Try again",
    secondaryActionLabel: "Go to dashboard",
  },
  offline: {
    codeLabel: "OFFLINE",
    headline: "You're offline",
    description:
      "Matrigluco can't reach the server right now. Reconnect to continue with current health data.",
    primaryActionLabel: "Check connection",
    secondaryActionLabel: "Go to dashboard",
  },
  maintenance: {
    codeLabel: "MAINTENANCE",
    headline: "System maintenance in progress",
    description:
      "Matrigluco is undergoing scheduled clinical platform updates. Services will resume shortly.",
    primaryActionLabel: "Refresh page",
    secondaryActionLabel: "Go home",
  },
  "feature-unavailable": {
    codeLabel: "MODULE DORMANT",
    headline: "This feature is currently unavailable",
    description:
      "This specific capability is resting. Your health tracking, risk assessments, lab reports, and consultations remain fully accessible.",
    primaryActionLabel: "Go to dashboard",
    secondaryActionLabel: "View timeline",
  },
  "rate-limited": {
    codeLabel: "RATE LIMIT",
    headline: "Too many requests",
    description:
      "Too many actions were received in a short interval. Please wait a brief moment before continuing.",
    primaryActionLabel: "Try again",
    secondaryActionLabel: "Go to dashboard",
  },
};
