import { AiBrain01Icon, SecurityCheckIcon } from "@hugeicons/core-free-icons";
import { AppIcon } from "../../../../components/common/AppIcon";
import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
  Badge,
} from "../../../../shared/ui";

interface ModelVersionHoverCardProps {
  version: string;
}

export function ModelVersionHoverCard({ version }: ModelVersionHoverCardProps) {
  return (
    <HoverCard openDelay={200} closeDelay={150}>
      <HoverCardTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-mono bg-[var(--surface-soft)] text-[var(--foreground)] border border-[var(--border)] hover:border-[var(--primary)]/50 transition-colors cursor-help"
          aria-label={`Model version ${version} details`}
        >
          <AppIcon icon={AiBrain01Icon} size="xs" className="text-[var(--primary)]" />
          <span>v{version}</span>
        </button>
      </HoverCardTrigger>
      <HoverCardContent
        align="start"
        side="top"
        className="w-72 p-3 space-y-2 bg-[var(--card)] border border-[var(--border)] shadow-md"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <AppIcon icon={AiBrain01Icon} size="xs" className="text-[var(--primary)]" />
            <span className="text-xs font-bold text-[var(--foreground)]">Diabetes Risk Estimator</span>
          </div>
          <Badge variant="outline" className="text-[10px] font-mono border-[var(--border)]">
            v{version}
          </Badge>
        </div>

        <p className="text-[11px] text-[var(--muted-foreground)] leading-relaxed">
          Calibrated ensemble classifier evaluated on 8 canonical metabolic features.
        </p>

        <div className="pt-1.5 border-t border-[var(--border-subtle)] flex items-center gap-1 text-[10px] text-[var(--muted-foreground)]">
          <AppIcon icon={SecurityCheckIcon} size="xs" className="text-[var(--success)] shrink-0" />
          <span>Research & educational prototype model</span>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
