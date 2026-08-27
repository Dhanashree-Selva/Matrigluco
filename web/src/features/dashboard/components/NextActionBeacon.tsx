import { useNavigate } from "react-router-dom";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { AppIcon } from "../../../components/common/AppIcon";
import { Button } from "../../../shared/ui";
import { NextActionVM } from "../types/dashboard.types";

export interface NextActionBeaconProps {
  action: NextActionVM;
  className?: string;
}

export function NextActionBeacon({ action, className = "" }: NextActionBeaconProps) {
  const navigate = useNavigate();

  return (
    <div
      className={`flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-md bg-[var(--surface-soft)]/80 border border-[var(--border)] shadow-2xs ${className}`}
    >
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-md bg-[var(--accent-soft)] text-[var(--primary)] flex items-center justify-center shrink-0 mt-0.5">
          <AppIcon icon={action.icon} size="sm" />
        </div>
        <div className="space-y-0.5">
          <h4 className="text-sm font-bold text-[var(--foreground)] tracking-tight">
            {action.title}
          </h4>
          <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
            {action.description}
          </p>
        </div>
      </div>

      <Button
        type="button"
        size="sm"
        onClick={() => navigate(action.path)}
        className="shrink-0 h-9 px-4 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-[var(--primary-foreground)] font-bold text-xs shadow-xs cursor-pointer flex items-center gap-1.5 self-start sm:self-center"
      >
        <span>{action.buttonLabel}</span>
        <AppIcon icon={ArrowRight01Icon} size="xs" />
      </Button>
    </div>
  );
}
