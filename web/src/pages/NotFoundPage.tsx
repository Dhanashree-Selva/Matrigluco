import { useNavigate } from "react-router-dom";
import { SystemStatePage } from "../shared/system-state/SystemStatePage";
import { useDocumentTitle } from "../shared/hooks/useDocumentTitle";
import { routePaths } from "../app/router/route-paths";
import { Home01Icon, ArrowLeft01Icon } from "@hugeicons/core-free-icons";

export default function NotFoundPage() {
  useDocumentTitle("404 — Page Not Found");
  const navigate = useNavigate();

  const handleSafeGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(routePaths.app.dashboard);
    }
  };

  return (
    <div className="w-full min-h-[80vh] flex items-center justify-center p-4 sm:p-6 lg:p-12">
      <SystemStatePage
        kind="not-found"
        headline="This path doesn't exist"
        description="We couldn't find the Matrigluco page you're looking for. Your account and health information haven't been changed."
        primaryAction={{
          label: "Return to Dashboard",
          onClick: () => navigate(routePaths.app.dashboard),
          variant: "default",
          icon: Home01Icon,
        }}
        secondaryAction={{
          label: "Go Back",
          onClick: handleSafeGoBack,
          variant: "outline",
          icon: ArrowLeft01Icon,
        }}
        tertiaryActions={[
          {
            label: "Maternal Assistant",
            onClick: () => navigate(routePaths.app.assistant),
          },
          {
            label: "Glucose Tracking",
            onClick: () => navigate(routePaths.app.tracking),
          },
        ]}
      />
    </div>
  );
}
