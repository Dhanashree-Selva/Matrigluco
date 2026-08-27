import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";
import { LoadingState } from "../../components/common/LoadingState";
import { routePaths } from "./route-paths";

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <LoadingState message="Verifying maternal care session..." />
      </div>
    );
  }

  if (!user) {
    return (
      <Navigate
        to={routePaths.auth.login}
        state={{ from: location.pathname + location.search }}
        replace
      />
    );
  }

  const onboardingCompleted = localStorage.getItem("onboarding_completed") === "true";
  if (!onboardingCompleted && location.pathname !== routePaths.onboarding) {
    return <Navigate to={routePaths.onboarding} replace />;
  }

  return <>{children}</>;
}
