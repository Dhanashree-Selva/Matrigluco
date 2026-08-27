import React from "react";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { AppIcon } from "../common/AppIcon";

export interface ActionBeaconProps {
  label: string;
  sublabel?: string;
  onClick: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon?: any;
  variant?: "primary" | "secondary";
  className?: string;
}

export function ActionBeacon({
  label,
  sublabel,
  onClick,
  icon = ArrowRight01Icon,
  variant = "primary",
  className = "",
}: ActionBeaconProps) {
  if (variant === "secondary") {
    return (
      <button
        onClick={onClick}
        className={`inline-flex items-center gap-2 px-5 py-3 rounded-md bg-[var(--surface-soft)] hover:bg-[var(--accent-soft)] text-[var(--foreground)] border border-[var(--border)] font-bold text-sm transition-all active:scale-[0.98] shadow-xs ${className}`}
      >
        <span>{label}</span>
        <AppIcon icon={icon} size="sm" className="text-[var(--primary)]" />
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className={`group relative overflow-hidden inline-flex items-center justify-between gap-4 px-6 py-4 rounded-md bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-[var(--primary-foreground)] font-bold text-sm transition-all active:scale-[0.98] shadow-md shadow-[var(--primary)]/20 ${className}`}
    >
      <div className="text-left">
        <div className="font-bold text-sm tracking-tight">{label}</div>
        {sublabel && (
          <div className="text-[11px] font-medium opacity-85 mt-0.5">
            {sublabel}
          </div>
        )}
      </div>

      <div className="w-8 h-8 rounded-md bg-white/20 flex items-center justify-center shrink-0 group-hover:translate-x-0.5 transition-transform">
        <AppIcon icon={icon} size="sm" className="text-white" />
      </div>
    </button>
  );
}
