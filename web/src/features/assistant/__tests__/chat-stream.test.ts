import { describe, it, expect, vi, beforeEach } from "vitest";
import { streamChatMessage } from "../streaming/chat-stream";

describe("chat-stream SSE transport", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("decodes incoming SSE token chunks and calls onDone on [DONE]", async () => {
    const mockChunks = [
      "data: Hello\n\n",
      "data:  maternal\n\n",
      "data:  health!\n\n",
      "data: [DONE]\n\n",
    ];

    const encoder = new TextEncoder();
    let chunkIndex = 0;

    const mockReadableStream = new ReadableStream({
      pull(controller) {
        if (chunkIndex < mockChunks.length) {
          controller.enqueue(encoder.encode(mockChunks[chunkIndex]));
          chunkIndex++;
        } else {
          controller.close();
        }
      },
    });

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      body: mockReadableStream,
    });

    const onToken = vi.fn();
    const onDone = vi.fn();
    const onError = vi.fn();

    const result = await streamChatMessage(
      {
        conversationId: "conv-123",
        content: "What is glucose?",
      },
      { onToken, onDone, onError }
    );

    expect(onToken).toHaveBeenCalledTimes(3);
    expect(onToken).toHaveBeenNthCalledWith(1, "Hello");
    expect(onToken).toHaveBeenNthCalledWith(2, " maternal");
    expect(onToken).toHaveBeenNthCalledWith(3, " health!");
    expect(onDone).toHaveBeenCalledWith("Hello maternal health!");
    expect(result).toBe("Hello maternal health!");
    expect(onError).not.toHaveBeenCalled();
  });

  it("handles [ERROR: ...] payload and triggers onError callback", async () => {
    const mockChunks = [
      "data: Initial partial token\n\n",
      "data: [ERROR: Model generation failed]\n\n",
    ];

    const encoder = new TextEncoder();
    let chunkIndex = 0;

    const mockReadableStream = new ReadableStream({
      pull(controller) {
        if (chunkIndex < mockChunks.length) {
          controller.enqueue(encoder.encode(mockChunks[chunkIndex]));
          chunkIndex++;
        } else {
          controller.close();
        }
      },
    });

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      body: mockReadableStream,
    });

    const onToken = vi.fn();
    const onDone = vi.fn();
    const onError = vi.fn();

    await expect(
      streamChatMessage(
        {
          conversationId: "conv-123",
          content: "Test error query",
        },
        { onToken, onDone, onError }
      )
    ).rejects.toThrow("Model generation failed");

    expect(onToken).toHaveBeenCalledWith("Initial partial token");
    expect(onError).toHaveBeenCalled();
  });
});
