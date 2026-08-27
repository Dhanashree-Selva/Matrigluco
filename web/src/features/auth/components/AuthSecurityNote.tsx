import { SecurityCheckIcon } from "@hugeicons/core-free-icons";
import { AppIcon } from "../../../components/common/AppIcon";

export function AuthSecurityNote() {
  return (
    <div className="flex items-center gap-2 p-2 rounded-md bg-[var(--surface-soft)] border border-[var(--border-subtle)] text-[10px] text-[var(--muted-foreground)] text-left">
      <AppIcon
        icon={SecurityCheckIcon}
        size="xs"
        className="text-[var(--primary)] shrink-0"
      />
      <span className="leading-snug">
        Credentials authenticated directly via backend. Health context configured privately in onboarding.
      </span>
    </div>
  );
}
