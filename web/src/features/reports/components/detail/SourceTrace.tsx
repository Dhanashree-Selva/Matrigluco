import { Badge } from "../../../../shared/ui";
import { DocumentCodeIcon } from "@hugeicons/core-free-icons";
import { AppIcon } from "../../../../components/common/AppIcon";

interface SourceTraceProps {
  pageNumber?: number;
  className?: string;
}

export function SourceTrace({ pageNumber, className = "" }: SourceTraceProps) {
  if (!pageNumber) return null;

  return (
    <Badge
      variant="outline"
      className={`gap-1 text-[10px] font-mono py-0 px-1.5 bg-[var(--surface-soft)] text-[var(--muted-foreground)] border-[var(--border-subtle)] ${className}`}
      title={`Located on page ${pageNumber} of the original document`}
    >
      <AppIcon icon={DocumentCodeIcon} size="xxs" />
      <span>Page {pageNumber}</span>
    </Badge>
  );
}
