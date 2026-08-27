import { ReactNode } from "react";

export type PatternVariant =
  | "dots"
  | "grid"
  | "boxes"
  | "hex"
  | "waves"
  | "orbit"
  | "none";

interface PatternSurfaceProps {
  variant?: PatternVariant;
  className?: string;
  children?: ReactNode;
  tone?: "base" | "soft" | "accent-soft" | "card";
}

export function PatternSurface({
  variant = "none",
  className = "",
  children,
  tone = "base",
}: PatternSurfaceProps) {
  const getToneClass = () => {
    switch (tone) {
      case "soft":
        return "bg-[var(--surface-soft)]";
      case "accent-soft":
        return "bg-[var(--accent-soft)]";
      case "card":
        return "bg-[var(--card)]";
      case "base":
      default:
        return "bg-[var(--background)]";
    }
  };

  return (
    <div className={`relative overflow-hidden transition-colors ${getToneClass()} ${className}`}>
      {/* 1. Dotted Field Pattern */}
      {variant === "dots" && (
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none opacity-[0.05] dark:opacity-[0.08]"
          style={{
            backgroundImage: `radial-gradient(var(--primary) 1.25px, transparent 1.25px)`,
            backgroundSize: "28px 28px",
            maskImage: "radial-gradient(ellipse at center, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 80%)",
            WebkitMaskImage: "radial-gradient(ellipse at center, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 80%)",
          }}
        />
      )}

      {/* 2. Technical Grid Pattern */}
      {variant === "grid" && (
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none opacity-[0.04] dark:opacity-[0.07]"
          style={{
            backgroundImage: `
              linear-gradient(to right, var(--primary) 1px, transparent 1px),
              linear-gradient(to bottom, var(--primary) 1px, transparent 1px)
            `,
            backgroundSize: "40px 40px",
            maskImage: "radial-gradient(ellipse at center, rgba(0,0,0,1) 30%, rgba(0,0,0,0) 85%)",
            WebkitMaskImage: "radial-gradient(ellipse at center, rgba(0,0,0,1) 30%, rgba(0,0,0,0) 85%)",
          }}
        />
      )}

      {/* 3. Soft Box Matrix Pattern */}
      {variant === "boxes" && (
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none opacity-[0.04] dark:opacity-[0.07]"
          style={{
            backgroundImage: `
              linear-gradient(to right, var(--border) 1px, transparent 1px),
              linear-gradient(to bottom, var(--border) 1px, transparent 1px)
            `,
            backgroundSize: "64px 64px",
            maskImage: "linear-gradient(to bottom, transparent, black 20%, black 80%, transparent)",
            WebkitMaskImage: "linear-gradient(to bottom, transparent, black 20%, black 80%, transparent)",
          }}
        >
          {/* Decorative Sparse Micro-Boxes */}
          <div className="absolute top-12 left-1/4 w-8 h-8 rounded-md border border-[var(--primary)] opacity-40" />
          <div className="absolute top-32 right-1/5 w-6 h-6 rounded-md bg-[var(--primary)] opacity-20" />
          <div className="absolute bottom-16 left-1/6 w-10 h-10 rounded-md border border-[var(--primary)] opacity-30" />
        </div>
      )}

      {/* 4. Connected Hexagonal Mesh Pattern */}
      {variant === "hex" && (
        <svg
          aria-hidden="true"
          className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.035] dark:opacity-[0.06]"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="hex-pattern"
              width="56"
              height="96"
              patternUnits="userSpaceOnUse"
              patternTransform="scale(1)"
            >
              <path
                d="M28,0 L56,16 L56,48 L28,64 L0,48 L0,16 Z M28,48 L56,64 L56,96 L28,112 L0,96 L0,64 Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                className="text-[var(--primary)]"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hex-pattern)" />
        </svg>
      )}

      {/* 5. Smooth Wave Contours Pattern */}
      {variant === "waves" && (
        <svg
          aria-hidden="true"
          className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.04] dark:opacity-[0.08]"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          viewBox="0 0 1440 600"
        >
          <path
            d="M0,160 C320,300, 480,80, 800,200 C1120,320, 1280,100, 1440,240"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="text-[var(--primary)]"
          />
          <path
            d="M0,280 C360,180, 640,400, 960,260 C1280,120, 1360,340, 1440,320"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            className="text-[var(--primary)]"
          />
          <path
            d="M0,420 C240,480, 520,320, 840,440 C1160,560, 1320,380, 1440,460"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            className="text-[var(--primary)]"
          />
        </svg>
      )}

      {/* 6. Centered Orbital Trace & Ambient Glow Pattern */}
      {variant === "orbit" && (
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden"
        >
          {/* Subtle Ambient Radial Wash */}
          <div className="absolute w-[600px] h-[600px] bg-[var(--accent-soft)] rounded-md blur-3xl opacity-60 dark:opacity-20 pointer-events-none" />

          {/* Centered Dotted Mask */}
          <div
            className="absolute inset-0 opacity-[0.06] dark:opacity-[0.10]"
            style={{
              backgroundImage: `radial-gradient(var(--primary) 1.5px, transparent 1.5px)`,
              backgroundSize: "32px 32px",
              maskImage: "radial-gradient(ellipse at center, rgba(0,0,0,1) 20%, rgba(0,0,0,0) 75%)",
              WebkitMaskImage: "radial-gradient(ellipse at center, rgba(0,0,0,1) 20%, rgba(0,0,0,0) 75%)",
            }}
          />

          {/* Concentric Geometric Orbit Frames */}
          <div className="w-[420px] h-[420px] rounded-md border border-[var(--primary)]/20 absolute opacity-50 dark:opacity-40" />
          <div className="w-[720px] h-[720px] rounded-md border border-[var(--primary)]/15 absolute opacity-40 dark:opacity-30" />
          <div className="w-[1040px] h-[1040px] rounded-md border border-[var(--primary)]/10 absolute opacity-30 dark:opacity-20" />

          {/* Micro Constellation Nodes */}
          <div className="w-2.5 h-2.5 rounded-md bg-[var(--primary)] absolute top-1/4 left-1/4 opacity-40 shadow-xs" />
          <div className="w-2 h-2 rounded-md bg-[var(--primary)] absolute top-1/3 right-1/4 opacity-50 shadow-xs" />
          <div className="w-2 h-2 rounded-md bg-[var(--primary)] absolute bottom-1/4 left-1/3 opacity-30 shadow-xs" />
          <div className="w-3 h-3 rounded-md bg-[var(--primary)] absolute bottom-1/3 right-1/5 opacity-40 shadow-xs" />
        </div>
      )}

      {/* Surface Content Layer */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
