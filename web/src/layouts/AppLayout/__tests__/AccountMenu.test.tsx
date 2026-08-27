import { describe, it, expect } from "vitest";
import { screen, fireEvent } from "@testing-library/react";
import { AccountMenu } from "../AccountMenu";
import { renderWithProviders } from "../../../test/render";

describe("AccountMenu Component", () => {
  it("opens menu dropdown on click and displays profile links", () => {
    renderWithProviders(<AccountMenu />);

    const button = screen.getByLabelText("User Account Menu");
    fireEvent.click(button);

    expect(screen.getByText("Profile & Demographics")).toBeInTheDocument();
    expect(screen.getByText("Security & Sessions")).toBeInTheDocument();
    expect(screen.getByText("Sign Out")).toBeInTheDocument();
  });
});
