import { describe, it, expect } from "vitest";
import {
  mapApiToHistoryEventVM,
  groupEventsIntoChronicle,
  buildChronicleIndexMonths,
} from "../history.mapper";
import { HistoryEventDto } from "../../types/history.types";

describe("history.mapper", () => {
  it("maps assessment event DTO to HistoryEventVM correctly", () => {
    const dto: HistoryEventDto = {
      id: "assessment-123",
      type: "assessment",
      occurred_at: "2026-08-18T10:30:00Z",
      resource_id: "123",
      title: "Risk Assessment — Moderate Risk",
      summary: "Calculated Risk Probability: 34%",
      status: "moderate",
      details: {
        probability_score: 0.34,
        model_version: "v1.0.0",
      },
    };

    const vm = mapApiToHistoryEventVM(dto);
    expect(vm.id).toBe("assessment-123");
    expect(vm.type).toBe("assessment");
    expect(vm.deepLink).toBe("/app/assessment/123");
    expect(vm.monthYearKey).toBe("2026-08");
    expect(vm.dateKey).toBe("2026-08-18");
  });

  it("maps measurement event DTO with tracking deep link", () => {
    const dto: HistoryEventDto = {
      id: "measurement-456",
      type: "measurement",
      occurred_at: "2026-08-17T08:15:00Z",
      resource_id: "456",
      title: "Glucose Reading",
      summary: "105 mg/dL",
      details: {
        metric_type: "glucose",
        value_primary: 105,
        unit: "mg/dL",
      },
    };

    const vm = mapApiToHistoryEventVM(dto);
    expect(vm.deepLink).toBe("/app/tracking");
    expect(vm.monthYearKey).toBe("2026-08");
    expect(vm.dateKey).toBe("2026-08-17");
  });

  it("groups events chronologically into months and date groups", () => {
    const events = [
      mapApiToHistoryEventVM({
        id: "ev-1",
        type: "assessment",
        occurred_at: "2026-08-18T10:00:00Z",
        resource_id: "1",
        title: "Assessment 1",
        details: {},
      }),
      mapApiToHistoryEventVM({
        id: "ev-2",
        type: "measurement",
        occurred_at: "2026-08-18T14:00:00Z",
        resource_id: "2",
        title: "Measurement 2",
        details: {},
      }),
      mapApiToHistoryEventVM({
        id: "ev-3",
        type: "report",
        occurred_at: "2026-07-20T09:00:00Z",
        resource_id: "3",
        title: "Report 3",
        details: {},
      }),
    ];

    const months = groupEventsIntoChronicle(events);
    expect(months.length).toBe(2);
    expect(months[0].monthKey).toBe("2026-08");
    expect(months[0].totalEvents).toBe(2);
    expect(months[0].dateGroups.length).toBe(1);
    expect(months[0].dateGroups[0].events.length).toBe(2);

    expect(months[1].monthKey).toBe("2026-07");
    expect(months[1].totalEvents).toBe(1);
  });

  it("builds chronicle index months list from available month strings", () => {
    const available = ["2026-08", "2026-07", "2026-06"];
    const indexMonths = buildChronicleIndexMonths(available);

    expect(indexMonths.length).toBe(3);
    expect(indexMonths[0].key).toBe("2026-08");
    expect(indexMonths[0].label).toBe("AUG");
    expect(indexMonths[0].year).toBe("2026");
    expect(indexMonths[0].hasData).toBe(true);
  });
});
