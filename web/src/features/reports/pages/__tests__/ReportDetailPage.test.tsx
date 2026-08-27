import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ReportDetailPage from "../ReportDetailPage";
import { reportsApi } from "../../api/reports.api";

vi.mock("../../api/reports.api", () => ({
  reportsApi: {
    getReportById: vi.fn(),
    downloadPrivateFileBlob: vi.fn(),
    updateReport: vi.fn(),
    deleteReport: vi.fn(),
  },
}));

describe("ReportDetailPage", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
    vi.clearAllMocks();
  });

  it("renders not found state when report is not found", async () => {
    vi.mocked(reportsApi.getReportById).mockRejectedValueOnce(new Error("404 Not Found"));

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={["/app/reports/non-existent"]}>
          <Routes>
            <Route path="/app/reports/:id" element={<ReportDetailPage />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );

    expect(await screen.findByText("This resource isn't available")).toBeInTheDocument();
    expect(screen.getByText("Return to Reports Vault")).toBeInTheDocument();
  });

  it("renders loaded report evidence split workspace", async () => {
    vi.mocked(reportsApi.getReportById).mockResolvedValueOnce({
      id: "rep-999",
      file_name: "Complete_Metabolic_Panel.pdf",
      extracted_values: {
        glucose: 104,
        hba1c: 5.5,
      },
      uploaded_at: "2026-08-17T15:00:00Z",
    });

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={["/app/reports/rep-999"]}>
          <Routes>
            <Route path="/app/reports/:id" element={<ReportDetailPage />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );

    expect(await screen.findByRole("heading", { name: "Complete_Metabolic_Panel.pdf" })).toBeInTheDocument();
    expect(screen.getByText("Extracted Biomarkers")).toBeInTheDocument();
    expect(screen.getByText("Provenance & Audit Trail")).toBeInTheDocument();
    expect(screen.getAllByText("Plasma Glucose").length).toBeGreaterThanOrEqual(1);
  });
});
