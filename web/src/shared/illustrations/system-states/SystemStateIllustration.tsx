import { SystemStateKind, SystemStateIllustrationProps } from "./system-state.types";
import { MissingPathIllustration } from "./MissingPathIllustration";
import { AccessBoundaryIllustration } from "./AccessBoundaryIllustration";
import { SessionBoundaryIllustration } from "./SessionBoundaryIllustration";
import { InterruptedSignalIllustration } from "./InterruptedSignalIllustration";
import { ServicePauseIllustration } from "./ServicePauseIllustration";
import { OfflineBridgeIllustration } from "./OfflineBridgeIllustration";
import { FeatureDormantIllustration } from "./FeatureDormantIllustration";

export interface UnifiedIllustrationProps extends SystemStateIllustrationProps {
  kind: SystemStateKind;
}

export function SystemStateIllustration({
  kind,
  className = "",
  size = 280,
  animated = true,
}: UnifiedIllustrationProps) {
  switch (kind) {
    case "not-found":
    case "resource-unavailable":
      return (
        <MissingPathIllustration
          className={className}
          size={size}
          animated={animated}
        />
      );

    case "access-restricted":
      return (
        <AccessBoundaryIllustration
          className={className}
          size={size}
          animated={animated}
        />
      );

    case "session-ended":
      return (
        <SessionBoundaryIllustration
          className={className}
          size={size}
          animated={animated}
        />
      );

    case "unexpected-error":
    case "rate-limited":
      return (
        <InterruptedSignalIllustration
          className={className}
          size={size}
          animated={animated}
        />
      );

    case "service-unavailable":
    case "maintenance":
      return (
        <ServicePauseIllustration
          className={className}
          size={size}
          animated={animated}
        />
      );

    case "offline":
      return (
        <OfflineBridgeIllustration
          className={className}
          size={size}
          animated={animated}
        />
      );

    case "feature-unavailable":
      return (
        <FeatureDormantIllustration
          className={className}
          size={size}
          animated={animated}
        />
      );

    default:
      return (
        <MissingPathIllustration
          className={className}
          size={size}
          animated={animated}
        />
      );
  }
}
