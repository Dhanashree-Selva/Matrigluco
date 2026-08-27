import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { DateTimePicker } from "../DateTimePicker";

describe("DateTimePicker", () => {
  it("renders trigger button with formatted date and time", () => {
    const onChange = vi.fn();
    render(
      <DateTimePicker
        value="2026-08-18T12:09"
        onChange={onChange}
      />
    );

    expect(screen.getByLabelText("Select measurement date and time")).toBeInTheDocument();
    expect(screen.getByText(/Aug 18, 2026/i)).toBeInTheDocument();
    expect(screen.getByText(/12:09 PM/i)).toBeInTheDocument();
  });

  it("opens popover with compact Date & Time tabs and presets", async () => {
    const onChange = vi.fn();
    render(
      <DateTimePicker
        value="2026-08-18T12:09"
        onChange={onChange}
      />
    );

    const trigger = screen.getByLabelText("Select measurement date and time");
    fireEvent.click(trigger);

    const dateBtn = await screen.findByRole("button", { name: "Date" });
    const timeBtn = await screen.findByRole("button", { name: "Time" });
    expect(dateBtn).toBeInTheDocument();
    expect(timeBtn).toBeInTheDocument();

    fireEvent.click(timeBtn);

    expect(await screen.findByText(/Time Settings/i)).toBeInTheDocument();
    expect(screen.getByText(/Quick Presets/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Done/i })).toBeInTheDocument();
  });
});
