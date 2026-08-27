import { routePaths } from "../../../app/route-paths";

/**
 * Safely resolves an internal application route for a notification's target resource.
 * Guarantees that only approved, whitelisted client routes are returned.
 * Prevents open redirects and ensures zero medical data leakage into URL query params.
 */
export function resolveNotificationTarget(
  resourceType?: string | null,
  resourceId?: string | null
): string | undefined {
  if (!resourceType) {
    return undefined;
  }

  const normalized = resourceType.toLowerCase().trim();

  switch (normalized) {
    case "report":
      return resourceId ? `/app/reports/${encodeURIComponent(resourceId)}` : routePaths.app.reports;

    case "consultation":
      return resourceId
        ? `/app/consultations/${encodeURIComponent(resourceId)}`
        : routePaths.app.consultations;

    case "assessment":
    case "risk_assessment":
      return routePaths.app.history;

    case "tracking":
    case "measurement":
    case "glucose":
      return routePaths.app.tracking;

    case "account":
    case "security":
    case "session":
      return routePaths.app.account.security;

    case "preferences":
      return routePaths.app.account.preferences;

    case "profile":
      return routePaths.app.account.profile;

    case "assistant":
      return routePaths.app.assistant;

    default:
      return undefined;
  }
}
