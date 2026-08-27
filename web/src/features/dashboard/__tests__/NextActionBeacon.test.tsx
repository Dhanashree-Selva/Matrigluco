import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { NextActionBeacon } from "../components/NextActionBeacon";
import { NextActionVM } from "../types/dashboard.types";
import { DropletIcon } from "@hugeicons/core-free-icons";

describe("NextActionBeacon", () => {
  const mockAction: NextActionVM = {
    id: "log-glucose",
    title: "Log Today's Glucose",
    description: "Record your fasting reading.",
    buttonLabel: "Log Glucose Reading",
    path: "/track",
    icon: DropletIcon,
    variant: "primary",
  };

  it("renders action title, description, and button label", () => {
    render(
      <MemoryRouter>
        <NextActionBeacon action={mockAction} />
      </MemoryRouter>
    );

    expect(screen.getByText("Log Today's Glucose")).toBeDefined();
    expect(screen.getByText("Record your fasting reading.")).toBeDefined();
    expect(screen.getByText("Log Glucose Reading")).toBeDefined();
  });
});
