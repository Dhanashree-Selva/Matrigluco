export type SystemStateKind =
  | "not-found"
  | "resource-unavailable"
  | "access-restricted"
  | "session-ended"
  | "unexpected-error"
  | "service-unavailable"
  | "offline"
  | "maintenance"
  | "feature-unavailable"
  | "rate-limited";

export interface SystemStateIllustrationProps {
  className?: string;
  size?: number | string;
  animated?: boolean;
}
