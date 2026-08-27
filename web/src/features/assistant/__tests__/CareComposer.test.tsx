import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { CareComposer } from "../components/CareComposer";

describe("CareComposer", () => {
  it("allows typing and sends message on submit button click", () => {
    const onSend = vi.fn();
    const onStop = vi.fn();

    render(
      <CareComposer
        onSendMessage={onSend}
        onStopGeneration={onStop}
        isGenerating={false}
        isHealthContextConsented={false}
      />
    );

    const textarea = screen.getByPlaceholderText(
      /Ask a maternal health-education question…/i
    );
    fireEvent.change(textarea, { target: { value: "What is normal fasting sugar?" } });

    const sendBtn = screen.getByRole("button", { name: /Send message/i });
    expect(sendBtn).toBeEnabled();

    fireEvent.click(sendBtn);
    expect(onSend).toHaveBeenCalledWith("What is normal fasting sugar?");
  });

  it("shows stop button while generation is active", () => {
    const onSend = vi.fn();
    const onStop = vi.fn();

    render(
      <CareComposer
        onSendMessage={onSend}
        onStopGeneration={onStop}
        isGenerating={true}
        isHealthContextConsented={true}
      />
    );

    const stopBtn = screen.getByRole("button", { name: /Stop generating response/i });
    expect(stopBtn).toBeInTheDocument();

    fireEvent.click(stopBtn);
    expect(onStop).toHaveBeenCalledTimes(1);
  });
});
