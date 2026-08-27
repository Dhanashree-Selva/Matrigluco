import { SystemStateIllustrationProps } from "./system-state.types";
import "./system-state-motion.css";

export function ServicePauseIllustration({
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
      {/* Outer concentric horizon rings */}
      <circle
        cx="140"
        cy="140"
        r="115"
        className="stroke-[var(--border)] opacity-30 dark:opacity-20"
        strokeWidth="1.5"
      />
      <circle
        cx="140"
        cy="140"
        r="90"
        className="stroke-[var(--border)] opacity-25 dark:opacity-15"
        strokeWidth="1"
        strokeDasharray="6 6"
      />

      {/* Aligned Geometric Orbit Layers (Gently drifting) */}
      <g className={animated ? "care-state-suspended-layer" : ""}>
        {/* Upper Symmetrical Arc */}
        <path
          d="M65 125C75 85 105 60 140 60C175 60 205 85 215 125H176C168 105 155 94 140 94C125 94 112 105 104 125H65Z"
          fill="currentColor"
          className="text-[var(--primary)] opacity-85"
        />

        {/* Lower Symmetrical Arc */}
        <path
          d="M65 155C75 195 105 220 140 220C175 220 205 195 215 155H176C168 175 155 186 140 186C125 186 112 175 104 155H65Z"
          fill="currentColor"
          className="text-[var(--muted-foreground)] opacity-40 dark:opacity-50"
        />
      </g>

      {/* Suspended Center Care Pulse (Quiet, non-spinning) */}
      <circle
        cx="140"
        cy="140"
        r="24"
        className="fill-[var(--card)] stroke-[var(--border-pink,var(--primary))] stroke-[1.5]"
      />
      {/* Two quiet horizontal pause bars inside the care core */}
      <rect
        x="132"
        y="132"
        width="4"
        height="16"
        rx="2"
        fill="currentColor"
        className="text-[var(--primary)]"
      />
      <rect
        x="144"
        y="132"
        width="4"
        height="16"
        rx="2"
        fill="currentColor"
        className="text-[var(--primary)]"
      />
    </svg>
  );
}
