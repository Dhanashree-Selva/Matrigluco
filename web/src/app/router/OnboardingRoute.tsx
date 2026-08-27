import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";
import { LoadingState } from "../../components/common/LoadingState";
import { routePaths } from "./route-paths";

interface OnboardingRouteProps {
  children: ReactNode;
}

export function OnboardingRoute({ children }: OnboardingRouteProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <LoadingState message="Loading..." />
      </div>
    );
  }

  if (!user) {
    return <Navigate to={routePaths.auth.login} replace />;
  }

  const onboardingCompleted = localStorage.getItem("onboarding_completed") === "true";
  if (onboardingCompleted) {
    return <Navigate to={routePaths.app.dashboard} replace />;
  }

  return <>{children}</>;
}
