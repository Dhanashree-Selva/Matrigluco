import { ReactNode } from "react";

interface ContextRailProps {
  children?: ReactNode;
  className?: string;
}

export function ContextRail({ children, className = "" }: ContextRailProps) {
  if (!children) return null;

  return (
    <aside
      aria-label="Clinical Context Rail"
      className={`hidden xl:block w-80 border-l border-[var(--border)] bg-[var(--card)] p-6 space-y-4 shrink-0 min-h-screen transition-colors ${className}`}
    >
      {children}
    </aside>
  );
}
