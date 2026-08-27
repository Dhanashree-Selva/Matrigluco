import { useState } from "react";
import {
  AlertCircleIcon,
  RefreshIcon,
  InformationCircleIcon,
  AiBrain01Icon,
  Clock01Icon,
  SecurityCheckIcon,
  Folder01Icon,
} from "@hugeicons/core-free-icons";
import { AppIcon } from "../../../components/common/AppIcon";
import {
  Button,
  Badge,
  ScrollArea,
  Alert,
  AlertTitle,
  AlertDescription,
  Skeleton,
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetClose,
  SheetFooter,
} from "../../../shared/ui";
import { DashboardHeader } from "../components/DashboardHeader";
import { HealthHorizon } from "../components/HealthHorizon";
import { CareOrbit } from "../components/CareOrbit";
import { SignalStrip } from "../components/SignalStrip";
import { SignalFlowChart } from "../components/SignalFlowChart";
import { CareJourneyTimeline } from "../components/CareJourneyTimeline";
import { CareJourneyFlow } from "../components/CareJourneyFlow";
import { useDashboard } from "../hooks/useDashboard";
import { DashboardPeriod } from "../hooks/useDashboardPeriod";
import { useDocumentTitle } from "../../../shared/hooks/useDocumentTitle";

export default function DashboardPage() {
  useDocumentTitle("Dashboard");
  const [period, setPeriod] = useState<DashboardPeriod>("7d");
  const [selectedMetric, setSelectedMetric] = useState<string>("glucose");

  const { data, isLoading, isError, error, refetch, isFetching } = useDashboard(
    period,
    selectedMetric
  );

  const userName =
    data?.user?.full_name ||
    data?.user?.user_metadata?.full_name ||
    data?.user?.email?.split("@")[0] ||
    "Mama";

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-36 rounded-md" />
            <Skeleton className="h-8 w-64 rounded-md" />
            <Skeleton className="h-3 w-28 rounded-md" />
          </div>
          <Skeleton className="h-8 w-44 rounded-md" />
        </div>

        {/* Top Asymmetric Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <Skeleton className="lg:col-span-8 h-64 rounded-md" />
          <Skeleton className="lg:col-span-4 h-64 rounded-md" />
        </div>

        {/* Signals Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Skeleton className="h-24 rounded-md" />
          <Skeleton className="h-24 rounded-md" />
          <Skeleton className="h-24 rounded-md" />
          <Skeleton className="h-24 rounded-md" />
        </div>

        {/* Trend & Timeline Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <Skeleton className="lg:col-span-7 h-80 rounded-md" />
          <Skeleton className="lg:col-span-5 h-80 rounded-md" />
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="p-6 max-w-2xl mx-auto my-12 space-y-4">
        <Alert variant="destructive" className="border-[var(--color-danger)]/30 bg-[var(--color-danger-soft)] text-left">
          <AppIcon icon={AlertCircleIcon} size="sm" className="shrink-0 text-[var(--color-danger)] mt-0.5" />
          <AlertTitle className="text-sm font-bold">Unable to load health overview</AlertTitle>
          <AlertDescription className="text-xs text-[var(--muted-foreground)]">
            {(error as Error)?.message || "A network or server connectivity issue prevented loading your dashboard summary."}
          </AlertDescription>
        </Alert>

        <div className="text-center">
          <Button
            type="button"
            onClick={() => refetch()}
            className="bg-[var(--primary)] text-[var(--primary-foreground)] font-bold text-xs cursor-pointer inline-flex items-center gap-1.5"
          >
            <AppIcon icon={RefreshIcon} size="xs" className={isFetching ? "animate-spin" : ""} />
            <span>Try Again</span>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto text-left">
      {/* 1. Dashboard Context Header */}
      <DashboardHeader
        userName={userName}
        pregnancyWeek={data.pregnancyWeek}
        recencyText={data.healthHorizon.recencyText}
        period={period}
        onPeriodChange={setPeriod}
      />

      {/* 2. Top Asymmetric Row: Health Horizon (8 cols) + Care Orbit (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <HealthHorizon
          data={data.healthHorizon}
          className="lg:col-span-8 h-full flex flex-col justify-between"
        />
        <CareOrbit
          nodes={data.orbitNodes}
          className="lg:col-span-4 h-full"
        />
      </div>

      {/* 3. Signal Capsules Strip (4 key vital signals in size=sm Cards) */}
      <SignalStrip signals={data.signals} />

      {/* 4. Second Asymmetric Row: Trend Flow (7 cols) + Activity Timeline (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <SignalFlowChart
          points={data.trendPoints}
          metricName={selectedMetric}
          unit={data.trendMetricUnit}
          onMetricChange={setSelectedMetric}
          period={period}
          onPeriodChange={setPeriod}
          className="lg:col-span-7 h-full"
        />
        <CareJourneyTimeline
          events={data.recentActivity}
          className="lg:col-span-5 h-full"
        />
      </div>

      {/* 5. Product Journey Flow (Connecting tracking, assessment, reports, and consultations) */}
      <CareJourneyFlow
        hasAssessments={Boolean(data.healthHorizon?.riskBand && data.healthHorizon.riskBand !== "Unknown")}
        hasMeasurements={(data.measurementCounts?.total_7_days ?? 0) > 0}
        hasConsultations={Boolean(data.upcomingConsultation)}
      />

      {/* 6. Context Sheet for Supplementary Orientation */}
      <div className="pt-2 text-center sm:text-left">
        <Sheet>
          <SheetTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-xs text-[var(--muted-foreground)] hover:text-[var(--primary)] cursor-pointer inline-flex items-center gap-1.5 transition-colors"
            >
              <AppIcon icon={InformationCircleIcon} size="xs" />
              <span>How your care timeline & recency are calculated</span>
            </Button>
          </SheetTrigger>
          <SheetContent
            side="right"
            className="w-full sm:max-w-md p-6 bg-[var(--card)] border-l border-[var(--border)] flex flex-col justify-between shadow-xl"
          >
            <div className="space-y-5">
              {/* Sheet Header with Icon Avatar & Badge */}
              <SheetHeader className="p-0 space-y-2 border-b border-[var(--border-subtle)] pb-4 text-left">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-md bg-[var(--accent-soft)] text-[var(--primary)] flex items-center justify-center shrink-0">
                    <AppIcon icon={AiBrain01Icon} size="xs" />
                  </div>
                  <div>
                    <SheetTitle className="text-base font-bold text-[var(--foreground)]">
                      Care Orbit Architecture
                    </SheetTitle>
                    <SheetDescription className="text-xs text-[var(--muted-foreground)]">
                      Understanding telemetry recency, risk bands, and clinical privacy.
                    </SheetDescription>
                  </div>
                </div>
              </SheetHeader>

              {/* Structured Section Cards */}
              <ScrollArea className="h-[calc(100vh-210px)] pr-2 space-y-3.5">
                <div className="space-y-3">
                  {/* Card 1: Recency Calculation */}
                  <div className="p-3.5 rounded-md bg-[var(--surface-soft)]/70 border border-[var(--border-subtle)] space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md bg-[var(--card)] border border-[var(--border)] text-[var(--primary)] flex items-center justify-center shrink-0">
                          <AppIcon icon={Clock01Icon} size="xs" />
                        </div>
                        <h4 className="text-xs font-bold text-[var(--foreground)]">
                          Recency & Freshness Rules
                        </h4>
                      </div>
                      <Badge variant="outline" className="text-[10px] font-mono border-[var(--border)]">
                        24h Window
                      </Badge>
                    </div>
                    <p className="text-[11px] text-[var(--muted-foreground)] leading-relaxed pl-8">
                      Measurement timestamps are synchronized to your device time. Telemetry recorded within the last 24 hours is marked <strong className="text-[var(--foreground)] font-semibold">Fresh</strong> and actively updates your care horizon.
                    </p>
                  </div>

                  {/* Card 2: Clinical Risk Bands */}
                  <div className="p-3.5 rounded-md bg-[var(--surface-soft)]/70 border border-[var(--border-subtle)] space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md bg-[var(--card)] border border-[var(--border)] text-[var(--primary)] flex items-center justify-center shrink-0">
                          <AppIcon icon={SecurityCheckIcon} size="xs" />
                        </div>
                        <h4 className="text-xs font-bold text-[var(--foreground)]">
                          Calibrated Risk Bands
                        </h4>
                      </div>
                      <Badge variant="outline" className="text-[10px] font-mono border-[var(--border)]">
                        Deterministic ML
                      </Badge>
                    </div>
                    <p className="text-[11px] text-[var(--muted-foreground)] leading-relaxed pl-8">
                      Risk bands are generated by server-persisted machine learning estimators. The dashboard strictly displays immutable server outputs without modifying, interpolating, or guessing risk probabilities.
                    </p>
                  </div>

                  {/* Card 3: Data Privacy */}
                  <div className="p-3.5 rounded-md bg-[var(--surface-soft)]/70 border border-[var(--border-subtle)] space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md bg-[var(--card)] border border-[var(--border)] text-[var(--primary)] flex items-center justify-center shrink-0">
                          <AppIcon icon={Folder01Icon} size="xs" />
                        </div>
                        <h4 className="text-xs font-bold text-[var(--foreground)]">
                          Tenant Privacy Isolation
                        </h4>
                      </div>
                      <Badge variant="outline" className="text-[10px] font-mono border-[var(--border)]">
                        Secure Vault
                      </Badge>
                    </div>
                    <p className="text-[11px] text-[var(--muted-foreground)] leading-relaxed pl-8">
                      Your metabolic metrics, consultation logs, and medical document uploads remain encrypted at rest and in transit, isolated strictly within your authenticated user session.
                    </p>
                  </div>

                  {/* Notice Alert */}
                  <Alert className="p-3 bg-[var(--surface-soft)]/40 border border-[var(--border)]">
                    <AppIcon icon={AlertCircleIcon} size="xs" className="text-[var(--primary)] shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <AlertTitle className="text-xs font-bold text-[var(--foreground)]">
                        Educational Scope Notice
                      </AlertTitle>
                      <AlertDescription className="text-[11px] text-[var(--muted-foreground)] leading-relaxed">
                        Matrigluco provides educational awareness and telemetry organization. It is not an emergency triage service and does not substitute for clinical lab diagnostics.
                      </AlertDescription>
                    </div>
                  </Alert>
                </div>
              </ScrollArea>
            </div>

            {/* Footer */}
            <SheetFooter className="p-0 pt-4 border-t border-[var(--border-subtle)]">
              <SheetClose asChild>
                <Button className="w-full h-8 text-xs font-bold bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white shadow-2xs">
                  Close orientation
                </Button>
              </SheetClose>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
