import { SparklesIcon, SecurityCheckIcon, Clock01Icon } from "@hugeicons/core-free-icons";
import { AppIcon } from "../../../components/common/AppIcon";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardContent,
  CardFooter,
  Badge,
} from "../../../shared/ui";
import { NextActionBeacon } from "./NextActionBeacon";
import { HealthHorizonVM } from "../types/dashboard.types";

export interface HealthHorizonProps {
  data: HealthHorizonVM;
  className?: string;
}

export function HealthHorizon({ data, className = "" }: HealthHorizonProps) {
  const getRiskBadge = (risk: string) => {
    switch (risk.toLowerCase()) {
      case "low":
        return (
          <Badge
            variant="outline"
            className="bg-[var(--success-soft)] text-[var(--success)] border-[var(--success)]/20 text-[10px] font-extrabold px-2 py-0.5"
          >
            Low Risk Band
          </Badge>
        );
      case "moderate":
        return (
          <Badge
            variant="outline"
            className="bg-[var(--warning-soft)] text-[var(--warning)] border-[var(--warning)]/20 text-[10px] font-extrabold px-2 py-0.5"
          >
            Moderate Risk Band
          </Badge>
        );
      case "high":
        return (
          <Badge
            variant="destructive"
            className="bg-[var(--destructive-soft)] text-[var(--destructive)] border-[var(--destructive)]/20 text-[10px] font-extrabold px-2 py-0.5"
          >
            Elevated Risk Band
          </Badge>
        );
      default:
        return (
          <Badge
            variant="outline"
            className="bg-[var(--surface-soft)] text-[var(--muted-foreground)] border-[var(--border)] text-[10px] font-semibold px-2 py-0.5"
          >
            No Active Assessment
          </Badge>
        );
    }
  };

  return (
    <Card
      data-slot="health-horizon"
      className={`relative overflow-hidden rounded-md border border-[var(--border-pink)] bg-[var(--card)] shadow-xs transition-all ${className}`}
    >
      {/* Ambient Orbital Pattern Glow */}
      <div
        className="absolute top-0 right-0 w-80 h-80 bg-[var(--accent-soft)] rounded-full -mr-24 -mt-24 blur-3xl pointer-events-none opacity-60 dark:opacity-20"
        aria-hidden="true"
      />

      {/* 1. Header with Eyebrow, Title, and CardAction (Status + Recency) */}
      <CardHeader className="relative z-10 pb-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-[var(--primary)] uppercase tracking-wider">
            <AppIcon icon={SparklesIcon} size="xs" />
            <span>{data.eyebrow}</span>
          </div>
          <CardTitle className="text-xl sm:text-2xl lg:text-3xl font-black text-[var(--foreground)] tracking-tight leading-snug">
            {data.title}
          </CardTitle>
          <CardDescription className="text-xs text-[var(--muted-foreground)] flex items-center gap-1.5 pt-0.5">
            <AppIcon icon={Clock01Icon} size="xs" className="shrink-0 text-[var(--primary)]" />
            <span>{data.recencyText}</span>
          </CardDescription>
        </div>

        <CardAction className="flex flex-wrap items-center gap-2 self-start justify-self-end">
          {getRiskBadge(data.riskBand)}
          <Badge
            variant="outline"
            className="bg-[var(--surface-soft)] text-[var(--muted-foreground)] border-[var(--border)] text-[10px] font-medium hidden sm:inline-flex items-center gap-1"
          >
            <AppIcon icon={SecurityCheckIcon} size="xs" className="text-[var(--primary)]" />
            <span>Private Path</span>
          </Badge>
        </CardAction>
      </CardHeader>

      {/* 2. Narrative Content */}
      <CardContent className="relative z-10 py-2">
        <p className="text-sm text-[var(--muted-foreground)] leading-relaxed font-medium max-w-3xl">
          {data.narrative}
        </p>
      </CardContent>

      {/* 3. Footer with Next Action Beacon */}
      <CardFooter className="relative z-10 pt-2 border-t-0 bg-transparent p-(--card-spacing)">
        <NextActionBeacon action={data.primaryAction} className="w-full" />
      </CardFooter>
    </Card>
  );
}
