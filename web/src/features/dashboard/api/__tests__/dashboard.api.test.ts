import { describe, it, expect, vi } from "vitest";
import { dashboardApi } from "../dashboard.api";
import * as clientModule from "../../../../services/http/client";

describe("dashboardApi", () => {
  it("fetches consolidated dashboard summary and current user", async () => {
    const fakeUser = {
      id: "u-1",
      email: "patient@matrigluco.org",
      full_name: "Sarah Johnson",
      pregnancy_week: 24,
      is_active: true,
    };

    const fakeSummary = {
      latest_measurements: {
        glucose: {
          metric_type: "glucose",
          value: 98,
          unit: "mg/dL",
          measured_at: "2026-08-18T08:00:00Z",
        },
      },
      recent_prediction: {
        id: "pred-1",
        probability: 0.15,
        probability_score: 15.0,
        risk_band: "Low",
        prediction_result: "Standard GDM",
        created_at: "2026-08-18T00:00:00Z",
      },
      trends: {
        seven_day: {},
        thirty_day: {},
      },
      measurement_counts: {
        total_7_days: 4,
        total_30_days: 14,
      },
      upcoming_consultation: null,
    };

    const spy = vi
      .spyOn(clientModule, "apiRequest")
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .mockImplementation(async (config: any) => {
        if (config.url === "/auth/me") return fakeUser;
        if (config.url === "/dashboard/summary") return fakeSummary;
        return null;
      });

    const result = await dashboardApi.getSummary();

    expect(result.user?.email).toBe("patient@matrigluco.org");
    expect(result.summary.latest_measurements.glucose?.value).toBe(98);
    expect(result.summary.recent_prediction?.risk_band).toBe("Low");

    spy.mockRestore();
  });
});
