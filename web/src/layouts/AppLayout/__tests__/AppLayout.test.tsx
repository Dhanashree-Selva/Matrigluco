import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { AppLayout } from "../AppLayout";
import { renderWithProviders } from "../../../test/render";

describe("AppLayout Workspace Shell", () => {
  it("renders desktop Care Rail, header, and main children", () => {
    renderWithProviders(
      <AppLayout title="Health Overview">
        <div>Workspace Body Content</div>
      </AppLayout>
    );

    expect(screen.getByText("Health Overview")).toBeInTheDocument();
    expect(screen.getByText("Workspace Body Content")).toBeInTheDocument();
    expect(screen.getAllByText("Matrigluco").length).toBeGreaterThan(0);
  });
});
