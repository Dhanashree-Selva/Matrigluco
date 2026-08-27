import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import RiskResultPage from "../RiskResultPage";
import * as assessmentHook from "../../hooks/useAssessmentResult";
import { AssessmentDetail } from "../../types/assessment.types";

const mockAssessment: AssessmentDetail = {
  id: "test-assessment-123",
  probability: 0.6438,
  probabilityScore: 0.6438,
  riskBand: "moderate",
  predictionResult: "Diabetes Risk",
  source: "manual",
  model: {
    key: "diabetes-risk",
    version: "1.0.0",
    featureContractVersion: "1.0.0",
  },
  featuresSnapshot: {
    Pregnancies: 2,
    Glucose: 145,
    BloodPressure: 82,
    SkinThickness: 28,
    Insulin: 120,
    BMI: 29.4,
    DiabetesPedigreeFunction: 0.45,
    Age: 31,
  },
  containsImputedValues: false,
  mappingVersion: "1.0",
  createdAt: "2026-08-17T20:11:23.108702Z",
  disclaimer: "This algorithmic risk assessment is a research prototype.",
};

function renderWithRouter(initialEntry = "/app/assessment/test-assessment-123") {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialEntry]}>
        <Routes>
          <Route path="/app/assessment/:id" element={<RiskResultPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe("RiskResultPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders loading skeleton when assessment query is in loading state", () => {
    vi.spyOn(assessmentHook, "useAssessmentResult").mockReturnValue({
      assessment: undefined,
      isLoading: true,
      isError: false,
      error: null,
      refetch: vi.fn(),
      historyItems: [],
      isHistoryLoading: false,
    });

    const { container } = renderWithRouter();
    expect(container.querySelector(".animate-pulse")).toBeInTheDocument();
  });

  it("renders unavailable empty state when assessment is not found (404 / error)", () => {
    vi.spyOn(assessmentHook, "useAssessmentResult").mockReturnValue({
      assessment: undefined,
      isLoading: false,
      isError: true,
      error: new Error("Not Found"),
      refetch: vi.fn(),
      historyItems: [],
      isHistoryLoading: false,
    });

    renderWithRouter();
    expect(screen.getByText("This resource isn't available")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Try again/i })).toBeInTheDocument();
  });

  it("renders complete loaded result with Risk Horizon, Evidence Lens, and Care Path", () => {
    vi.spyOn(assessmentHook, "useAssessmentResult").mockReturnValue({
      assessment: mockAssessment,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
      historyItems: [
        {
          id: "prev-assessment-999",
          probability: 0.71,
          probabilityScore: 0.71,
          riskBand: "moderate",
          modelVersion: "1.0.0",
          createdAt: "2026-07-12T10:00:00Z",
        },
      ],
      isHistoryLoading: false,
    });

    renderWithRouter();

    // 1. Result Header
    expect(screen.getByRole("heading", { name: /Assessment Result/i })).toBeInTheDocument();

    // 2. Risk Horizon
    expect(screen.getByText(/Moderate risk estimate/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Model probability/i)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/64/i)[0]).toBeInTheDocument();

    // 3. Evidence Lens & Inputs
    expect(screen.getByRole("heading", { name: /Evidence Lens/i })).toBeInTheDocument();
    expect(screen.getByText(/145/i)).toBeInTheDocument(); // Glucose
    expect(screen.getByText(/29.4/i)).toBeInTheDocument(); // BMI

    // 4. Historical Trajectory comparison
    expect(screen.getByText(/Historical Trajectory/i)).toBeInTheDocument();
    expect(screen.getByText(/Previous Assessment/i)).toBeInTheDocument();

    // 5. Care Path
    expect(screen.getByText(/Care Path — What You Can Do Next/i)).toBeInTheDocument();
  });
});
