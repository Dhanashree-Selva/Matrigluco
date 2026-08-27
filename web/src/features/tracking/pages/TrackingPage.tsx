import { useState, useEffect, useCallback } from "react";
import {
  Alert,
  AlertTitle,
  AlertDescription,
  Button,
  TooltipProvider,
} from "../../../shared/ui";
import { AlertCircleIcon, RefreshIcon } from "@hugeicons/core-free-icons";
import { AppIcon } from "../../../components/common/AppIcon";
import { useDocumentTitle } from "../../../shared/hooks/useDocumentTitle";
import { useTrackingFilters } from "../hooks/useTrackingFilters";
import { useMeasurements } from "../hooks/useMeasurements";
import { TrackingMetricType } from "../types/tracking.types";
import { TrackingHeader } from "../components/TrackingHeader";
import { TemporalLens } from "../components/TemporalLens";
import { SignalSpine } from "../components/SignalSpine";
import { SignalCanvas } from "../components/SignalCanvas";
import { QuickAddReading } from "../components/QuickAddReading";
import { QuickCaptureCommand } from "../components/QuickCaptureCommand";
import { TrackingSkeleton } from "../components/TrackingSkeleton";

export default function TrackingPage() {
  useDocumentTitle("Health Tracking");

  const {
    filters,
    setMetric,
    setPeriod,
    setCustomDateRange,
    setViewMode,
    setPage,
  } = useTrackingFilters();

  const {
    items,
    groups,
    trend,
    total,
    page,
    totalPages,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useMeasurements(filters);

  // Quick Add modal & Command palette state
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [targetMetric, setTargetMetric] = useState<TrackingMetricType>(filters.metric);

  const handleOpenQuickAdd = useCallback((metric?: TrackingMetricType) => {
    setTargetMetric(metric || filters.metric);
    setIsQuickAddOpen(true);
  }, [filters.metric]);

  // Keyboard shortcut: 'a' or 'A' triggers Quick Add when not focused in input/textarea
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = document.activeElement?.tagName?.toLowerCase();
      if (
        activeTag === "input" ||
        activeTag === "textarea" ||
        activeTag === "select" ||
        (document.activeElement as HTMLElement)?.isContentEditable
      ) {
        return;
      }

      // 'a' or 'A' key shortcut
      if (e.key === "a" || e.key === "A") {
        if (!e.ctrlKey && !e.metaKey && !e.altKey) {
          e.preventDefault();
          handleOpenQuickAdd(filters.metric);
        }
      }

      // 'Ctrl+K' or 'Cmd+K' shortcut for Quick Action Command Palette
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsCommandOpen((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [filters.metric, handleOpenQuickAdd]);

  const periodLabel =
    filters.period === "7d"
      ? "Last 7 days"
      : filters.period === "30d"
      ? "Last 30 days"
      : filters.period === "90d"
      ? "Last 90 days"
      : "Custom Range";

  if (isLoading) {
    return (
      <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        <TrackingSkeleton />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        <Alert variant="destructive" className="bg-[var(--surface-soft)] border border-[var(--destructive)]/40 p-4">
          <AppIcon icon={AlertCircleIcon} size="sm" className="text-[var(--destructive)] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <AlertTitle className="text-sm font-bold text-[var(--foreground)]">
              Unable to load health telemetry
            </AlertTitle>
            <AlertDescription className="text-xs text-[var(--muted-foreground)] leading-relaxed">
              {error instanceof Error
                ? error.message
                : "An unexpected error occurred while communicating with the health recording service."}
            </AlertDescription>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="mt-3 text-xs font-semibold gap-1.5"
            >
              <AppIcon icon={RefreshIcon} size="xs" />
              <span>Retry connection</span>
            </Button>
          </div>
        </Alert>
      </div>
    );
  }

  return (
    <TooltipProvider delayDuration={0}>
      <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* 1. Header with Signal Summary Strip */}
        <TrackingHeader
          trend={trend}
          selectedMetric={filters.metric}
          periodLabel={periodLabel}
        />

        {/* 2. Unified Temporal Lens (Instrument Toolbar) */}
        <TemporalLens
          selectedMetric={filters.metric}
          onMetricChange={setMetric}
          selectedPeriod={filters.period}
          onPeriodChange={setPeriod}
          customRange={filters.dateRange}
          onCustomRangeChange={setCustomDateRange}
          viewMode={filters.viewMode}
          onViewModeChange={setViewMode}
          onOpenQuickAdd={handleOpenQuickAdd}
        />

        {/* 3. Asymmetric Studio Grid (Signal Spine + Signal Canvas) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Signal Spine (Chronological Timeline) */}
          <div className="lg:col-span-5 xl:col-span-4 order-2 lg:order-1">
            <SignalSpine
              groups={groups}
              selectedMetric={filters.metric}
              onSelectMetric={setMetric}
              onAddReading={() => handleOpenQuickAdd(filters.metric)}
            />
          </div>

          {/* Right Column: Signal Canvas (Chart / Records Twin View) */}
          <div className="lg:col-span-7 xl:col-span-8 order-1 lg:order-2">
            <SignalCanvas
              items={items}
              selectedMetric={filters.metric}
              viewMode={filters.viewMode}
              trend={trend}
              page={page}
              totalPages={totalPages}
              total={total}
              onPageChange={setPage}
              onAddReading={() => handleOpenQuickAdd(filters.metric)}
            />
          </div>
        </div>

        {/* Quick Add Dialog/Drawer */}
        <QuickAddReading
          isOpen={isQuickAddOpen}
          onClose={() => setIsQuickAddOpen(false)}
          initialMetric={targetMetric}
        />

        {/* Quick Capture Command Palette */}
        <QuickCaptureCommand
          isOpen={isCommandOpen}
          onClose={() => setIsCommandOpen(false)}
          onSelectMetric={(m) => {
            handleOpenQuickAdd(m);
          }}
        />
      </div>
    </TooltipProvider>
  );
}
