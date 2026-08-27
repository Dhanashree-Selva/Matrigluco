import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { HistoricalTrajectory } from "../HistoricalTrajectory";
import { AssessmentDetail, AssessmentHistoryItem } from "../../../types/assessment.types";

const currentAssessment: AssessmentDetail = {
  id: "curr-123",
  probability: 0.62,
  probabilityScore: 0.62,
  riskBand: "moderate",
  predictionResult: "Diabetes Risk",
  source: "manual",
  model: {
    key: "diabetes-risk",
    version: "1.0.0",
    featureContractVersion: "1.0.0",
  },
  featuresSnapshot: { Glucose: 140 },
  containsImputedValues: false,
  mappingVersion: "1.0",
  createdAt: "2026-08-17T20:00:00Z",
  disclaimer: "Disclaimer",
};

describe("HistoricalTrajectory", () => {
  it("renders Empty state when there are no previous assessments", () => {
    render(
      <MemoryRouter>
        <HistoricalTrajectory
          assessment={currentAssessment}
          historyItems={[]}
        />
      </MemoryRouter>
    );

    expect(screen.getByText(/No earlier assessments/i)).toBeInTheDocument();
    expect(
      screen.getByText(/This is your first stored assessment, so there is no previous result to compare yet/i)
    ).toBeInTheDocument();
  });

  it("renders side-by-side comparison with arithmetic percentage points delta", () => {
    const history: AssessmentHistoryItem[] = [
      {
        id: "prev-456",
        probability: 0.71,
        probabilityScore: 0.71,
        riskBand: "moderate",
        modelVersion: "1.0.0",
        createdAt: "2026-07-12T10:00:00Z",
      },
    ];

    render(
      <MemoryRouter>
        <HistoricalTrajectory
          assessment={currentAssessment}
          historyItems={history}
        />
      </MemoryRouter>
    );

    expect(screen.getByText(/Previous Assessment/i)).toBeInTheDocument();
    expect(screen.getByText(/Current Assessment/i)).toBeInTheDocument();
    expect(screen.getByText("71%")).toBeInTheDocument();
    expect(screen.getByText("62%")).toBeInTheDocument();
    // Delta: (0.62 - 0.71) * 100 = -9.0 percentage points
    expect(screen.getByText("-9 percentage points")).toBeInTheDocument();
  });

  it("renders Different Model Versions notice when compared versions differ", () => {
    const historyDifferentVersion: AssessmentHistoryItem[] = [
      {
        id: "prev-789",
        probability: 0.55,
        probabilityScore: 0.55,
        riskBand: "moderate",
        modelVersion: "0.9.0", // Different version
        createdAt: "2026-06-01T10:00:00Z",
      },
    ];

    render(
      <MemoryRouter>
        <HistoricalTrajectory
          assessment={currentAssessment}
          historyItems={historyDifferentVersion}
        />
      </MemoryRouter>
    );

    expect(screen.getByText("Different Model Versions:")).toBeInTheDocument();
  });
});
