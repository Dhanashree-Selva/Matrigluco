import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AssessmentStateAlert } from "../AssessmentStateAlert";

describe("AssessmentStateAlert", () => {
  it("renders VALIDATION_MISMATCH alert with calm contract explanation and reference", () => {
    const handleRetry = vi.fn();
    render(
      <AssessmentStateAlert
        status="VALIDATION_MISMATCH"
        errorContext={{ requestId: "REQ-CONTRACT-99" }}
        onRetry={handleRetry}
      />
    );

    expect(screen.getByText("Assessment service mismatch")).toBeInTheDocument();
    expect(
      screen.getByText(/the application and assessment service currently expect different data/i)
    ).toBeInTheDocument();
    expect(screen.getByText("REQ-CONTRACT-99")).toBeInTheDocument();

    const retryBtn = screen.getByRole("button", { name: /retry submission/i });
    fireEvent.click(retryBtn);
    expect(handleRetry).toHaveBeenCalledTimes(1);
  });

  it("renders MODEL_UNAVAILABLE alert without fake local predictions", () => {
    render(<AssessmentStateAlert status="MODEL_UNAVAILABLE" />);

    expect(screen.getByText("Assessment model temporarily unavailable")).toBeInTheDocument();
    expect(screen.getByText(/no alternate or placeholder estimation will be substituted/i)).toBeInTheDocument();
  });

  it("renders NETWORK_INTERRUPTED alert with connection check prompt", () => {
    render(<AssessmentStateAlert status="NETWORK_INTERRUPTED" />);

    expect(screen.getByText("Network connection interrupted")).toBeInTheDocument();
  });

  it("renders BACKEND_UNAVAILABLE alert with preserved data reassurance", () => {
    render(<AssessmentStateAlert status="BACKEND_UNAVAILABLE" />);

    expect(screen.getByText("Assessment service unavailable")).toBeInTheDocument();
    expect(screen.getByText(/your clinical inputs are completely preserved/i)).toBeInTheDocument();
  });
});
