import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import DashboardPage from "../pages/DashboardPage";
import * as useDashboardModule from "../hooks/useDashboard";
import { DashboardViewModel } from "../types/dashboard.types";
import { AiBrain01Icon, DropletIcon } from "@hugeicons/core-free-icons";

vi.mock("../hooks/useDashboard");

describe("DashboardPage", () => {
  const mockViewModel: DashboardViewModel = {
    user: {
      id: "u-1",
      email: "sarah@example.com",
      full_name: "Sarah Johnson",
      pregnancy_week: 24,
      created_at: "2026-01-01T00:00:00Z",
    },
    pregnancyWeek: 24,
    healthHorizon: {
      eyebrow: "Health Overview",
      title: "Week 24 Maternal Care Overview",
      narrative: "Your clinical assessment indicates Low risk band.",
      riskBand: "Low",
      recencyText: "Assessed 1d ago",
      primaryAction: {
        id: "act-1",
        title: "Log Fasting Glucose",
        description: "Record morning reading.",
        buttonLabel: "Log Glucose",
        path: "/track",
        icon: DropletIcon,
        variant: "primary",
      },
    },
    nextAction: {
      id: "act-1",
      title: "Log Fasting Glucose",
      description: "Record morning reading.",
      buttonLabel: "Log Glucose",
      path: "/track",
      icon: DropletIcon,
      variant: "primary",
    },
    signals: [
      { id: "glucose", label: "Blood Glucose", value: 98, unit: "mg/dL", measuredAt: "2026-08-18", recencyText: "Today", isMissing: false, logPath: "/track" },
      { id: "blood_pressure", label: "Blood Pressure", value: "118/76", unit: "mmHg", measuredAt: "2026-08-18", recencyText: "Today", isMissing: false, logPath: "/track" },
      { id: "weight", label: "Maternal Weight", value: 68, unit: "kg", measuredAt: "2026-08-18", recencyText: "Today", isMissing: false, logPath: "/track" },
      { id: "hba1c", label: "HbA1c / Glycated", value: 5.4, unit: "%", measuredAt: "2026-08-18", recencyText: "Today", isMissing: false, logPath: "/track" },
    ],
    trendPoints: [],
    trendMetric: "glucose",
    trendMetricUnit: "mg/dL",
    recentActivity: [
      { id: "a-1", type: "assessment", title: "Assessment Complete", description: "Low risk result", timestamp: "2026-08-18", relativeTime: "1d ago", icon: AiBrain01Icon },
    ],
    upcomingConsultation: null,
    orbitNodes: [
      { id: "assess", label: "Assess", sublabel: "Low Risk", path: "/prediction", icon: AiBrain01Icon, status: "completed", active: true },
    ],
    measurementCounts: { total_7_days: 4, total_30_days: 12 },
    hasData: true,
  };

  it("renders loading skeleton when query is loading", () => {
    vi.spyOn(useDashboardModule, "useDashboard").mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
      refetch: vi.fn(),
      isFetching: false,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    const { container } = render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    );

    expect(container.querySelector(".animate-pulse")).toBeDefined();
  });

  it("renders error state when query fails", () => {
    vi.spyOn(useDashboardModule, "useDashboard").mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error("Network connection lost"),
      refetch: vi.fn(),
      isFetching: false,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    );

    expect(screen.getByText("Unable to load health overview")).toBeDefined();
    expect(screen.getByText("Network connection lost")).toBeDefined();
    expect(screen.getByText("Try Again")).toBeDefined();
  });

  it("renders complete loaded dashboard with signature sections", () => {
    vi.spyOn(useDashboardModule, "useDashboard").mockReturnValue({
      data: mockViewModel,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
      isFetching: false,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    );

    expect(screen.getByText(/Sarah Johnson/i)).toBeDefined();
    expect(screen.getByText("Week 24 Maternal Care Overview")).toBeDefined();
    expect(screen.getByText("Care Orbit")).toBeDefined();
    expect(screen.getByText("Blood Glucose")).toBeDefined();
    expect(screen.getByText("Metabolic Flow & Trends")).toBeDefined();
    expect(screen.getByText("Recent Care Activity")).toBeDefined();
    expect(screen.getByText("Product Care Journey")).toBeDefined();
  });
});
