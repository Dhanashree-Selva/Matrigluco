import { SystemStatePage } from "../../shared/system-state/SystemStatePage";
import { useDocumentTitle } from "../../shared/hooks/useDocumentTitle";
import { RefreshIcon } from "@hugeicons/core-free-icons";

export default function MaintenancePage() {
  useDocumentTitle("Maintenance — Matrigluco");

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <SystemStatePage
        kind="maintenance"
        headline="System maintenance in progress"
        description="Matrigluco is undergoing scheduled clinical platform enhancements. We will be back online shortly."
        primaryAction={{
          label: "Refresh status",
          onClick: () => window.location.reload(),
          variant: "default",
          icon: RefreshIcon,
        }}
        secondaryAction={{
          label: "Go home",
          onClick: () => {
            window.location.href = "/";
          },
          variant: "outline",
        }}
      />
    </div>
  );
}
