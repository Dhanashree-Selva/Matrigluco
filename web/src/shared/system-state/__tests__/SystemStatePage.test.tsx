import { describe, it, expect, vi } from "vitest";
import { screen, fireEvent } from "@testing-library/react";
import { SystemStatePage } from "../SystemStatePage";
import { renderWithProviders } from "../../../test/render";

describe("SystemStatePage", () => {
  it("renders with shadcn Empty foundation, code badge, and headline", () => {
    renderWithProviders(
      <SystemStatePage
        kind="not-found"
        codeLabel="ERROR 404"
        headline="This path doesn't exist"
        description="We couldn't find the Matrigluco page you're looking for."
      />
    );

    expect(screen.getByText("ERROR 404")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1, name: /this path doesn't exist/i })).toBeInTheDocument();
    expect(screen.getByText(/we couldn't find the matrigluco page/i)).toBeInTheDocument();
  });

  it("handles primary and secondary action clicks", () => {
    const handlePrimary = vi.fn();
    const handleSecondary = vi.fn();

    renderWithProviders(
      <SystemStatePage
        kind="unexpected-error"
        headline="Something interrupted this page"
        primaryAction={{
          label: "Try again now",
          onClick: handlePrimary,
        }}
        secondaryAction={{
          label: "Cancel back",
          onClick: handleSecondary,
        }}
      />
    );

    const primaryBtn = screen.getByRole("button", { name: /try again now/i });
    fireEvent.click(primaryBtn);
    expect(handlePrimary).toHaveBeenCalledTimes(1);

    const secondaryBtn = screen.getByRole("button", { name: /cancel back/i });
    fireEvent.click(secondaryBtn);
    expect(handleSecondary).toHaveBeenCalledTimes(1);
  });

  it("renders safe technical reference code when requestId is provided", () => {
    renderWithProviders(
      <SystemStatePage
        kind="unexpected-error"
        requestId="REQ-CLINICAL-8823"
      />
    );

    expect(screen.getByText("REQ-CLINICAL-8823")).toBeInTheDocument();
    expect(screen.getByLabelText("Copy reference code")).toBeInTheDocument();
  });
});
