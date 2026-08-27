import { routePaths } from "./route-paths";

/**
 * Validates and sanitizes internal application redirect paths.
 * Prevents open-redirect attacks by ensuring the destination is an allowed internal path.
 */
export function getSafeRedirectPath(
  rawPath: string | null | undefined,
  fallback: string = routePaths.app.dashboard
): string {
  if (!rawPath || typeof rawPath !== "string") {
    return fallback;
  }

  // Trim whitespace
  const trimmed = rawPath.trim();

  // Reject protocol-relative URLs (//malicious.com) and external schemas (http:, https:, javascript:)
  if (
    trimmed.startsWith("//") ||
    trimmed.includes(":") ||
    trimmed.startsWith("\\")
  ) {
    return fallback;
  }

  // Must start with '/' and belong to internal application route hierarchy
  if (
    trimmed.startsWith("/app") ||
    trimmed.startsWith("/onboarding") ||
    trimmed === "/"
  ) {
    return trimmed;
  }

  return fallback;
}
