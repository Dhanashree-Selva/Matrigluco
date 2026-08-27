import { describe, it, expect } from "vitest";
import {
  mapApiToMeasurementViewModel,
  groupMeasurementsByLocalDate,
  calculateArithmeticTrend,
  getDateRangeBounds,
} from "../tracking.mapper";
import { HealthMeasurementApiItem, MeasurementViewModel } from "../../types/tracking.types";

describe("tracking.mapper", () => {
  it("normalizes snake_case API payload into MeasurementViewModel", () => {
    const apiItem: HealthMeasurementApiItem = {
      id: "meas-123",
      metric_type: "glucose",
      value_primary: 104,
      value_secondary: null,
      unit: "mg/dL",
      measured_at: "2026-08-18T08:15:00Z",
      source: "manual",
      notes: "Post-breakfast",
      created_at: "2026-08-18T08:15:00Z",
    };

    const vm = mapApiToMeasurementViewModel(apiItem);
    expect(vm.id).toBe("meas-123");
    expect(vm.metricType).toBe("glucose");
    expect(vm.valuePrimary).toBe(104);
    expect(vm.formattedValue).toBe("104");
    expect(vm.unit).toBe("mg/dL");
  });

  it("formats dual-value blood pressure formattedValue as systolic / diastolic", () => {
    const apiItem: HealthMeasurementApiItem = {
      id: "meas-bp-1",
      metric_type: "blood_pressure",
      value_primary: 122,
      value_secondary: 82,
      unit: "mmHg",
      measured_at: "2026-08-18T08:15:00Z",
      created_at: "2026-08-18T08:15:00Z",
    };

    const vm = mapApiToMeasurementViewModel(apiItem);
    expect(vm.formattedValue).toBe("122 / 82");
    expect(vm.unit).toBe("mmHg");
  });

  it("groups measurements chronologically into distinct local date buckets", () => {
    const items: MeasurementViewModel[] = [
      {
        id: "1",
        metricType: "glucose",
        valuePrimary: 100,
        unit: "mg/dL",
        measuredAt: new Date().toISOString(),
        source: "manual",
        createdAt: new Date().toISOString(),
        formattedValue: "100",
        formattedTime: "08:00 AM",
        formattedDate: "Today",
      },
      {
        id: "2",
        metricType: "glucose",
        valuePrimary: 95,
        unit: "mg/dL",
        measuredAt: new Date(Date.now() - 86400000).toISOString(),
        source: "manual",
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        formattedValue: "95",
        formattedTime: "08:00 AM",
        formattedDate: "Yesterday",
      },
    ];

    const groups = groupMeasurementsByLocalDate(items);
    expect(groups.length).toBe(2);
    expect(groups[0].title).toBe("Today");
    expect(groups[1].title).toBe("Yesterday");
  });

  it("calculates arithmetic trend without generating synthetic clinical advice", () => {
    const items: MeasurementViewModel[] = [
      {
        id: "1",
        metricType: "glucose",
        valuePrimary: 95,
        unit: "mg/dL",
        measuredAt: "2026-08-10T08:00:00Z",
        source: "manual",
        createdAt: "2026-08-10T08:00:00Z",
        formattedValue: "95",
        formattedTime: "08:00 AM",
        formattedDate: "10 Aug",
      },
      {
        id: "2",
        metricType: "glucose",
        valuePrimary: 105,
        unit: "mg/dL",
        measuredAt: "2026-08-15T08:00:00Z",
        source: "manual",
        createdAt: "2026-08-15T08:00:00Z",
        formattedValue: "105",
        formattedTime: "08:00 AM",
        formattedDate: "15 Aug",
      },
    ];

    const trend = calculateArithmeticTrend(items, "glucose");
    expect(trend.readingCount).toBe(2);
    expect(trend.latestValue).toBe(105);
    expect(trend.previousValue).toBe(95);
    expect(trend.valueDelta).toBe(10);
    expect(trend.deltaDirection).toBe("higher");
  });

  it("computes ISO date bounds for 7d, 30d, and 90d presets", () => {
    const bounds7d = getDateRangeBounds("7d");
    expect(bounds7d.dateFrom).toBeDefined();
    expect(bounds7d.dateTo).toBeUndefined();

    const fromDate = new Date("2026-08-01");
    const toDate = new Date("2026-08-15");
    const boundsCustom = getDateRangeBounds("custom", { from: fromDate, to: toDate });
    expect(boundsCustom.dateFrom).toBe(fromDate.toISOString());
  });
});
