import { SystemStateKind } from "../illustrations/system-states/system-state.types";

interface ContinuityLineProps {
  kind: SystemStateKind;
  className?: string;
}

export function ContinuityLine({
  kind,
  className = "",
}: ContinuityLineProps) {
  // Renders the specific state continuity line on desktop
  const renderPath = () => {
    switch (kind) {
      case "not-found":
      case "resource-unavailable":
        // 404 line stops before destination with gap
        return (
          <path
            d="M0 24H70M90 24H120"
            className="stroke-[var(--primary)] opacity-40 dark:opacity-30"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeDasharray="4 4"
          />
        );

      case "access-restricted":
        // 403 line reaches protected boundary
        return (
          <path
            d="M0 24H100M100 16V32"
            className="stroke-[var(--primary)] opacity-50 dark:opacity-35"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        );

      case "unexpected-error":
      case "rate-limited":
        // 500 line breaks & rejoins with offset
        return (
          <path
            d="M0 24H45L55 18H75L85 24H120"
            className="stroke-[var(--primary)] opacity-45 dark:opacity-35"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        );

      case "service-unavailable":
      case "maintenance":
        // 503 line pauses with twin dots
        return (
          <>
            <path
              d="M0 24H60M80 24H120"
              className="stroke-[var(--muted-foreground)] opacity-40"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <circle cx="68" cy="24" r="2" className="fill-[var(--primary)] opacity-70" />
            <circle cx="74" cy="24" r="2" className="fill-[var(--primary)] opacity-70" />
          </>
        );

      case "offline":
      default:
        // Offline line fades out
        return (
          <path
            d="M0 24H50"
            className="stroke-[var(--muted-foreground)] opacity-35"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeDasharray="2 3"
          />
        );
    }
  };

  return (
    <div
      className={`hidden lg:flex items-center justify-center pointer-events-none ${className}`}
      aria-hidden="true"
    >
      <svg width="120" height="48" viewBox="0 0 120 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        {renderPath()}
      </svg>
    </div>
  );
}
