import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { ConfirmAction } from "../ConfirmAction";

describe("ConfirmAction Component", () => {
  it("opens alert dialog on trigger click and executes confirm callback", async () => {
    const handleConfirm = vi.fn().mockResolvedValue(undefined);

    render(
      <ConfirmAction
        trigger={(open) => <button onClick={open}>Delete Log</button>}
        title="Delete Measurement"
        description="Are you sure you want to delete this reading?"
        confirmLabel="Yes, Delete"
        onConfirm={handleConfirm}
      />
    );

    await act(async () => {
      fireEvent.click(screen.getByText("Delete Log"));
    });

    expect(screen.getByText("Delete Measurement")).toBeInTheDocument();
    expect(
      screen.getByText("Are you sure you want to delete this reading?")
    ).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(screen.getByText("Yes, Delete"));
    });

    expect(handleConfirm).toHaveBeenCalledTimes(1);
  });
});
