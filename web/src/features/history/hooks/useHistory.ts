import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { queryKeys } from "../../../query/keys";
import { historyApi, GetHistoryParams } from "../api/history.api";
import {
  HistoryFilterState,
  HistoryEventVM,
  ChronicleMonthVM,
  ChronicleIndexMonth,
} from "../types/history.types";
import {
  mapApiToHistoryEventVM,
  groupEventsIntoChronicle,
  buildChronicleIndexMonths,
} from "../mappers/history.mapper";
import { ALL_HISTORY_SOURCES } from "../config/history-sources.config";

export function useHistory(filters: HistoryFilterState) {
  const [page, setPage] = useState<number>(1);
  const pageSize = 50;

  const queryParams: GetHistoryParams = useMemo(() => {
    const isAllTypes =
      filters.types.length === ALL_HISTORY_SOURCES.length ||
      filters.types.length === 0;

    return {
      types: isAllTypes ? undefined : filters.types.join(","),
      month: filters.month,
      date_from: filters.dateFrom,
      date_to: filters.dateTo,
      page,
      page_size: pageSize,
    };
  }, [filters.types, filters.month, filters.dateFrom, filters.dateTo, page]);

  const query = useQuery({
    queryKey: queryKeys.history.list(queryParams as Record<string, unknown>),
    queryFn: async ({ signal }) => {
      return historyApi.getHistory(queryParams, signal);
    },
    staleTime: 30 * 1000,
  });

  const normalizedEvents: HistoryEventVM[] = useMemo(() => {
    if (!query.data?.items) return [];
    return query.data.items.map(mapApiToHistoryEventVM);
  }, [query.data?.items]);

  const chronicleMonths: ChronicleMonthVM[] = useMemo(() => {
    return groupEventsIntoChronicle(normalizedEvents);
  }, [normalizedEvents]);

  const indexMonths: ChronicleIndexMonth[] = useMemo(() => {
    return buildChronicleIndexMonths(query.data?.available_months || []);
  }, [query.data?.available_months]);

  const eventCounts = useMemo(() => {
    return (
      query.data?.event_counts || {
        assessment: 0,
        measurement: 0,
        report: 0,
        consultation: 0,
      }
    );
  }, [query.data?.event_counts]);

  return {
    events: normalizedEvents,
    chronicleMonths,
    indexMonths,
    eventCounts,
    total: query.data?.total || 0,
    totalPages: query.data?.total_pages || 1,
    page,
    setPage,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
