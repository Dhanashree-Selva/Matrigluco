import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { AppLogo } from "../AppLogo";
import { AppBrand } from "../AppBrand";

describe("AppLogo Component", () => {
  it("renders SVG with default dimensions and decorative mode", () => {
    const { container } = render(<AppLogo />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute("viewBox", "0 0 48 48");
    expect(svg).toHaveAttribute("width", "32");
    expect(svg).toHaveAttribute("height", "32");
    expect(svg).toHaveAttribute("aria-hidden", "true");
  });

  it("supports custom size, class names, and accessible standalone role", () => {
    render(
      <AppLogo
        size={48}
        decorative={false}
        title="Matrigluco Platform Brand"
        className="text-[var(--primary)]"
      />
    );
    const svg = screen.getByRole("img");
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute("width", "48");
    expect(svg).toHaveClass("text-[var(--primary)]");
    expect(screen.getByText("Matrigluco Platform Brand")).toBeInTheDocument();
  });
});

describe("AppBrand Component", () => {
  it("renders composite logo with wordmark", () => {
    render(<AppBrand size={36} />);
    expect(screen.getByText("Matrigluco")).toBeInTheDocument();
  });

  it("supports hiding wordmark", () => {
    render(<AppBrand showWordmark={false} />);
    expect(screen.queryByText("Matrigluco")).not.toBeInTheDocument();
  });
});
