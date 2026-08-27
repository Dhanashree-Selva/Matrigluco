import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import TrackingPage from "../TrackingPage";
import * as trackingApiModule from "../../api/tracking.api";

const mockApiResponse = {
  items: [
    {
      id: "meas-1",
      metric_type: "glucose",
      value_primary: 104,
      value_secondary: null,
      unit: "mg/dL",
      measured_at: "2026-08-18T08:15:00Z",
      source: "manual",
      notes: "Fasting morning",
      created_at: "2026-08-18T08:15:00Z",
    },
    {
      id: "meas-2",
      metric_type: "glucose",
      value_primary: 98,
      value_secondary: null,
      unit: "mg/dL",
      measured_at: "2026-08-17T08:00:00Z",
      source: "manual",
      notes: "Fasting",
      created_at: "2026-08-17T08:00:00Z",
    },
  ],
  total: 2,
  page: 1,
  page_size: 20,
  total_pages: 1,
};

function renderWithClient(ui: React.ReactElement) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={["/app/tracking"]}>
        {ui}
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe("TrackingPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders loaded tracking workspace with Temporal Lens, Signal Spine, and Canvas", async () => {
    vi.spyOn(trackingApiModule.trackingApi, "listMeasurements").mockResolvedValue(
      mockApiResponse
    );

    renderWithClient(<TrackingPage />);

    expect(await screen.findByText(/Health Tracking/i)).toBeInTheDocument();
    expect(screen.getByText(/Signal Spine/i)).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: /7D/i })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: /30D/i })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: /90D/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Add reading/i })).toBeInTheDocument();
  });

  it("switches to Records Twin View when Records toggle is clicked", async () => {
    vi.spyOn(trackingApiModule.trackingApi, "listMeasurements").mockResolvedValue(
      mockApiResponse
    );

    renderWithClient(<TrackingPage />);

    const recordsRadio = await screen.findByRole("radio", { name: /Records/i });
    fireEvent.click(recordsRadio);

    expect(screen.getByRole("table")).toBeInTheDocument();
    expect(screen.getByText(/Observation Note/i)).toBeInTheDocument();
  });
});
