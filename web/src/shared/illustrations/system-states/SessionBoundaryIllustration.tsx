import { SystemStateIllustrationProps } from "./system-state.types";
import "./system-state-motion.css";

export function SessionBoundaryIllustration({
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
      {/* Background boundary circle */}
      <circle
        cx="140"
        cy="140"
        r="110"
        className="stroke-[var(--border)] opacity-30 dark:opacity-20"
        strokeWidth="1.5"
        strokeDasharray="4 6"
      />

      {/* Stable Primary Orbit Base (Left & Bottom arcs) */}
      <path
        d="M140 60C95.8 60 60 95.8 60 140C60 184.2 95.8 220 140 220C168.4 220 193.8 205.2 208.4 183L179.4 154C171 167.4 156.6 175.6 140 175.6C120.3 175.6 104.4 159.7 104.4 140C104.4 120.3 120.3 104.4 140 104.4V60Z"
        fill="currentColor"
        className="text-[var(--primary)] opacity-85"
      />

      {/* Gently Releasing Top-Right Orbit Segment */}
      <g className={animated ? "care-state-releasing-segment" : ""}>
        <path
          d="M165 58C195 65 218 88 225 118L188 132C184 116 173 104 158 98L165 58Z"
          fill="currentColor"
          className="text-[var(--muted-foreground)] opacity-50 dark:opacity-60"
        />
        {/* Soft releasing tether marker */}
        <circle
          cx="225"
          cy="118"
          r="4.5"
          fill="currentColor"
          className="text-[var(--primary)]"
        />
      </g>

      {/* Gentle center aperture */}
      <circle
        cx="140"
        cy="140"
        r="18"
        className="fill-[var(--card)] stroke-[var(--border)] stroke-[1.5]"
      />
      <circle
        cx="140"
        cy="140"
        r="7"
        className="fill-[var(--accent-soft,rgba(217,79,125,0.1))] stroke-[var(--primary)] stroke-[1.5]"
      />
    </svg>
  );
}
