import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
  Button,
} from "../../../shared/ui";
import {
  DocumentCodeIcon,
  PlusSignIcon,
  FilterIcon,
} from "@hugeicons/core-free-icons";
import { AppIcon } from "../../../components/common/AppIcon";

interface ReportEmptyStateProps {
  isFiltered: boolean;
  onUploadClick: () => void;
  onClearFilter?: () => void;
}

export function ReportEmptyState({
  isFiltered,
  onUploadClick,
  onClearFilter,
}: ReportEmptyStateProps) {
  if (isFiltered) {
    return (
      <Empty className="py-12 border border-dashed border-[var(--border)] rounded-xl bg-[var(--card)]">
        <EmptyHeader>
          <EmptyMedia
            variant="icon"
            className="h-12 w-12 rounded-full bg-[var(--surface-soft)] text-[var(--muted-foreground)] flex items-center justify-center mx-auto mb-3"
          >
            <AppIcon icon={FilterIcon} size="md" />
          </EmptyMedia>
          <EmptyTitle className="text-base font-bold text-[var(--foreground)]">
            No reports match this filter
          </EmptyTitle>
          <EmptyDescription className="text-xs text-[var(--muted-foreground)] max-w-sm mx-auto">
            Try switching to another category or reset your filter to view all medical reports in your vault.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent className="mt-4">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClearFilter}
            className="text-xs font-bold"
          >
            Show All Reports
          </Button>
        </EmptyContent>
      </Empty>
    );
  }

  return (
    <Empty className="py-16 border border-dashed border-[var(--border)] rounded-xl bg-[var(--card)]">
      <EmptyHeader>
        <EmptyMedia
          variant="icon"
          className="h-14 w-14 rounded-full bg-[var(--accent-soft)] text-[var(--primary)] flex items-center justify-center mx-auto mb-3 border border-[var(--primary)]/30 shadow-xs"
        >
          <AppIcon icon={DocumentCodeIcon} size="lg" />
        </EmptyMedia>
        <EmptyTitle className="text-lg font-black text-[var(--foreground)] tracking-tight">
          Your Private Report Vault is Empty
        </EmptyTitle>
        <EmptyDescription className="text-xs text-[var(--muted-foreground)] max-w-md mx-auto leading-relaxed">
          Upload medical lab results, diagnostic scans, or prescriptions. Keep your source documents, automated OCR biomarker extractions, and verification records together in one private, authenticated workspace.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent className="mt-5">
        <Button
          type="button"
          onClick={onUploadClick}
          className="gap-2 text-xs font-bold bg-[var(--primary)] text-white hover:bg-[var(--primary)]/90 shadow-sm"
        >
          <AppIcon icon={PlusSignIcon} size="xs" />
          <span>Upload First Report</span>
        </Button>
      </EmptyContent>
    </Empty>
  );
}
