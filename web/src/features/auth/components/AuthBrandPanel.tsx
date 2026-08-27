import {
  SecurityCheckIcon,
  SparklesIcon,
  Pulse01Icon,
  Shield01Icon,
} from "@hugeicons/core-free-icons";
import { AppLogo } from "../../../shared/brand/AppLogo";
import { AppIcon } from "../../../components/common/AppIcon";
import { Badge } from "../../../shared/ui";

export function AuthBrandPanel() {
  const trustPoints = [
    {
      icon: SecurityCheckIcon,
      title: "Private Backend Data Path",
      description: "Encrypted credentials and session isolation across web and mobile.",
    },
    {
      icon: Pulse01Icon,
      title: "Evidence-Based ML Risk Model",
      description: "8-factor population modeling without diagnostic overreach.",
    },
    {
      icon: Shield01Icon,
      title: "Local AI Educational Assistant",
      description: "Offline health information queries without external telemetry.",
    },
  ];

  return (
    <div className="h-full flex flex-col justify-between p-8 lg:p-10 relative overflow-hidden text-left select-none">
      {/* Background Subtle Orbit Motifs */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none opacity-[0.05] dark:opacity-[0.08] flex items-center justify-center overflow-hidden"
      >
        <div className="w-[420px] h-[420px] rounded-full border border-[var(--primary)] absolute -top-16 -left-16" />
        <div className="w-[600px] h-[600px] rounded-full border border-[var(--primary)] absolute -top-32 -left-32" />
      </div>

      {/* Top Brand Header */}
      <div className="relative z-10 space-y-5">
        <div className="flex items-center gap-3">
          <AppLogo size={34} className="text-[var(--primary)]" />
          <span className="text-xl font-black text-[var(--foreground)] tracking-tight">
            Matrigluco
          </span>
        </div>

        <div className="space-y-2.5 max-w-sm">
          <Badge
            variant="outline"
            className="bg-[var(--accent-soft)] text-[var(--primary)] border-[var(--primary)]/20 text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 inline-flex items-center gap-1.5"
          >
            <AppIcon icon={SparklesIcon} size="xs" />
            <span>Care Orbit Platform</span>
          </Badge>
          <h2 className="text-2xl font-black text-[var(--foreground)] tracking-tight leading-snug">
            One calm, continuous workspace for your maternal health.
          </h2>
          <p className="text-xs sm:text-sm text-[var(--muted-foreground)] leading-relaxed">
            Review metabolic trends, monitor risk indications, and organize clinical consultation history in a private, patient-centric environment.
          </p>
        </div>
      </div>

      {/* Center Trust Points */}
      <div className="relative z-10 space-y-3 py-6">
        {trustPoints.map((point) => (
          <div
            key={point.title}
            className="flex items-start gap-3 p-3 rounded-md bg-[var(--card)] border border-[var(--border)] shadow-2xs"
          >
            <div className="w-7 h-7 rounded-md bg-[var(--accent-soft)] text-[var(--primary)] flex items-center justify-center shrink-0 mt-0.5">
              <AppIcon icon={point.icon} size="xs" />
            </div>
            <div className="space-y-0.5">
              <p className="text-xs font-bold text-[var(--foreground)]">
                {point.title}
              </p>
              <p className="text-[11px] text-[var(--muted-foreground)] leading-relaxed">
                {point.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Footer Note */}
      <div className="relative z-10 pt-4 border-t border-[var(--border)] text-[11px] text-[var(--muted-foreground)] flex items-center justify-between">
        <span>Matrigluco Health</span>
        <span className="font-semibold">Care Orbit v2.0</span>
      </div>
    </div>
  );
}
