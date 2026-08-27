import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ReportsPage from "../ReportsPage";
import { reportsApi } from "../../api/reports.api";

vi.mock("../../api/reports.api", () => ({
  reportsApi: {
    getReports: vi.fn(),
    uploadPrivateFile: vi.fn(),
    saveReport: vi.fn(),
  },
}));

describe("ReportsPage", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
    vi.clearAllMocks();
  });

  it("renders empty state when no reports exist", async () => {
    vi.mocked(reportsApi.getReports).mockResolvedValueOnce([]);

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <ReportsPage />
        </BrowserRouter>
      </QueryClientProvider>
    );

    expect(await screen.findByText("Your Private Report Vault is Empty")).toBeInTheDocument();
    expect(screen.getByText("Medical Reports")).toBeInTheDocument();
  });

  it("renders list of reports when reports are returned", async () => {
    vi.mocked(reportsApi.getReports).mockResolvedValueOnce([
      {
        id: "rep-1",
        file_name: "OGTT_Report_Week26.pdf",
        extracted_values: { glucose: 135 },
        uploaded_at: "2026-08-17T12:00:00Z",
      },
    ]);

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <ReportsPage />
        </BrowserRouter>
      </QueryClientProvider>
    );

    expect(await screen.findByText("OGTT_Report_Week26.pdf")).toBeInTheDocument();
    expect(screen.getByText("Action Required • Verify Extracted Data")).toBeInTheDocument();
  });
});
