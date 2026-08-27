import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";
import { LoadingState } from "../../components/common/LoadingState";
import { routePaths } from "./route-paths";
import { getSafeRedirectPath } from "./redirect-utils";

interface PublicRouteProps {
  children: ReactNode;
}

export function PublicRoute({ children }: PublicRouteProps) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <LoadingState message="Loading..." />
      </div>
    );
  }

  if (user) {
    const onboardingCompleted = localStorage.getItem("onboarding_completed") === "true";
    if (!onboardingCompleted) {
      return <Navigate to={routePaths.onboarding} replace />;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const intended = (location.state as any)?.from;
    const destination = getSafeRedirectPath(intended, routePaths.app.dashboard);
    return <Navigate to={destination} replace />;
  }

  return <>{children}</>;
}
