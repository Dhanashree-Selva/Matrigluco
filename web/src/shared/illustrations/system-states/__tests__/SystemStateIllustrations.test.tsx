import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import {
  MissingPathIllustration,
  AccessBoundaryIllustration,
  SessionBoundaryIllustration,
  InterruptedSignalIllustration,
  ServicePauseIllustration,
  OfflineBridgeIllustration,
  FeatureDormantIllustration,
  SystemStateIllustration,
} from "../index";

describe("System State SVG Illustrations", () => {
  it("renders MissingPathIllustration (404) with decorative attributes", () => {
    const { container } = render(<MissingPathIllustration size={300} />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute("aria-hidden", "true");
    expect(svg).toHaveAttribute("focusable", "false");
    expect(svg).toHaveAttribute("width", "300");
  });

  it("renders AccessBoundaryIllustration (403) with boundary petals", () => {
    const { container } = render(<AccessBoundaryIllustration size={250} />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute("aria-hidden", "true");
  });

  it("renders SessionBoundaryIllustration (401) with releasing segment", () => {
    const { container } = render(<SessionBoundaryIllustration />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute("aria-hidden", "true");
  });

  it("renders InterruptedSignalIllustration (500) with signal connector", () => {
    const { container } = render(<InterruptedSignalIllustration />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute("aria-hidden", "true");
  });

  it("renders ServicePauseIllustration (503) with suspended layer", () => {
    const { container } = render(<ServicePauseIllustration />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute("aria-hidden", "true");
  });

  it("renders OfflineBridgeIllustration with connector bridge", () => {
    const { container } = render(<OfflineBridgeIllustration />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute("aria-hidden", "true");
  });

  it("renders FeatureDormantIllustration with dormant segment", () => {
    const { container } = render(<FeatureDormantIllustration />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute("aria-hidden", "true");
  });

  it("SystemStateIllustration dispatches the correct SVG for each state kind", () => {
    const { container: c404 } = render(<SystemStateIllustration kind="not-found" />);
    expect(c404.querySelector("svg")).toBeInTheDocument();

    const { container: c403 } = render(<SystemStateIllustration kind="access-restricted" />);
    expect(c403.querySelector("svg")).toBeInTheDocument();

    const { container: c500 } = render(<SystemStateIllustration kind="unexpected-error" />);
    expect(c500.querySelector("svg")).toBeInTheDocument();

    const { container: cOffline } = render(<SystemStateIllustration kind="offline" />);
    expect(cOffline.querySelector("svg")).toBeInTheDocument();
  });
});
