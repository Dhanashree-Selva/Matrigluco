import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import NotFoundPage from "../NotFoundPage";
import { renderWithProviders } from "../../test/render";

describe("NotFoundPage", () => {
  it("renders page not found title and navigation recovery beacon", () => {
    renderWithProviders(<NotFoundPage />);

    expect(screen.getByText("This path doesn't exist")).toBeInTheDocument();
    expect(screen.getByText("Return to Dashboard")).toBeInTheDocument();
  });
});
