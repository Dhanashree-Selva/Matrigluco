import { useNavigate } from "react-router-dom";
import { SystemStatePage } from "../../shared/system-state/SystemStatePage";
import { routePaths } from "../../app/router/route-paths";
import { ArrowLeft01Icon, Folder01Icon, RefreshIcon } from "@hugeicons/core-free-icons";

export interface ResourceUnavailableStateProps {
  resourceType?: "report" | "assessment" | "consultation" | "measurement" | "record";
  onRetry?: () => void;
  className?: string;
}

export function ResourceUnavailableState({
  resourceType = "record",
  onRetry,
  className = "",
}: ResourceUnavailableStateProps) {
  const navigate = useNavigate();

  const getReturnRoute = () => {
    switch (resourceType) {
      case "report":
        return routePaths.app.reports;
      case "assessment":
        return routePaths.app.assessment;
      case "consultation":
        return routePaths.app.consultations;
      case "measurement":
        return routePaths.app.tracking;
      default:
        return routePaths.app.history;
    }
  };

  const getReturnLabel = () => {
    switch (resourceType) {
      case "report":
        return "Return to Reports Vault";
      case "assessment":
        return "Return to Assessment";
      case "consultation":
        return "Return to Consultations";
      case "measurement":
        return "Return to Tracking";
      default:
        return "Return to Health History";
    }
  };

  return (
    <div className={`w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ${className}`}>
      <SystemStatePage
        kind="resource-unavailable"
        headline="This resource isn't available"
        description="It may no longer exist or may not be accessible from this account. Return to your records to continue."
        isEmbedded={true}
        primaryAction={
          onRetry
            ? {
                label: "Try again",
                onClick: onRetry,
                variant: "default",
                icon: RefreshIcon,
              }
            : {
                label: getReturnLabel(),
                onClick: () => navigate(getReturnRoute()),
                variant: "default",
                icon: Folder01Icon,
              }
        }
        secondaryAction={{
          label: onRetry ? getReturnLabel() : "Go back",
          onClick: onRetry ? () => navigate(getReturnRoute()) : () => navigate(-1),
          variant: "outline",
          icon: ArrowLeft01Icon,
        }}
      />
    </div>
  );
}
