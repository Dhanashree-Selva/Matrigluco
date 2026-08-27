import { AlertCircleIcon, RefreshIcon } from "@hugeicons/core-free-icons";
import { CalmEmptyState } from "../components/care-orbit/calm-empty-state";
import { AppIcon } from "../components/common/AppIcon";

export default function SystemUnavailablePage() {
  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex items-center justify-center p-6">
      <CalmEmptyState
        icon={AlertCircleIcon}
        title="Service Temporarily Unavailable"
        description="The backend clinical services are currently undergoing maintenance or reconnecting. Your stored measurements remain safe."
        action={
          <button
            onClick={handleReload}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-[16px] bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-[var(--primary-foreground)] font-bold text-sm transition-all"
          >
            <AppIcon icon={RefreshIcon} size="sm" className="text-white" />
            <span>Check Connectivity</span>
          </button>
        }
      />
    </div>
  );
}
