import { useState } from "react";
import {
  Button,
  Spinner,
} from "../../../../shared/ui";
import {
  Pdf02Icon,
  Image01Icon,
  Download04Icon,
  AlertCircleIcon,
} from "@hugeicons/core-free-icons";
import { AppIcon } from "../../../../components/common/AppIcon";
import { ReportViewModel } from "../../types/reports.types";
import { SourceViewerToolbar } from "./SourceViewerToolbar";
import { LabSheetViewer } from "./LabSheetViewer";
import { useFileDownload, useFilePreviewBlob } from "../../hooks/useFileDownload";

interface SourceViewerProps {
  report: ReportViewModel;
}

export function SourceViewer({ report }: SourceViewerProps) {
  const [zoomLevel, setZoomLevel] = useState(1.0);
  const [viewMode, setViewMode] = useState<"scan" | "lab_sheet">("scan");

  const { downloadFile, isDownloading } = useFileDownload();
  const { blobUrl, mimeType, isLoading, error } = useFilePreviewBlob(
    report.fileUrl || report.id
  );

  const lowerFilename = (report.originalFilename || "").toLowerCase();
  const isPdf =
    report.fileType === "pdf" ||
    Boolean(mimeType?.includes("pdf")) ||
    lowerFilename.endsWith(".pdf");

  const isImage =
    report.fileType === "image" ||
    Boolean(mimeType?.includes("image")) ||
    lowerFilename.endsWith(".jpg") ||
    lowerFilename.endsWith(".jpeg") ||
    lowerFilename.endsWith(".png") ||
    lowerFilename.endsWith(".webp") ||
    (!isPdf && Boolean(blobUrl));

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(2.5, prev + 0.25));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(0.5, prev - 0.25));
  const handleResetZoom = () => setZoomLevel(1.0);
  const handleDownload = () =>
    downloadFile(report.fileUrl || report.id, report.originalFilename);

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-xs flex flex-col h-full min-h-[520px]">
      {/* Viewer Toolbar */}
      <SourceViewerToolbar
        zoomLevel={zoomLevel}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onResetZoom={handleResetZoom}
        onDownload={handleDownload}
        isDownloading={isDownloading}
      />

      {/* Main Preview Container */}
      <div className="flex-1 flex items-center justify-center p-3 sm:p-4 bg-[var(--surface-soft)]/40 overflow-hidden relative min-h-[460px]">
        {viewMode === "lab_sheet" ? (
          <LabSheetViewer report={report} zoomLevel={zoomLevel} />
        ) : isLoading ? (
          <div className="flex flex-col items-center justify-center gap-2 p-8 text-center">
            <Spinner className="h-8 w-8 text-[var(--primary)]" />
            <p className="text-xs font-bold text-[var(--foreground)]">
              Loading secure document stream...
            </p>
            <p className="text-[10px] text-[var(--muted-foreground)]">
              Authenticating private medical file
            </p>
          </div>
        ) : isPdf && blobUrl ? (
          <div className="w-full h-full min-h-[460px] rounded-xl overflow-hidden border border-[var(--border)] bg-white shadow-xs">
            <iframe
              src={`${blobUrl}#toolbar=0&navpanes=0`}
              title={`PDF Viewer for ${report.originalFilename}`}
              className="w-full h-full min-h-[460px] border-0"
            />
          </div>
        ) : isImage && blobUrl ? (
          <div className="w-full h-full flex items-center justify-center overflow-auto p-2">
            <div
              className="transition-transform duration-200 ease-out origin-center flex items-center justify-center max-w-full"
              style={{ transform: `scale(${zoomLevel})` }}
            >
              <div className="relative w-[360px] sm:w-[460px] max-w-full aspect-[4/5] rounded-xl overflow-hidden shadow-md border border-[var(--border)] bg-black/10 flex items-center justify-center">
                <img
                  src={blobUrl}
                  alt={`Scanned preview of ${report.originalFilename}`}
                  className="w-full h-full object-contain"
                  onError={() => setViewMode("lab_sheet")}
                />
              </div>
            </div>
          </div>
        ) : (
          /* When stream is not an image blob or was uploaded as mock document, display Lab Sheet */
          <div className="w-full flex flex-col items-center gap-3">
            <LabSheetViewer report={report} zoomLevel={zoomLevel} />
          </div>
        )}
      </div>
    </div>
  );
}
