import React from "react";

interface ChronicleSpineProps {
  children: React.ReactNode;
}

export function ChronicleSpine({ children }: ChronicleSpineProps) {
  return (
    <div className="relative pl-8 sm:pl-9 before:absolute before:left-3.5 sm:before:left-4 before:-translate-x-1/2 before:w-[2px] before:top-3 before:bottom-3 before:bg-[var(--border)]">
      {children}
    </div>
  );
}

export function ChronicleSpineNode({
  isHighlight = false,
}: {
  isHighlight?: boolean;
}) {
  return (
    <div
      className={`absolute -left-[26px] sm:-left-[28px] top-1/2 -translate-y-1/2 w-4 h-4 rounded-full flex items-center justify-center bg-[var(--card)] border-2 transition-all ${
        isHighlight
          ? "border-[var(--primary)] shadow-[0_0_8px_rgba(240,85,120,0.4)]"
          : "border-[var(--border)]"
      }`}
    >
      <div
        className={`w-1.5 h-1.5 rounded-full ${
          isHighlight ? "bg-[var(--primary)]" : "bg-[var(--muted-foreground)]/60"
        }`}
      />
    </div>
  );
}
