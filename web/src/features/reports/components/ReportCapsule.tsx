import { useNavigate } from "react-router-dom";
import {
  Attachment,
  AttachmentMedia,
  AttachmentTrigger,
  Button,
  Badge,
} from "../../../shared/ui";
import {
  Pdf02Icon,
  Image01Icon,
  DocumentCodeIcon,
  Download04Icon,
  ArrowRight01Icon,
} from "@hugeicons/core-free-icons";
import { AppIcon } from "../../../components/common/AppIcon";
import { ReportViewModel } from "../types/reports.types";
import { ProcessingRibbon } from "./ProcessingRibbon";
import { ReportStatus } from "./ReportStatus";
import { useFileDownload } from "../hooks/useFileDownload";

interface ReportCapsuleProps {
  report: ReportViewModel;
}

export function ReportCapsule({ report }: ReportCapsuleProps) {
  const navigate = useNavigate();
  const { downloadFile, isDownloading } = useFileDownload();

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    downloadFile(report.fileUrl || report.id, report.originalFilename);
  };

  const isPdf = report.fileType === "pdf";
  const isImage = report.fileType === "image";

  return (
    <div className="relative group/capsule rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 sm:p-5 shadow-xs hover:border-[var(--primary)]/50 hover:shadow-sm transition-all space-y-3.5">
      {/* Top Row: File Identity, Status & Primary Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Left: Media + Title + Metadata */}
        <div className="flex items-center gap-3.5 min-w-0">
          <AttachmentMedia
            variant="icon"
            className="h-11 w-11 rounded-lg shrink-0 bg-[var(--accent-soft)] text-[var(--primary)] border border-[var(--primary)]/20 flex items-center justify-center shadow-2xs"
          >
            {isPdf ? (
              <AppIcon icon={Pdf02Icon} size="md" />
            ) : isImage ? (
              <AppIcon icon={Image01Icon} size="md" />
            ) : (
              <AppIcon icon={DocumentCodeIcon} size="md" />
            )}
          </AttachmentMedia>

          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm sm:text-base font-bold text-[var(--foreground)] truncate">
                {report.originalFilename}
              </h3>
              <ReportStatus
                processingStatus={report.processingStatus}
                reviewStatus={report.reviewStatus}
              />
            </div>

            <p className="text-xs text-[var(--muted-foreground)] flex items-center gap-2">
              <span className="uppercase font-mono text-[10px] font-bold tracking-wider px-1.5 py-0.5 rounded bg-[var(--surface-soft)] text-[var(--muted-foreground)] border border-[var(--border-subtle)]">
                {report.fileType}
              </span>
              <span>•</span>
              <span>
                Uploaded {report.formattedDate} at {report.formattedTime}
              </span>
            </p>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 self-start sm:self-center shrink-0 z-20">
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            onClick={handleDownload}
            disabled={isDownloading}
            className="rounded-lg h-9 w-9 text-[var(--muted-foreground)] hover:text-[var(--foreground)] border-[var(--border)] bg-[var(--card)]"
            aria-label={`Download original file for ${report.originalFilename}`}
          >
            <AppIcon icon={Download04Icon} size="xs" />
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={() => navigate(`/app/reports/${report.id}`)}
            className={`h-9 gap-1.5 text-xs font-bold shadow-2xs ${
              report.reviewStatus === "needs_review"
                ? "bg-[var(--primary)] text-white hover:bg-[var(--primary)]/90"
                : "bg-[var(--surface-soft)] text-[var(--foreground)] hover:bg-[var(--surface)] border border-[var(--border-subtle)]"
            }`}
          >
            <span>
              {report.reviewStatus === "needs_review"
                ? "Review Extracted Data"
                : "View Report"}
            </span>
            <AppIcon icon={ArrowRight01Icon} size="xs" />
          </Button>
        </div>
      </div>

      {/* Bottom Row: Processing Lifecycle Ribbon & Extracted Biomarkers */}
      <div className="pt-3 border-t border-[var(--border-subtle)] flex flex-col md:flex-row md:items-center justify-between gap-3">
        <ProcessingRibbon status={report.processingStatus} size="sm" />

        {/* Extracted Biomarker Summary Chips */}
        {report.extractedValues.length > 0 ? (
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-bold text-[var(--muted-foreground)] mr-1">
              Extracted:
            </span>
            {report.extractedValues.slice(0, 3).map((bio) => (
              <Badge
                key={bio.key}
                variant="outline"
                className="text-[10px] font-bold py-0.5 px-2 bg-[var(--surface-soft)] text-[var(--foreground)] border-[var(--border-subtle)]"
              >
                <span>{bio.label}:</span>
                <span className="ml-1 text-[var(--primary)] font-mono font-bold">
                  {bio.value} {bio.unit}
                </span>
              </Badge>
            ))}
            {report.extractedValues.length > 3 && (
              <Badge
                variant="outline"
                className="text-[10px] font-bold py-0.5 px-1.5 bg-[var(--surface-soft)] text-[var(--muted-foreground)] border-[var(--border-subtle)]"
              >
                +{report.extractedValues.length - 3} more
              </Badge>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-[11px] text-[var(--muted-foreground)]">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--muted-foreground)]/40" />
            <span>
              {report.processingStatus === "processing"
                ? "Extracting biomarkers via OCR pipeline..."
                : "No structured values extracted"}
            </span>
          </div>
        )}
      </div>

      {/* Full Card Trigger */}
      <AttachmentTrigger
        onClick={() => navigate(`/app/reports/${report.id}`)}
        aria-label={`Open report details for ${report.originalFilename}`}
      />
    </div>
  );
}
