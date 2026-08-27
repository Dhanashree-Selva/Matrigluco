import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SystemStatePage } from "../../shared/system-state/SystemStatePage";
import { useDocumentTitle } from "../../shared/hooks/useDocumentTitle";
import { routePaths } from "../../app/router/route-paths";
import { RefreshIcon, Home01Icon } from "@hugeicons/core-free-icons";

export default function OfflinePage() {
  useDocumentTitle("Offline — Connection Paused");
  const navigate = useNavigate();
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const handleRetry = () => {
    if (navigator.onLine) {
      window.location.reload();
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <SystemStatePage
        kind="offline"
        headline={isOnline ? "Connection Restored" : "You're offline"}
        description={
          isOnline
            ? "Your internet connection is active again. Reload to synchronize your current maternal health data."
            : "Matrigluco can't reach the server right now. Reconnect to continue with current health records."
        }
        isEmbedded={true}
        primaryAction={{
          label: isOnline ? "Synchronize & Reload" : "Check connection",
          onClick: handleRetry,
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
