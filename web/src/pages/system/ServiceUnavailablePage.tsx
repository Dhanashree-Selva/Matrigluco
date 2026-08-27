import { useNavigate } from "react-router-dom";
import { SystemStatePage } from "../../shared/system-state/SystemStatePage";
import { useDocumentTitle } from "../../shared/hooks/useDocumentTitle";
import { routePaths } from "../../app/router/route-paths";
import { RefreshIcon, Home01Icon } from "@hugeicons/core-free-icons";

interface ServiceUnavailablePageProps {
  onRetry?: () => void;
}

export default function ServiceUnavailablePage({
  onRetry,
}: ServiceUnavailablePageProps) {
  useDocumentTitle("503 — Temporarily Unavailable");
  const navigate = useNavigate();

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <SystemStatePage
        kind="service-unavailable"
        headline="Matrigluco is temporarily unavailable"
        description="The service couldn't complete your request right now. Try again shortly."
        isEmbedded={true}
        primaryAction={{
          label: "Try again",
          onClick: onRetry || (() => window.location.reload()),
          variant: "default",
          icon: RefreshIcon,
        }}
        secondaryAction={{
          label: "Go to dashboard",
          onClick: () => navigate(routePaths.app.dashboard),
          variant: "outline",
          icon: Home01Icon,
        }}
      />
    </div>
  );
}
