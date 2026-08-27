import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { queryKeys } from "../../../query/keys";
import { trackingApi } from "../api/tracking.api";
import {
  TrackingFilters,
  MeasurementViewModel,
  MeasurementGroup,
  ArithmeticTrendSummary,
} from "../types/tracking.types";
import {
  mapApiToMeasurementViewModel,
  groupMeasurementsByLocalDate,
  calculateArithmeticTrend,
  getDateRangeBounds,
} from "../mappers/tracking.mapper";

export function useMeasurements(filters: TrackingFilters) {
  const { dateFrom, dateTo } = useMemo(
    () => getDateRangeBounds(filters.period, filters.dateRange),
    [filters.period, filters.dateRange]
  );

  const queryParams = useMemo(
    () => ({
      metric_type: filters.metric,
      date_from: dateFrom,
      date_to: dateTo,
      page: filters.page,
      page_size: filters.pageSize,
    }),
    [filters.metric, dateFrom, dateTo, filters.page, filters.pageSize]
  );

  const query = useQuery({
    queryKey: queryKeys.health.list(queryParams),
    queryFn: async ({ signal }) => {
      return trackingApi.listMeasurements(queryParams, signal);
    },
    staleTime: 30 * 1000,
  });

  const normalizedItems: MeasurementViewModel[] = useMemo(() => {
    if (!query.data?.items) return [];
    return query.data.items.map(mapApiToMeasurementViewModel);
  }, [query.data?.items]);

  const groups: MeasurementGroup[] = useMemo(() => {
    return groupMeasurementsByLocalDate(normalizedItems);
  }, [normalizedItems]);

  const trend: ArithmeticTrendSummary = useMemo(() => {
    return calculateArithmeticTrend(normalizedItems, filters.metric);
  }, [normalizedItems, filters.metric]);

  const total = query.data?.total || 0;
  const totalPages = query.data?.total_pages || 1;

  return {
    items: normalizedItems,
    groups,
    trend,
    total,
    page: filters.page,
    totalPages,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    isFetching: query.isFetching,
  };
}
