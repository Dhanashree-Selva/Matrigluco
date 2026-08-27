import { Link, useNavigate } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  Button,
  Badge,
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "../../../../shared/ui";
import {
  ArrowLeft01Icon,
  Download04Icon,
  Delete02Icon,
  Shield01Icon,
  DocumentCodeIcon,
} from "@hugeicons/core-free-icons";
import { AppIcon } from "../../../../components/common/AppIcon";
import { ReportViewModel } from "../../types/reports.types";
import { ReportStatus } from "../ReportStatus";
import { useFileDownload } from "../../hooks/useFileDownload";
import { useDeleteReport } from "../../hooks/useDeleteReport";

interface ReportDetailHeaderProps {
  report: ReportViewModel;
}

export function ReportDetailHeader({ report }: ReportDetailHeaderProps) {
  const navigate = useNavigate();
  const { downloadFile, isDownloading } = useFileDownload();
  const deleteMutation = useDeleteReport();

  const handleDownload = () => {
    downloadFile(report.fileUrl || report.id, report.originalFilename);
  };

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(report.id);
      navigate("/app/reports");
    } catch {
      // Error handled by mutation toast
    }
  };

  return (
    <header className="space-y-4 pb-4 border-b border-[var(--border-subtle)]">
      {/* Breadcrumb Navigation */}
      <Breadcrumb>
        <BreadcrumbList className="text-xs">
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link
                to="/app/reports"
                className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] font-bold flex items-center gap-1"
              >
                <AppIcon icon={ArrowLeft01Icon} size="xxs" />
                <span>Reports Vault</span>
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="font-bold text-[var(--foreground)] truncate max-w-[200px] sm:max-w-xs">
              {report.originalFilename}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Main Header Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--primary)] uppercase tracking-wider">
              <AppIcon icon={DocumentCodeIcon} size="xs" />
              <span>Evidence Workspace</span>
            </div>

            <Badge
              variant="outline"
              className="text-[10px] py-0 px-2 font-mono gap-1 border-[var(--primary)]/30 text-[var(--primary)] bg-[var(--accent-soft)]"
            >
              <AppIcon icon={Shield01Icon} size="xxs" />
              <span>Private Source</span>
            </Badge>

            <ReportStatus
              processingStatus={report.processingStatus}
              reviewStatus={report.reviewStatus}
            />
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-[var(--foreground)] tracking-tight truncate max-w-xl">
            {report.originalFilename}
          </h1>

          <p className="text-xs text-[var(--muted-foreground)]">
            Uploaded on {report.formattedDate} at {report.formattedTime} •{" "}
            <span className="uppercase font-mono font-bold text-[10px]">
              {report.fileType}
            </span>
          </p>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-2 self-start md:self-center shrink-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleDownload}
            disabled={isDownloading}
            className="gap-1.5 text-xs font-bold shadow-2xs border-[var(--border)]"
          >
            <AppIcon icon={Download04Icon} size="xs" />
            <span>Download Original</span>
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="gap-1.5 text-xs font-bold text-destructive hover:bg-destructive/10 hover:text-destructive"
              >
                <AppIcon icon={Delete02Icon} size="xs" />
                <span className="hidden sm:inline">Delete</span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-[var(--card)] border-[var(--border)]">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-base font-bold text-[var(--foreground)]">
                  Remove Medical Report?
                </AlertDialogTitle>
                <AlertDialogDescription className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                  This action will delete &ldquo;{report.originalFilename}&rdquo; and its associated extracted biomarkers from your private MatriGluco workspace. This cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="text-xs font-bold">
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  disabled={deleteMutation.isPending}
                  className="text-xs font-bold bg-destructive text-white hover:bg-destructive/90"
                >
                  {deleteMutation.isPending ? "Removing..." : "Remove Report"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </header>
  );
}
