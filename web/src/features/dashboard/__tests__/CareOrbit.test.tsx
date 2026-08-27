import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { CareOrbit } from "../components/CareOrbit";
import { CareOrbitNodeVM } from "../types/dashboard.types";
import {
  AiBrain01Icon,
  Activity02Icon,
  DocumentCodeIcon,
  SparklesIcon,
} from "@hugeicons/core-free-icons";

describe("CareOrbit", () => {
  const mockNodes: CareOrbitNodeVM[] = [
    { id: "assess", label: "Assess", sublabel: "Clinical GDM", path: "/prediction", icon: AiBrain01Icon, status: "current", active: true },
    { id: "track", label: "Track", sublabel: "Daily Telemetry", path: "/track", icon: Activity02Icon, status: "available", active: false },
    { id: "understand", label: "Understand", sublabel: "Reports", path: "/history", icon: DocumentCodeIcon, status: "available", active: false },
    { id: "ask", label: "Consult & Ask", sublabel: "Assistant", path: "/chat", icon: SparklesIcon, status: "available", active: false },
  ];

  it("renders 4 pillars with their respective labels and sublabels", () => {
    render(
      <MemoryRouter>
        <CareOrbit nodes={mockNodes} />
      </MemoryRouter>
    );

    expect(screen.getByText("Care Orbit")).toBeDefined();
    expect(screen.getByText("Assess")).toBeDefined();
    expect(screen.getByText("Track")).toBeDefined();
    expect(screen.getByText("Understand")).toBeDefined();
    expect(screen.getByText("Consult & Ask")).toBeDefined();
  });
});
