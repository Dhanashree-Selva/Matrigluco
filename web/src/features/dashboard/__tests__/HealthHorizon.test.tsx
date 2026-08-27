import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { HealthHorizon } from "../components/HealthHorizon";
import { HealthHorizonVM } from "../types/dashboard.types";
import { AiBrain01Icon } from "@hugeicons/core-free-icons";

describe("HealthHorizon", () => {
  const mockData: HealthHorizonVM = {
    eyebrow: "Health Overview",
    title: "Week 24 Maternal Care Overview",
    narrative: "Your clinical assessment indicates Low risk band. 5 readings logged this week.",
    riskBand: "Low",
    recencyText: "Assessed 2d ago",
    primaryAction: {
      id: "action-1",
      title: "Add Daily Glucose",
      description: "Record your fasting reading.",
      buttonLabel: "Log Reading",
      path: "/track",
      icon: AiBrain01Icon,
      variant: "primary",
    },
  };

  it("renders eyebrow, title, narrative, and risk band badge", () => {
    render(
      <MemoryRouter>
        <HealthHorizon data={mockData} />
      </MemoryRouter>
    );

    expect(screen.getByText("Health Overview")).toBeDefined();
    expect(screen.getByText("Week 24 Maternal Care Overview")).toBeDefined();
    expect(screen.getByText(/Your clinical assessment indicates Low risk band/i)).toBeDefined();
    expect(screen.getByText("Low Risk Band")).toBeDefined();
    expect(screen.getByText("Log Reading")).toBeDefined();
  });
});
