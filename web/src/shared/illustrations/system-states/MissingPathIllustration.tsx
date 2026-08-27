import { SystemStateIllustrationProps } from "./system-state.types";
import "./system-state-motion.css";

export function MissingPathIllustration({
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
      {/* Background radial geometry glow */}
      <circle
        cx="140"
        cy="140"
        r="110"
        className="stroke-[var(--border)] opacity-30 dark:opacity-20"
        strokeWidth="1.5"
        strokeDasharray="4 6"
      />
      <circle
        cx="140"
        cy="140"
        r="80"
        className="stroke-[var(--border)] opacity-40 dark:opacity-25"
        strokeWidth="1"
      />

      {/* Main Care Orbit Interlocking Petals */}
      {/* Segment 1: Upper Left Arc */}
      <path
        d="M140 60C95.8172 60 60 95.8172 60 140C60 158.4 66.2 175.4 76.6 189L105 160.6C99.4 154.6 96 147.6 96 140C96 115.7 115.7 96 140 96V60Z"
        fill="currentColor"
        className="text-[var(--primary)] opacity-85"
      />

      {/* Segment 2: Bottom Arc */}
      <path
        d="M140 220C168.2 220 193.6 205.4 208.2 183.4L179.2 154.4C170.8 167.8 156.4 176 140 176C123.6 176 109.2 167.8 100.8 154.4L71.8 183.4C86.4 205.4 111.8 220 140 220Z"
        fill="currentColor"
        className="text-[var(--muted-foreground)] opacity-30 dark:opacity-40"
      />

      {/* Segment 3: Displaced Care Orbit Fragment (404 gap) */}
      <g className={animated ? "care-state-displaced-path" : ""}>
        <path
          d="M219.4 91C205.6 72 184.2 60 160 60V96C174.4 96 186.8 103 194.8 114.2L219.4 91Z"
          fill="currentColor"
          className="text-[var(--primary)] opacity-95"
        />
        {/* Disconnected path indicator dot */}
        <circle
          cx="220"
          cy="92"
          r="5"
          fill="currentColor"
          className="text-[var(--primary)]"
        />
      </g>

      {/* Negative Space Orbit Pathway (Interrupted Gap) */}
      <path
        d="M140 140L175 105"
        className="stroke-[var(--border-pink,var(--primary))] opacity-50"
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="3 3"
      />

      {/* Destination Node: Gently Pulsing */}
      <g className={animated ? "care-state-dest-node" : ""}>
        <circle
          cx="175"
          cy="105"
          r="8"
          className="stroke-[var(--primary)] stroke-[2] fill-[var(--card)]"
        />
        <circle
          cx="175"
          cy="105"
          r="3"
          fill="currentColor"
          className="text-[var(--primary)]"
        />
      </g>

      {/* Central Core Care Seed */}
      <circle
        cx="140"
        cy="140"
        r="14"
        className="fill-[var(--surface-soft,var(--card))] stroke-[var(--border)] stroke-[1.5]"
      />
      <circle
        cx="140"
        cy="140"
        r="6"
        fill="currentColor"
        className="text-[var(--primary)] opacity-60"
      />
    </svg>
  );
}
