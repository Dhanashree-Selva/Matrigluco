import { describe, it, expect } from "vitest";
import { mapDashboardData } from "../mappers/dashboard.mapper";
import { DashboardSummaryResponseDTO } from "../types/dashboard.types";
import { UserProfile } from "../../../types/auth";

describe("dashboard.mapper", () => {
  const mockUser: UserProfile = {
    id: "user-123",
    email: "sarah@example.com",
    full_name: "Sarah Johnson",
    pregnancy_week: 24,
    created_at: "2026-01-01T00:00:00Z",
  };

  it("maps empty DTO to first-time user onboarding narrative without fake values", () => {
    const emptyDto: DashboardSummaryResponseDTO = {
      latest_measurements: {},
      recent_prediction: null,
      trends: { seven_day: {}, thirty_day: {} },
      measurement_counts: { total_7_days: 0, total_30_days: 0 },
      upcoming_consultation: null,
    };

    const vm = mapDashboardData(emptyDto, mockUser, 24);

    expect(vm.hasData).toBe(false);
    expect(vm.healthHorizon.riskBand).toBe("Unknown");
    expect(vm.healthHorizon.title).toBe("Week 24 Maternal Care Overview");
    expect(vm.nextAction.id).toBe("initial-assessment");
    expect(vm.nextAction.buttonLabel).toBe("Start Risk Assessment");
    expect(vm.signals).toHaveLength(4);
    expect(vm.signals.every((s) => s.isMissing)).toBe(true);
    expect(vm.trendPoints).toHaveLength(0);
  });

  it("maps populated DTO with authentic risk band and measurement counts", () => {
    const populatedDto: DashboardSummaryResponseDTO = {
      latest_measurements: {
        glucose: {
          metric_type: "glucose",
          value: 98,
          unit: "mg/dL",
          measured_at: new Date().toISOString(),
        },
        blood_pressure: {
          systolic: 118,
          diastolic: 76,
          unit: "mmHg",
          measured_at: new Date().toISOString(),
        },
        weight: {
          metric_type: "weight",
          value: 68.5,
          unit: "kg",
          measured_at: new Date().toISOString(),
        },
      },
      recent_prediction: {
        id: "pred-1",
        probability: 0.18,
        probability_score: 18.0,
        risk_band: "Low",
        prediction_result: "Standard Clinical GDM Model",
        created_at: new Date().toISOString(),
      },
      trends: {
        seven_day: {
          glucose: [
            { measured_at: "2026-08-15T08:00:00Z", value_primary: 95 },
            { measured_at: "2026-08-16T08:00:00Z", value_primary: 98 },
          ],
        },
      },
      measurement_counts: { total_7_days: 5, total_30_days: 18 },
      upcoming_consultation: null,
    };

    const vm = mapDashboardData(populatedDto, mockUser, 24);

    expect(vm.hasData).toBe(true);
    expect(vm.healthHorizon.riskBand).toBe("Low");
    expect(vm.signals.find((s) => s.id === "glucose")?.value).toBe(98);
    expect(vm.signals.find((s) => s.id === "glucose")?.isMissing).toBe(false);
    expect(vm.signals.find((s) => s.id === "blood_pressure")?.value).toBe("118/76");
    expect(vm.signals.find((s) => s.id === "weight")?.value).toBe(68.5);
    expect(vm.trendPoints).toHaveLength(2);
    expect(vm.trendPoints[0].value).toBe(95);
    expect(vm.trendPoints[1].value).toBe(98);
  });

  it("prioritizes upcoming consultation action when scheduled", () => {
    const dto: DashboardSummaryResponseDTO = {
      latest_measurements: {
        glucose: {
          metric_type: "glucose",
          value: 104,
          unit: "mg/dL",
          measured_at: new Date().toISOString(),
        },
      },
      recent_prediction: {
        id: "pred-1",
        probability: 0.45,
        probability_score: 45.0,
        risk_band: "Moderate",
        prediction_result: "Model v1",
        created_at: new Date().toISOString(),
      },
      measurement_counts: { total_7_days: 3, total_30_days: 12 },
      upcoming_consultation: {
        id: "c-1",
        doctor_name: "Dr. Rachel Green",
        appointment_date: "2026-08-25",
        appointment_time: "10:30 AM",
        status: "CONFIRMED",
      },
    };

    const vm = mapDashboardData(dto, mockUser, 24);

    expect(vm.nextAction.id).toBe("review-consultation");
    expect(vm.nextAction.buttonLabel).toBe("View Consultation");
    expect(vm.nextAction.path).toBe("/app/consultations/c-1");
  });
});
