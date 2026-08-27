import { Button } from "../../../../shared/ui";
import {
  PlusSignIcon,
  MinusSignIcon,
  RefreshIcon,
  Download04Icon,
  Shield01Icon,
  DocumentCodeIcon,
  Image01Icon,
} from "@hugeicons/core-free-icons";
import { AppIcon } from "../../../../components/common/AppIcon";

interface SourceViewerToolbarProps {
  zoomLevel: number;
  viewMode: "scan" | "lab_sheet";
  onViewModeChange: (mode: "scan" | "lab_sheet") => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  onDownload: () => void;
  isDownloading?: boolean;
}

export function SourceViewerToolbar({
  zoomLevel,
  viewMode,
  onViewModeChange,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onDownload,
  isDownloading,
}: SourceViewerToolbarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 p-2 bg-[var(--surface-soft)]/70 border-b border-[var(--border-subtle)] rounded-t-xl select-none">
      {/* Left: View Mode Toggle */}
      <div className="flex items-center gap-1 bg-[var(--surface-soft)] p-0.5 rounded-lg border border-[var(--border-subtle)]">
        <button
          type="button"
          onClick={() => onViewModeChange("scan")}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
            viewMode === "scan"
              ? "bg-[var(--card)] text-[var(--foreground)] shadow-2xs"
              : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          }`}
          aria-label="View Document Scan"
        >
          <AppIcon icon={Image01Icon} size="xxs" />
          <span>Document Scan</span>
        </button>

        <button
          type="button"
          onClick={() => onViewModeChange("lab_sheet")}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
            viewMode === "lab_sheet"
              ? "bg-[var(--card)] text-[var(--foreground)] shadow-2xs"
              : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          }`}
          aria-label="View Clinical Lab Sheet"
        >
          <AppIcon icon={DocumentCodeIcon} size="xxs" />
          <span>Lab Sheet</span>
        </button>
      </div>

      {/* Right: Zoom & Download Controls */}
      <div className="flex items-center gap-1">
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          onClick={onZoomOut}
          disabled={zoomLevel <= 0.5}
          className="h-7 w-7 rounded-md text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          aria-label="Zoom out"
        >
          <AppIcon icon={MinusSignIcon} size="xs" />
        </Button>

        <span className="text-[10px] font-mono font-bold text-[var(--muted-foreground)] min-w-[36px] text-center">
          {Math.round(zoomLevel * 100)}%
        </span>

        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          onClick={onZoomIn}
          disabled={zoomLevel >= 2.5}
          className="h-7 w-7 rounded-md text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          aria-label="Zoom in"
        >
          <AppIcon icon={PlusSignIcon} size="xs" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          onClick={onResetZoom}
          className="h-7 w-7 rounded-md text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          aria-label="Reset zoom to 100%"
        >
          <AppIcon icon={RefreshIcon} size="xs" />
        </Button>

        <div className="w-[1px] h-4 bg-[var(--border)] mx-1" />

        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          onClick={onDownload}
          disabled={isDownloading}
          className="h-7 w-7 rounded-md text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          aria-label="Download original document stream"
        >
          <AppIcon icon={Download04Icon} size="xs" />
        </Button>
      </div>
    </div>
  );
}
