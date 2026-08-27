import { useNavigate } from "react-router-dom";
import { SystemStatePage } from "../../shared/system-state/SystemStatePage";
import { useDocumentTitle } from "../../shared/hooks/useDocumentTitle";
import { routePaths } from "../../app/router/route-paths";
import { Home01Icon, ArrowLeft01Icon } from "@hugeicons/core-free-icons";

export default function AccessRestrictedPage() {
  useDocumentTitle("403 — Access Restricted");
  const navigate = useNavigate();

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <SystemStatePage
        kind="access-restricted"
        headline="This area isn't available to your account"
        description="You don't have access to this part of Matrigluco. Return to a workspace available to you."
        isEmbedded={true}
        primaryAction={{
          label: "Go to dashboard",
          onClick: () => navigate(routePaths.app.dashboard),
          variant: "default",
          icon: Home01Icon,
        }}
        secondaryAction={{
          label: "Go back",
          onClick: () => navigate(-1),
          variant: "outline",
          icon: ArrowLeft01Icon,
        }}
      />
    </div>
  );
}
