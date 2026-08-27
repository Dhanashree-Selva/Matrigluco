import { describe, it, expect } from "vitest";
import { screen, fireEvent } from "@testing-library/react";
import { FaqSection } from "../FaqSection";
import { renderWithProviders } from "../../../../test/render";

describe("FaqSection Component", () => {
  it("renders questions and toggles answer visibility on click", () => {
    renderWithProviders(<FaqSection />);

    const questionButton = screen.getByText(
      "What does the gestational diabetes risk assessment mean?"
    );
    expect(questionButton).toBeInTheDocument();

    // Click to open accordion
    fireEvent.click(questionButton);

    expect(
      screen.getByText(/The assessment calculates an educational risk score/i)
    ).toBeInTheDocument();
  });
});
