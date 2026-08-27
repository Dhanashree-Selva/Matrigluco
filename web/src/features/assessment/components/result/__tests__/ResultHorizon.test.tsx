import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { TooltipProvider } from "../../../../../shared/ui";
import { ResultHorizon } from "../ResultHorizon";
import { AssessmentDetail } from "../../../types/assessment.types";

const baseAssessment: AssessmentDetail = {
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
  createdAt: "2026-08-17T20:11:23Z",
  disclaimer: "This algorithmic risk assessment is a research and educational prototype.",
};

describe("ResultHorizon", () => {
  it("renders risk band headline, formatted model probability, and non-diagnostic alert", () => {
    render(
      <TooltipProvider>
        <MemoryRouter>
          <ResultHorizon assessment={baseAssessment} />
        </MemoryRouter>
      </TooltipProvider>
    );

    expect(screen.getByText("Moderate risk estimate")).toBeInTheDocument();
    expect(screen.getByText("Model probability")).toBeInTheDocument();
    expect(screen.getByText("64.4%")).toBeInTheDocument();
    expect(screen.getByText(/Non-Diagnostic Medical Notice/i)).toBeInTheDocument();
  });

  it("renders low risk estimate styling when riskBand is low", () => {
    const lowAssessment: AssessmentDetail = {
      ...baseAssessment,
      probability: 0.22,
      probabilityScore: 0.22,
      riskBand: "low",
    };

    render(
      <TooltipProvider>
        <MemoryRouter>
          <ResultHorizon assessment={lowAssessment} />
        </MemoryRouter>
      </TooltipProvider>
    );

    expect(screen.getByText("Low risk estimate")).toBeInTheDocument();
    expect(screen.getByText("22%")).toBeInTheDocument();
  });

  it("renders high risk estimate styling when riskBand is high", () => {
    const highAssessment: AssessmentDetail = {
      ...baseAssessment,
      probability: 0.88,
      probabilityScore: 0.88,
      riskBand: "high",
    };

    render(
      <TooltipProvider>
        <MemoryRouter>
          <ResultHorizon assessment={highAssessment} />
        </MemoryRouter>
      </TooltipProvider>
    );

    expect(screen.getByText("High risk estimate")).toBeInTheDocument();
    expect(screen.getByText("88%")).toBeInTheDocument();
  });
});
