import React from "react";

interface CitationMarkerProps {
  index: number;
  title?: string;
  onClick?: () => void;
}

export function CitationMarker({ index, title, onClick }: CitationMarkerProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center justify-center font-mono font-bold text-[11px] text-[var(--primary)] bg-[var(--accent-soft)] hover:bg-[var(--primary)] hover:text-white px-1.5 py-0.5 rounded transition-all mx-0.5 align-baseline focus:outline-none focus-visible:ring-1 focus-visible:ring-[var(--primary)] active:scale-95"
      aria-label={title ? `Open source ${index}: ${title}` : `Source ${index}`}
      title={title || `Source ${index}`}
    >
      {index}
    </button>
  );
}
