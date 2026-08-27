import { useSearchParams } from "react-router-dom";
import { useCallback, useMemo } from "react";
import {
  TrackingMetricType,
  TemporalPeriod,
  TrackingViewMode,
  CustomDateRange,
  TrackingFilters,
} from "../types/tracking.types";
import { METRIC_DEFINITIONS } from "../config/metric-definitions";

export function useTrackingFilters(): {
  filters: TrackingFilters;
  setMetric: (metric: TrackingMetricType) => void;
  setPeriod: (period: TemporalPeriod) => void;
  setCustomDateRange: (range?: CustomDateRange) => void;
  setViewMode: (mode: TrackingViewMode) => void;
  setPage: (page: number) => void;
} {
  const [searchParams, setSearchParams] = useSearchParams();

  // 1. Metric filter (safe fallback to "glucose")
  const rawMetric = searchParams.get("metric") || "glucose";
  const metric: TrackingMetricType =
    rawMetric in METRIC_DEFINITIONS
      ? (rawMetric as TrackingMetricType)
      : "glucose";

  // 2. Period filter (safe fallback to "30d")
  const rawPeriod = searchParams.get("period") || "30d";
  const period: TemporalPeriod = ["7d", "30d", "90d", "custom"].includes(rawPeriod)
    ? (rawPeriod as TemporalPeriod)
    : "30d";

  // 3. View Mode ("chart" | "records")
  const rawView = searchParams.get("view") || "chart";
  const viewMode: TrackingViewMode = rawView === "records" ? "records" : "chart";

  // 4. Page
  const rawPage = Number(searchParams.get("page") || "1");
  const page = !isNaN(rawPage) && rawPage >= 1 ? rawPage : 1;
  const pageSize = 20;

  // Custom date bounds from URL if present
  const fromStr = searchParams.get("from");
  const toStr = searchParams.get("to");
  const customDateRange: CustomDateRange | undefined = useMemo(() => {
    if (period === "custom" && fromStr) {
      const from = new Date(fromStr);
      const to = toStr ? new Date(toStr) : undefined;
      return {
        from: !isNaN(from.getTime()) ? from : undefined,
        to: to && !isNaN(to.getTime()) ? to : undefined,
      };
    }
    return undefined;
  }, [period, fromStr, toStr]);

  const setMetric = useCallback(
    (newMetric: TrackingMetricType) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.set("metric", newMetric);
        next.set("page", "1"); // Reset pagination on metric switch
        return next;
      });
    },
    [setSearchParams]
  );

  const setPeriod = useCallback(
    (newPeriod: TemporalPeriod) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.set("period", newPeriod);
        next.set("page", "1");
        if (newPeriod !== "custom") {
          next.delete("from");
          next.delete("to");
        }
        return next;
      });
    },
    [setSearchParams]
  );

  const setCustomDateRange = useCallback(
    (range?: CustomDateRange) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.set("period", "custom");
        next.set("page", "1");
        if (range?.from) next.set("from", range.from.toISOString().split("T")[0]);
        if (range?.to) next.set("to", range.to.toISOString().split("T")[0]);
        return next;
      });
    },
    [setSearchParams]
  );

  const setViewMode = useCallback(
    (mode: TrackingViewMode) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.set("view", mode);
        return next;
      });
    },
    [setSearchParams]
  );

  const setPage = useCallback(
    (newPage: number) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.set("page", String(newPage));
        return next;
      });
    },
    [setSearchParams]
  );

  const filters: TrackingFilters = useMemo(
    () => ({
      metric,
      period,
      dateRange: customDateRange,
      viewMode,
      page,
      pageSize,
    }),
    [metric, period, customDateRange, viewMode, page, pageSize]
  );

  return {
    filters,
    setMetric,
    setPeriod,
    setCustomDateRange,
    setViewMode,
    setPage,
  };
}
