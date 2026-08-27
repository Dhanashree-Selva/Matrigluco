import { ReactNode } from "react";
import { SystemStateKind } from "../illustrations/system-states/system-state.types";

interface SystemStateSurfaceProps {
  kind: SystemStateKind;
  children: ReactNode;
  className?: string;
}

export function SystemStateSurface({
  kind,
  children,
  className = "",
}: SystemStateSurfaceProps) {
  // Purpose-built low opacity background texture
  const renderBackgroundPattern = () => {
    switch (kind) {
      case "not-found":
      case "resource-unavailable":
        // Faint orbit map
        return (
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.04] overflow-hidden"
            aria-hidden="true"
          >
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="faint-orbit-map" width="80" height="80" patternUnits="userSpaceOnUse">
                  <circle cx="40" cy="40" r="32" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
                  <circle cx="40" cy="40" r="16" fill="none" stroke="currentColor" strokeWidth="0.8" />
                  <circle cx="40" cy="40" r="2" fill="currentColor" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#faint-orbit-map)" />
            </svg>
          </div>
        );

      case "access-restricted":
        // Protected concentric cells
        return (
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.035] dark:opacity-[0.04] overflow-hidden"
            aria-hidden="true"
          >
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="protected-cells" width="60" height="60" patternUnits="userSpaceOnUse">
                  <rect x="10" y="10" width="40" height="40" rx="12" fill="none" stroke="currentColor" strokeWidth="1" />
                  <circle cx="30" cy="30" r="6" fill="currentColor" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#protected-cells)" />
            </svg>
          </div>
        );

      case "unexpected-error":
      case "rate-limited":
        // Broken micro-grid
        return (
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.04] overflow-hidden"
            aria-hidden="true"
          >
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="broken-grid" width="48" height="48" patternUnits="userSpaceOnUse">
                  <path d="M 48 0 L 0 0 0 48" fill="none" stroke="currentColor" strokeWidth="0.75" />
                  <line x1="24" y1="20" x2="24" y2="28" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#broken-grid)" />
            </svg>
          </div>
        );

      case "service-unavailable":
      case "maintenance":
        // Quiet horizontal signal bands
        return (
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.035] overflow-hidden"
            aria-hidden="true"
          >
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="quiet-bands" width="100" height="32" patternUnits="userSpaceOnUse">
                  <line x1="0" y1="16" x2="100" y2="16" stroke="currentColor" strokeWidth="1" strokeDasharray="12 12" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#quiet-bands)" />
            </svg>
          </div>
        );

      case "offline":
      case "session-ended":
      case "feature-unavailable":
      default:
        // Soft fading dot field
        return (
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.035] overflow-hidden"
            aria-hidden="true"
          >
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="dot-field" width="32" height="32" patternUnits="userSpaceOnUse">
                  <circle cx="16" cy="16" r="1.5" fill="currentColor" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#dot-field)" />
            </svg>
          </div>
        );
    }
  };

  return (
    <div
      className={`relative min-h-[70vh] flex flex-col items-center justify-center p-4 sm:p-6 lg:p-12 overflow-hidden bg-[var(--background)] text-[var(--foreground)] ${className}`}
    >
      {renderBackgroundPattern()}
      <div className="relative z-10 w-full max-w-5xl mx-auto">{children}</div>
    </div>
  );
}
