import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import HistoryPage from "../HistoryPage";

// Mock the history API
vi.mock("../../api/history.api", () => ({
  historyApi: {
    getHistory: vi.fn().mockResolvedValue({
      items: [
        {
          id: "assessment-1",
          type: "assessment",
          occurred_at: "2026-08-18T10:00:00Z",
          resource_id: "1",
          title: "Risk Assessment — Low Risk",
          summary: "Calculated Risk Probability: 12%",
          status: "low",
          details: { probability_score: 0.12, model_version: "v1.0" },
        },
        {
          id: "measurement-1",
          type: "measurement",
          occurred_at: "2026-08-18T08:00:00Z",
          resource_id: "2",
          title: "Glucose Reading",
          summary: "98 mg/dL",
          details: { metric_type: "glucose", value_primary: 98, unit: "mg/dL" },
        },
      ],
      total: 2,
      page: 1,
      page_size: 50,
      total_pages: 1,
      available_months: ["2026-08"],
      event_counts: {
        assessment: 1,
        measurement: 1,
        report: 0,
        consultation: 0,
      },
    }),
  },
}));

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{ui}</BrowserRouter>
    </QueryClientProvider>
  );
}

describe("HistoryPage", () => {
  it("renders History page title and components", async () => {
    renderWithProviders(<HistoryPage />);

    expect(screen.getByText("Health Chronicle")).toBeInTheDocument();
    expect(
      screen.getByText("A continuous chronological story of your risk assessments, daily readings, medical reports, and consultations.")
    ).toBeInTheDocument();
    expect(screen.getByText("Chronicle Index")).toBeInTheDocument();
  });
});
