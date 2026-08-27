import { useNavigate, useRouteError } from "react-router-dom";
import { AlertCircleIcon } from "@hugeicons/core-free-icons";
import { CalmEmptyState } from "../../components/care-orbit/calm-empty-state";
import { ActionBeacon } from "../../components/care-orbit/action-beacon";
import { ROUTES } from "../route-paths";

export function RouteErrorPage() {
  const error = useRouteError() as Error | undefined;
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex items-center justify-center p-6">
      <CalmEmptyState
        icon={AlertCircleIcon}
        title="Unable to load view"
        description={
          error?.message ||
          "An unexpected error occurred while loading this maternal care section."
        }
        action={
          <ActionBeacon
            label="Return to Dashboard"
            onClick={() => navigate(ROUTES.HOME)}
          />
        }
      />
    </div>
  );
}
