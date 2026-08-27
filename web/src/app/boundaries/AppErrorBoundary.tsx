import React, { Component, ErrorInfo, ReactNode } from "react";
import { SystemStatePage } from "../../shared/system-state/SystemStatePage";
import { RefreshIcon } from "@hugeicons/core-free-icons";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class AppErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Redact any potentially sensitive parameters before logging
    console.error("AppErrorBoundary caught fatal boundary failure:", {
      message: error.message,
      componentStack: errorInfo.componentStack?.slice(0, 300),
    });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined });
    window.location.href = "/";
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[var(--background,#FFFFFF)] text-[var(--foreground,#171417)] flex items-center justify-center p-4 sm:p-6 lg:p-12">
          <div className="w-full max-w-4xl mx-auto">
            <SystemStatePage
              kind="unexpected-error"
              codeLabel="FATAL ERROR"
              headline="Application encountered a critical error"
              description="A system-level error prevented Matrigluco from loading properly. Your maternal health data remains safely secured on the server."
              primaryAction={{
                label: "Reload Application",
                onClick: this.handleReset,
                variant: "default",
                icon: RefreshIcon,
              }}
              secondaryAction={{
                label: "Go home",
                onClick: () => {
                  window.location.href = "/";
                },
                variant: "outline",
              }}
            />
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
