import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ThemeProvider, useTheme } from "../theme-provider";

function TestConsumer() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  return (
    <div>
      <span data-testid="theme-val">{theme}</span>
      <span data-testid="resolved-theme">{resolvedTheme}</span>
      <button onClick={() => setTheme("dark")}>Set Dark</button>
      <button onClick={() => setTheme("light")}>Set Light</button>
    </div>
  );
}

describe("ThemeProvider component", () => {
  it("defaults to light/system and allows toggling to dark", () => {
    render(
      <ThemeProvider defaultTheme="light">
        <TestConsumer />
      </ThemeProvider>
    );

    expect(screen.getByTestId("theme-val").textContent).toBe("light");

    fireEvent.click(screen.getByText("Set Dark"));
    expect(screen.getByTestId("theme-val").textContent).toBe("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);

    fireEvent.click(screen.getByText("Set Light"));
    expect(screen.getByTestId("theme-val").textContent).toBe("light");
    expect(document.documentElement.classList.contains("light")).toBe(true);
  });
});
