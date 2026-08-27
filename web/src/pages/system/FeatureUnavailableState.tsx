import { useNavigate } from "react-router-dom";
import { SystemStatePage } from "../../shared/system-state/SystemStatePage";
import { routePaths } from "../../app/router/route-paths";
import { Home01Icon, Activity01Icon } from "@hugeicons/core-free-icons";

export interface FeatureUnavailableStateProps {
  featureName?: string;
  description?: string;
  className?: string;
}

export function FeatureUnavailableState({
  featureName = "Assistant",
  description,
  className = "",
}: FeatureUnavailableStateProps) {
  const navigate = useNavigate();

  return (
    <div className={`w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ${className}`}>
      <SystemStatePage
        kind="feature-unavailable"
        headline={`${featureName} is currently unavailable`}
        description={
          description ||
          `The local ${featureName} runtime is temporarily resting. Your glucose tracking, risk assessments, lab reports, and consultations remain fully accessible.`
        }
        isEmbedded={true}
        primaryAction={{
          label: "Go to dashboard",
          onClick: () => navigate(routePaths.app.dashboard),
          variant: "default",
          icon: Home01Icon,
        }}
        secondaryAction={{
          label: "View Care Timeline",
          onClick: () => navigate(routePaths.app.history),
          variant: "outline",
          icon: Activity01Icon,
        }}
      />
    </div>
  );
}
