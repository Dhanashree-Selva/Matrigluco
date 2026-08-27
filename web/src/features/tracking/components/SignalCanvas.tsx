import {
  MeasurementViewModel,
  TrackingMetricType,
  TrackingViewMode,
  ArithmeticTrendSummary,
} from "../types/tracking.types";
import { MeasurementChart } from "./MeasurementChart";
import { MeasurementRecords } from "./MeasurementRecords";

interface SignalCanvasProps {
  items: MeasurementViewModel[];
  selectedMetric: TrackingMetricType;
  viewMode: TrackingViewMode;
  trend: ArithmeticTrendSummary;
  page: number;
  totalPages: number;
  total: number;
  onPageChange: (page: number) => void;
  onAddReading: () => void;
}

export function SignalCanvas({
  items,
  selectedMetric,
  viewMode,
  trend,
  page,
  totalPages,
  total,
  onPageChange,
  onAddReading,
}: SignalCanvasProps) {
  return (
    <section
      aria-label="Signal Canvas Visualization"
      className="p-5 sm:p-6 rounded-md bg-[var(--card)] border border-[var(--border)] shadow-xs min-h-[380px] flex flex-col justify-between"
    >
      {viewMode === "chart" ? (
        <MeasurementChart
          items={items}
          selectedMetric={selectedMetric}
          trend={trend}
          onAddReading={onAddReading}
        />
      ) : (
        <MeasurementRecords
          items={items}
          selectedMetric={selectedMetric}
          page={page}
          totalPages={totalPages}
          total={total}
          onPageChange={onPageChange}
          onAddReading={onAddReading}
        />
      )}
    </section>
  );
}
