import { useNavigate } from "react-router-dom";
import { SystemStatePage } from "../../shared/system-state/SystemStatePage";
import { useDocumentTitle } from "../../shared/hooks/useDocumentTitle";
import { routePaths } from "../../app/router/route-paths";
import { RefreshIcon, Home01Icon } from "@hugeicons/core-free-icons";

interface SystemErrorPageProps {
  requestId?: string | null;
  onRetry?: () => void;
}

export default function SystemErrorPage({
  requestId,
  onRetry,
}: SystemErrorPageProps) {
  useDocumentTitle("500 — Application Error");
  const navigate = useNavigate();

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <SystemStatePage
        kind="unexpected-error"
        headline="Something interrupted this page"
        description="Matrigluco couldn't complete this request. Try again, or return to your workspace."
        requestId={requestId}
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
