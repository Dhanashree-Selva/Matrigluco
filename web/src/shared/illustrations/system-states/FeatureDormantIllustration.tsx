import { SystemStateIllustrationProps } from "./system-state.types";
import "./system-state-motion.css";

export function FeatureDormantIllustration({
  className = "",
  size = 280,
  animated = true,
}: SystemStateIllustrationProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 280 280"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`care-state-svg ${className}`}
      aria-hidden="true"
      focusable="false"
    >
      {/* Background orbit guides */}
      <circle
        cx="140"
        cy="140"
        r="110"
        className="stroke-[var(--border)] opacity-30 dark:opacity-20"
        strokeWidth="1.5"
        strokeDasharray="4 6"
      />

      {/* Active Modules (3 Segments) */}
      <g className={animated ? "care-state-active-module" : ""}>
        {/* Top Arc */}
        <path
          d="M140 60C168 60 193 74 208 96L180 124C171 110 156 102 140 102C124 102 109 110 100 124L72 96C87 74 112 60 140 60Z"
          fill="currentColor"
          className="text-[var(--primary)] opacity-85"
        />
        {/* Left Arc */}
        <path
          d="M60 140C60 162 70 182 85 196L112 168C104 160 100 151 100 140H60Z"
          fill="currentColor"
          className="text-[var(--primary)] opacity-70"
        />
        {/* Right Arc */}
        <path
          d="M220 140C220 162 210 182 195 196L168 168C176 160 180 151 180 140H220Z"
          fill="currentColor"
          className="text-[var(--muted-foreground)] opacity-40 dark:opacity-50"
        />
      </g>

      {/* Dormant / Lowered Bottom Module Segment */}
      <g opacity="0.4">
        <path
          d="M140 220C122 220 105 214 92 204L118 178C124 182 132 184 140 184C148 184 156 182 162 178L188 204C175 214 158 220 140 220Z"
          fill="currentColor"
          className="text-[var(--muted-foreground)]"
          strokeDasharray="3 3"
        />
        <circle
          cx="140"
          cy="202"
          r="3"
          fill="currentColor"
          className="text-[var(--muted-foreground)]"
        />
      </g>

      {/* Central Core Indicator */}
      <circle
        cx="140"
        cy="140"
        r="18"
        className="fill-[var(--card)] stroke-[var(--border)] stroke-[1.5]"
      />
      <circle
        cx="140"
        cy="140"
        r="6"
        fill="currentColor"
        className="text-[var(--primary)] opacity-75"
      />
    </svg>
  );
}
