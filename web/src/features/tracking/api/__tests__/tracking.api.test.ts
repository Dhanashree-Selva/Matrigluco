import { describe, it, expect, vi } from "vitest";
import { trackingApi } from "../tracking.api";
import * as clientModule from "../../../../services/http/client";

describe("trackingApi", () => {
  it("calls listMeasurements via GET /health-measurements with query parameters", async () => {
    const fakeResponse = {
      items: [],
      total: 0,
      page: 1,
      page_size: 20,
      total_pages: 1,
    };

    const spy = vi
      .spyOn(clientModule, "apiRequest")
      .mockResolvedValueOnce(fakeResponse);

    const params = { metric_type: "glucose", page: 1, page_size: 20 };
    const res = await trackingApi.listMeasurements(params);

    expect(spy).toHaveBeenCalledWith({
      url: "/health-measurements",
      method: "GET",
      params,
      signal: undefined,
    });
    expect(res.total).toBe(0);

    spy.mockRestore();
  });

  it("calls createMeasurement via POST /health-measurements", async () => {
    const fakeReading = {
      id: "meas-1",
      metric_type: "glucose",
      value_primary: 104,
      value_secondary: null,
      unit: "mg/dL",
      measured_at: "2026-08-18T08:15:00Z",
      created_at: "2026-08-18T08:15:00Z",
    };

    const spy = vi
      .spyOn(clientModule, "apiRequest")
      .mockResolvedValueOnce(fakeReading);

    const payload = {
      metric_type: "glucose",
      value_primary: 104,
      unit: "mg/dL",
    };

    const result = await trackingApi.createMeasurement(payload);

    expect(spy).toHaveBeenCalledWith({
      url: "/health-measurements",
      method: "POST",
      data: payload,
      signal: undefined,
    });
    expect(result.value_primary).toBe(104);

    spy.mockRestore();
  });

  it("calls deleteMeasurement via DELETE /health-measurements/:id", async () => {
    const spy = vi
      .spyOn(clientModule, "apiRequest")
      .mockResolvedValueOnce(undefined);

    await trackingApi.deleteMeasurement("meas-123");

    expect(spy).toHaveBeenCalledWith({
      url: "/health-measurements/meas-123",
      method: "DELETE",
      signal: undefined,
    });

    spy.mockRestore();
  });
});
