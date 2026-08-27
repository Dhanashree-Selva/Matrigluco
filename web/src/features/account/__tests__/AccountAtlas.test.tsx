import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AccountAtlas } from "../components/AccountAtlas";

describe("AccountAtlas Component", () => {
  it("renders all three account control domains with descriptive metadata", () => {
    render(
      <MemoryRouter initialEntries={["/app/account/profile"]}>
        <AccountAtlas />
      </MemoryRouter>
    );

    expect(screen.getByRole("link", { name: /profile/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /preferences/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /security/i })).toBeInTheDocument();

    expect(
      screen.getByText(/identity and personal care context/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/notifications and ai context permissions/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/password, sessions, and data controls/i)
    ).toBeInTheDocument();
  });
});
