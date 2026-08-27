import { useState } from "react";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
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
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationLink,
} from "../../../shared/ui";
import {
  Delete02Icon,
  Calendar03Icon,
} from "@hugeicons/core-free-icons";
import { AppIcon } from "../../../components/common/AppIcon";
import {
  MeasurementViewModel,
  TrackingMetricType,
} from "../types/tracking.types";
import { METRIC_DEFINITIONS } from "../config/metric-definitions";
import { useDeleteMeasurement } from "../hooks/useDeleteMeasurement";

interface MeasurementRecordsProps {
  items: MeasurementViewModel[];
  selectedMetric: TrackingMetricType;
  page: number;
  totalPages: number;
  total: number;
  onPageChange: (page: number) => void;
  onAddReading: () => void;
}

export function MeasurementRecords({
  items,
  selectedMetric,
  page,
  totalPages,
  total,
  onPageChange,
  onAddReading,
}: MeasurementRecordsProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const deleteMutation = useDeleteMeasurement(() => setDeletingId(null));
  const config = METRIC_DEFINITIONS[selectedMetric];

  // Filter items matching the active metric
  const filteredItems = items.filter((it) => it.metricType === selectedMetric);

  if (filteredItems.length === 0) {
    return (
      <div className="p-8 text-center bg-[var(--surface-soft)]/40 border border-dashed border-[var(--border)] rounded-md space-y-2">
        <p className="text-xs font-bold text-[var(--foreground)]">
          No records found for {config.label}
        </p>
        <p className="text-[11px] text-[var(--muted-foreground)] max-w-sm mx-auto">
          No entries have been recorded under this metric for the current date scope.
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onAddReading}
          className="h-8 text-xs font-semibold border-[var(--border)] mt-2"
        >
          Add {config.shortLabel} reading
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Desktop Table View */}
      <div className="hidden sm:block rounded-md border border-[var(--border)] overflow-hidden bg-[var(--card)] shadow-2xs">
        <Table>
          <TableHeader className="bg-[var(--surface-soft)]/60">
            <TableRow className="border-[var(--border-subtle)] hover:bg-transparent">
              <TableHead className="text-[11px] font-bold text-[var(--muted-foreground)] uppercase tracking-wider py-2.5">
                Date & Time
              </TableHead>
              <TableHead className="text-[11px] font-bold text-[var(--muted-foreground)] uppercase tracking-wider py-2.5">
                Metric
              </TableHead>
              <TableHead className="text-[11px] font-bold text-[var(--muted-foreground)] uppercase tracking-wider py-2.5 text-right">
                Value
              </TableHead>
              <TableHead className="text-[11px] font-bold text-[var(--muted-foreground)] uppercase tracking-wider py-2.5">
                Unit
              </TableHead>
              <TableHead className="text-[11px] font-bold text-[var(--muted-foreground)] uppercase tracking-wider py-2.5">
                Observation Note
              </TableHead>
              <TableHead className="text-[11px] font-bold text-[var(--muted-foreground)] uppercase tracking-wider py-2.5 text-right w-[80px]">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredItems.map((item) => (
              <TableRow
                key={item.id}
                className="border-[var(--border-subtle)] hover:bg-[var(--surface-soft)]/40 transition-colors"
              >
                <TableCell className="text-xs font-medium py-2.5">
                  <div className="flex items-center gap-2">
                    <AppIcon icon={Calendar03Icon} size="xs" className="text-[var(--muted-foreground)]" />
                    <div>
                      <span className="font-semibold text-[var(--foreground)] block">
                        {item.formattedDate}
                      </span>
                      <span className="text-[10px] font-mono text-[var(--muted-foreground)]">
                        {item.formattedTime}
                      </span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-xs py-2.5 font-semibold text-[var(--foreground)]">
                  {METRIC_DEFINITIONS[item.metricType]?.shortLabel || item.metricType}
                </TableCell>
                <TableCell className="text-xs font-mono font-bold text-[var(--primary)] text-right py-2.5">
                  {item.formattedValue}
                </TableCell>
                <TableCell className="text-xs font-mono text-[var(--muted-foreground)] py-2.5">
                  {item.unit}
                </TableCell>
                <TableCell className="text-xs text-[var(--muted-foreground)] py-2.5 max-w-xs truncate">
                  {item.notes || <span className="text-[var(--border)]">—</span>}
                </TableCell>
                <TableCell className="text-right py-2.5">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        className="text-[var(--muted-foreground)] hover:text-[var(--destructive)]"
                        title="Delete reading"
                      >
                        <AppIcon icon={Delete02Icon} size="xs" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-[var(--card)] border border-[var(--border)]">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-base font-bold text-[var(--foreground)]">
                          Delete this measurement?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-xs text-[var(--muted-foreground)]">
                          This will remove the {item.formattedValue} {item.unit} entry recorded on {item.formattedDate} at {item.formattedTime} from your timeline.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="text-xs">Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteMutation.mutate(item.id)}
                          className="text-xs font-bold bg-[var(--destructive)] text-white hover:bg-[var(--destructive)]/90"
                        >
                          Delete Reading
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card List View */}
      <div className="sm:hidden space-y-2.5">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="p-3 rounded-md bg-[var(--card)] border border-[var(--border)] space-y-2 shadow-2xs"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs text-[var(--muted-foreground)]">
                <AppIcon icon={Calendar03Icon} size="xs" />
                <span className="font-semibold text-[var(--foreground)]">{item.formattedDate}</span>
                <span>·</span>
                <span className="font-mono text-[11px]">{item.formattedTime}</span>
              </div>
              <Badge variant="outline" className="text-[10px] font-mono border-[var(--border)]">
                {item.unit}
              </Badge>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-[var(--border-subtle)]">
              <div>
                <span className="text-[10px] uppercase font-bold text-[var(--muted-foreground)] block">
                  {METRIC_DEFINITIONS[item.metricType]?.shortLabel}
                </span>
                <span className="text-sm font-mono font-bold text-[var(--primary)]">
                  {item.formattedValue} {item.unit}
                </span>
              </div>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    className="text-[var(--muted-foreground)] hover:text-[var(--destructive)]"
                  >
                    <AppIcon icon={Delete02Icon} size="xs" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-[var(--card)] border border-[var(--border)]">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-base font-bold">
                      Delete measurement?
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-xs text-[var(--muted-foreground)]">
                      Remove the {item.formattedValue} {item.unit} entry from {item.formattedDate}.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="text-xs">Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => deleteMutation.mutate(item.id)}
                      className="text-xs font-bold bg-[var(--destructive)] text-white hover:bg-[var(--destructive)]/90"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>

            {item.notes && (
              <p className="text-[11px] text-[var(--muted-foreground)] italic bg-[var(--surface-soft)] p-2 rounded-sm">
                "{item.notes}"
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="pt-2 flex items-center justify-between text-xs text-[var(--muted-foreground)]">
          <span>
            Page {page} of {totalPages} ({total} total readings)
          </span>
          <Pagination className="justify-end w-auto mx-0">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => page > 1 && onPageChange(page - 1)}
                  className={`text-xs h-7 px-2 ${page <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}`}
                />
              </PaginationItem>
              <PaginationItem>
                <PaginationLink className="text-xs h-7 w-7 font-mono font-bold bg-[var(--surface-soft)]">
                  {page}
                </PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationNext
                  onClick={() => page < totalPages && onPageChange(page + 1)}
                  className={`text-xs h-7 px-2 ${page >= totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}`}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}
