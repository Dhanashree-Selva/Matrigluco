import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { AppSidebar } from "../AppSidebar";
import { SidebarProvider } from "../../../shared/ui";
import { renderWithProviders } from "../../../test/render";

describe("CareRail / AppSidebar Component", () => {
  it("renders core destinations and sets aria-current on active link", () => {
    renderWithProviders(
      <SidebarProvider defaultOpen={true}>
        <AppSidebar />
      </SidebarProvider>,
      { initialEntries: ["/app/dashboard"] }
    );

    expect(screen.getByText("Matrigluco")).toBeInTheDocument();
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Track")).toBeInTheDocument();
    expect(screen.getByText("Assess")).toBeInTheDocument();
    expect(screen.getByText("History")).toBeInTheDocument();
    expect(screen.getByText("Reports")).toBeInTheDocument();
    expect(screen.getByText("Assistant")).toBeInTheDocument();

    const homeLink = screen.getByRole("link", { name: /home/i });
    expect(homeLink).toHaveAttribute("aria-current", "page");
  });
});
