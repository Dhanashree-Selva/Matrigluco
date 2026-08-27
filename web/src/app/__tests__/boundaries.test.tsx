import { describe, it, expect, vi } from "vitest";
import { screen, fireEvent } from "@testing-library/react";
import { AppErrorBoundary } from "../boundaries/AppErrorBoundary";
import { RouteErrorBoundary } from "../boundaries/RouteErrorBoundary";
import { renderWithProviders } from "../../test/render";

function Bomb({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) {
    throw new Error("Simulated rendering explosion");
  }
  return <div>Safe content</div>;
}

describe("AppErrorBoundary", () => {
  it("renders safe content when no error occurs", () => {
    renderWithProviders(
      <AppErrorBoundary>
        <Bomb shouldThrow={false} />
      </AppErrorBoundary>
    );

    expect(screen.getByText("Safe content")).toBeInTheDocument();
  });

  it("catches rendering errors and displays recovery UI without crashing", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    renderWithProviders(
      <AppErrorBoundary>
        <Bomb shouldThrow={true} />
      </AppErrorBoundary>
    );

    expect(screen.getByText("Application encountered a critical error")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Reload Application/i })).toBeInTheDocument();

    consoleSpy.mockRestore();
  });
});

describe("RouteErrorBoundary", () => {
  it("renders route error message and triggers reset callback", () => {
    const handleReset = vi.fn();
    renderWithProviders(
      <RouteErrorBoundary
        error={new Error("Route failed")}
        resetErrorBoundary={handleReset}
      />
    );

    expect(screen.getByText("Something interrupted this section")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Try again/i }));
    expect(handleReset).toHaveBeenCalledTimes(1);
  });
});
