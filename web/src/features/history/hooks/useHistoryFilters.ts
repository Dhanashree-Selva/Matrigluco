import { useSearchParams } from "react-router-dom";
import { useCallback, useMemo } from "react";
import {
  HistoryEventType,
  HistoryFilterState,
  HistoryViewMode,
} from "../types/history.types";
import { ALL_HISTORY_SOURCES } from "../config/history-sources.config";

export function useHistoryFilters() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Parse types from URL query params (e.g. ?types=assessment,report)
  const types = useMemo<HistoryEventType[]>(() => {
    const rawTypes = searchParams.get("types");
    if (!rawTypes) return ALL_HISTORY_SOURCES;
    const parsed = rawTypes
      .split(",")
      .map((t) => t.trim().toLowerCase())
      .filter((t): t is HistoryEventType =>
        ALL_HISTORY_SOURCES.includes(t as HistoryEventType)
      );
    return parsed.length > 0 ? parsed : ALL_HISTORY_SOURCES;
  }, [searchParams]);

  const month = searchParams.get("month") || undefined;
  const dateFrom = searchParams.get("from") || undefined;
  const dateTo = searchParams.get("to") || undefined;
  const viewMode: HistoryViewMode =
    (searchParams.get("view") as HistoryViewMode) === "events" ? "events" : "story";

  const filters: HistoryFilterState = useMemo(
    () => ({
      types,
      month,
      dateFrom,
      dateTo,
      viewMode,
    }),
    [types, month, dateFrom, dateTo, viewMode]
  );

  const setTypes = useCallback(
    (newTypes: HistoryEventType[]) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (
          newTypes.length === ALL_HISTORY_SOURCES.length ||
          newTypes.length === 0
        ) {
          next.delete("types");
        } else {
          next.set("types", newTypes.join(","));
        }
        next.set("page", "1");
        return next;
      });
    },
    [setSearchParams]
  );

  const setMonth = useCallback(
    (newMonth?: string) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (!newMonth) {
          next.delete("month");
        } else {
          next.set("month", newMonth);
        }
        // Clear custom range if month is explicitly chosen
        next.delete("from");
        next.delete("to");
        next.set("page", "1");
        return next;
      });
    },
    [setSearchParams]
  );

  const setDateRange = useCallback(
    (from?: string, to?: string) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (from) next.set("from", from);
        else next.delete("from");

        if (to) next.set("to", to);
        else next.delete("to");

        // Clear month preset if custom date range is set
        next.delete("month");
        next.set("page", "1");
        return next;
      });
    },
    [setSearchParams]
  );

  const setViewMode = useCallback(
    (mode: HistoryViewMode) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (mode === "story") next.delete("view");
        else next.set("view", mode);
        return next;
      });
    },
    [setSearchParams]
  );

  const resetFilters = useCallback(() => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete("types");
      next.delete("month");
      next.delete("from");
      next.delete("to");
      next.delete("view");
      next.set("page", "1");
      return next;
    });
  }, [setSearchParams]);

  const isFiltered = useMemo(() => {
    return (
      types.length < ALL_HISTORY_SOURCES.length ||
      Boolean(month) ||
      Boolean(dateFrom) ||
      Boolean(dateTo)
    );
  }, [types, month, dateFrom, dateTo]);

  return {
    filters,
    setTypes,
    setMonth,
    setDateRange,
    setViewMode,
    resetFilters,
    isFiltered,
  };
}
