import { ReactNode } from "react";
import { SystemStatePage } from "../../shared/system-state/SystemStatePage";
import { RefreshIcon, Home01Icon } from "@hugeicons/core-free-icons";

interface RouteErrorBoundaryProps {
  error?: Error;
  resetErrorBoundary?: () => void;
  children?: ReactNode;
}

export function RouteErrorBoundary({
  error,
  resetErrorBoundary,
}: RouteErrorBoundaryProps) {
  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <SystemStatePage
        kind="unexpected-error"
        headline="Something interrupted this section"
        description="Matrigluco couldn't complete this view. Your health records and account data haven't been affected."
        isEmbedded={true}
        primaryAction={
          resetErrorBoundary
            ? {
                label: "Try again",
                onClick: resetErrorBoundary,
                variant: "default",
                icon: RefreshIcon,
              }
            : undefined
        }
        secondaryAction={{
          label: "Go to dashboard",
          to: "/app/dashboard",
          variant: "outline",
          icon: Home01Icon,
        }}
      />
    </div>
  );
}
