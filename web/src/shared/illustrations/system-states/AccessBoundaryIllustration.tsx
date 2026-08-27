import { SystemStateIllustrationProps } from "./system-state.types";
import "./system-state-motion.css";

export function AccessBoundaryIllustration({
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
      {/* Outer concentric boundary ring */}
      <circle
        cx="140"
        cy="140"
        r="115"
        className="stroke-[var(--border)] opacity-35 dark:opacity-20"
        strokeWidth="1.5"
      />
      <circle
        cx="140"
        cy="140"
        r="95"
        className="stroke-[var(--border)] opacity-25 dark:opacity-15"
        strokeWidth="1"
        strokeDasharray="5 5"
      />

      {/* Converging Outer Care Orbit Petals (Breathing by 1-2%) */}
      <g className={animated ? "care-state-boundary-petal" : ""}>
        {/* Top-North Segment */}
        <path
          d="M140 55C165 55 188 66 204 84L178 110C168 98 155 92 140 92C125 92 112 98 102 110L76 84C92 66 115 55 140 55Z"
          fill="currentColor"
          className="text-[var(--primary)] opacity-85"
        />
        {/* Bottom-South Segment */}
        <path
          d="M140 225C115 225 92 214 76 196L102 170C112 182 125 188 140 188C155 188 168 182 178 170L204 196C188 214 165 225 140 225Z"
          fill="currentColor"
          className="text-[var(--primary)] opacity-85"
        />
      </g>

      <g className={animated ? "care-state-boundary-petal-delay" : ""}>
        {/* Left-West Segment */}
        <path
          d="M55 140C55 115 66 92 84 76L110 102C98 112 92 125 92 140C92 155 98 168 110 178L84 204C66 188 55 165 55 140Z"
          fill="currentColor"
          className="text-[var(--muted-foreground)] opacity-40 dark:opacity-50"
        />
        {/* Right-East Segment */}
        <path
          d="M225 140C225 165 214 188 196 204L170 178C182 168 188 155 188 140C188 125 182 112 170 102L196 76C214 92 225 115 225 140Z"
          fill="currentColor"
          className="text-[var(--muted-foreground)] opacity-40 dark:opacity-50"
        />
      </g>

      {/* Central Protected Geometric Negative-Space Cell */}
      <circle
        cx="140"
        cy="140"
        r="28"
        className="fill-[var(--card)] stroke-[var(--primary)] stroke-[2] shadow-xs"
      />
      {/* Protected Shield Core Marker (Care Ring) */}
      <circle
        cx="140"
        cy="140"
        r="14"
        className="fill-[var(--accent-soft,rgba(217,79,125,0.1))] stroke-[var(--border-pink,var(--primary))] stroke-[1.5]"
      />
      <circle
        cx="140"
        cy="140"
        r="5"
        fill="currentColor"
        className="text-[var(--primary)]"
      />
    </svg>
  );
}
