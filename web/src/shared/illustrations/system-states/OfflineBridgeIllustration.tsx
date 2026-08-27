import { SystemStateIllustrationProps } from "./system-state.types";
import "./system-state-motion.css";

export function OfflineBridgeIllustration({
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
      {/* Structural Horizon Guides */}
      <line
        x1="40"
        y1="140"
        x2="240"
        y2="140"
        className="stroke-[var(--border)] opacity-35 dark:opacity-20"
        strokeWidth="1.5"
        strokeDasharray="4 6"
      />

      {/* Left Patient Care Structure */}
      <g>
        <circle
          cx="80"
          cy="140"
          r="48"
          className="stroke-[var(--border)] opacity-40 dark:opacity-25"
          strokeWidth="1.5"
        />
        <path
          d="M80 100C102 100 120 118 120 140C120 162 102 180 80 180V100Z"
          fill="currentColor"
          className="text-[var(--primary)] opacity-85"
        />
        <circle
          cx="80"
          cy="140"
          r="10"
          className="fill-[var(--card)] stroke-[var(--border)] stroke-[1.5]"
        />
        <circle
          cx="80"
          cy="140"
          r="4"
          fill="currentColor"
          className="text-[var(--primary)]"
        />
      </g>

      {/* Right Server / Cloud Care Structure */}
      <g>
        <circle
          cx="200"
          cy="140"
          r="48"
          className="stroke-[var(--border)] opacity-40 dark:opacity-25"
          strokeWidth="1.5"
        />
        <path
          d="M200 100C178 100 160 118 160 140C160 162 178 180 200 180V100Z"
          fill="currentColor"
          className="text-[var(--muted-foreground)] opacity-45 dark:opacity-55"
        />
        <circle
          cx="200"
          cy="140"
          r="10"
          className="fill-[var(--card)] stroke-[var(--border)] stroke-[1.5]"
        />
        <circle
          cx="200"
          cy="140"
          r="4"
          fill="currentColor"
          className="text-[var(--muted-foreground)]"
        />
      </g>

      {/* Interrupted Connector Bridge (Seeking connection) */}
      <g className={animated ? "care-state-bridge-connector" : ""}>
        <line
          x1="124"
          y1="140"
          x2="142"
          y2="140"
          className="stroke-[var(--primary)] stroke-[2.5]"
          strokeLinecap="round"
        />
        <circle
          cx="142"
          cy="140"
          r="3"
          fill="currentColor"
          className="text-[var(--primary)]"
        />
      </g>

      {/* Right side receptor bridge stub */}
      <line
        x1="156"
        y1="140"
        x2="160"
        y2="140"
        className="stroke-[var(--muted-foreground)] stroke-[2]"
        strokeLinecap="round"
        strokeDasharray="2 2"
      />
    </svg>
  );
}
