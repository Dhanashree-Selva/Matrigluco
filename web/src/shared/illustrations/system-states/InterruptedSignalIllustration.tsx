import { SystemStateIllustrationProps } from "./system-state.types";
import "./system-state-motion.css";

export function InterruptedSignalIllustration({
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
      {/* Outer structural stabilization frame */}
      <circle
        cx="140"
        cy="140"
        r="112"
        className="stroke-[var(--border)] opacity-35 dark:opacity-20"
        strokeWidth="1.5"
      />
      <circle
        cx="140"
        cy="140"
        r="88"
        className="stroke-[var(--border)] opacity-25 dark:opacity-15"
        strokeWidth="1"
        strokeDasharray="4 6"
      />

      {/* Primary Stable Shell (Left & Upper Arcs) */}
      <path
        d="M140 60C95.8 60 60 95.8 60 140C60 184.2 95.8 220 140 220C158 220 175 214 188.5 204L162 177.5C155.5 182 148 184.5 140 184.5C115.4 184.5 95.5 164.6 95.5 140C95.5 115.4 115.4 95.5 140 95.5V60Z"
        fill="currentColor"
        className="text-[var(--primary)] opacity-85"
      />

      {/* Offset Signal Segment Attempting to Reconnect */}
      <g className={animated ? "care-state-interrupted-signal" : ""}>
        <path
          d="M208 92C192 72 168 60 140 60V95.5C158 95.5 173 103 184 115L208 92Z"
          fill="currentColor"
          className="text-[var(--muted-foreground)] opacity-50 dark:opacity-60"
        />
        {/* Signal Bridge Nodes */}
        <line
          x1="184"
          y1="115"
          x2="170"
          y2="135"
          className="stroke-[var(--primary)] opacity-60"
          strokeWidth="2"
          strokeDasharray="3 3"
        />
        <circle
          cx="184"
          cy="115"
          r="5"
          fill="currentColor"
          className="text-[var(--primary)]"
        />
      </g>

      {/* Lower Right Secondary Arc */}
      <path
        d="M220 140C220 162 210 182 195 196L169 170C177 162 182 152 182 140H220Z"
        fill="currentColor"
        className="text-[var(--muted-foreground)] opacity-35 dark:opacity-45"
      />

      {/* Signal Anchor Center */}
      <circle
        cx="140"
        cy="140"
        r="20"
        className="fill-[var(--card)] stroke-[var(--border)] stroke-[1.5]"
      />
      <circle
        cx="140"
        cy="140"
        r="8"
        fill="currentColor"
        className="text-[var(--primary)] opacity-80"
      />
    </svg>
  );
}
