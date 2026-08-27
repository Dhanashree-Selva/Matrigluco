import { TrackingMetricType } from "../config/metric-definitions";

export type { TrackingMetricType };

export type TemporalPeriod = "7d" | "30d" | "90d" | "custom";
export type TrackingViewMode = "chart" | "records";

export interface CustomDateRange {
  from?: Date;
  to?: Date;
}

export interface TrackingFilters {
  metric: TrackingMetricType;
  period: TemporalPeriod;
  dateRange?: CustomDateRange;
  viewMode: TrackingViewMode;
  page: number;
  pageSize: number;
}

export interface MeasurementViewModel {
  id: string;
  metricType: TrackingMetricType;
  valuePrimary: number;
  valueSecondary?: number | null;
  unit: string;
  measuredAt: string;
  notes?: string | null;
  source: string;
  createdAt: string;
  formattedValue: string;
  formattedTime: string;
  formattedDate: string;
}

export interface MeasurementGroup {
  dateKey: string;
  title: string;
  items: MeasurementViewModel[];
}

export interface ArithmeticTrendSummary {
  metricType: TrackingMetricType;
  unit: string;
  readingCount: number;
  latestValue?: number;
  latestSecondaryValue?: number;
  latestTimestamp?: string;
  previousValue?: number;
  valueDelta?: number;
  deltaDirection?: "higher" | "lower" | "same";
}

export interface HealthMeasurementApiItem {
  id: string;
  user_id?: string;
  pregnancy_profile_id?: string | null;
  metric_type: string;
  value_primary: number;
  value_secondary?: number | null;
  value?: number;
  unit: string;
  measured_at: string;
  source?: string;
  notes?: string | null;
  created_at: string;
}

export interface HealthMeasurementListApiResponse {
  items: HealthMeasurementApiItem[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface MeasurementCreateDto {
  metric_type: string;
  value_primary: number;
  value_secondary?: number | null;
  unit: string;
  measured_at?: string;
  pregnancy_profile_id?: string | null;
  notes?: string | null;
}
