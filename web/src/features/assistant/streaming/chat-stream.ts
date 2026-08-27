import { config } from "../../../app/config";
import { tokenStore } from "../../../services/http/token-store";
import { StreamCallbacks, StreamChatOptions } from "./chat-stream.types";

/**
 * Pure SSE streaming transport over HTTP fetch.
 * Reads token stream incrementally, accumulates text, dispatches callbacks,
 * and respects AbortSignal for user-requested stop actions.
 */
export async function streamChatMessage(
  options: StreamChatOptions,
  callbacks: StreamCallbacks
): Promise<string> {
  const token = tokenStore.getAccessToken();
  const endpoint = `${config.apiBaseUrl}/chatbot/conversations/${options.conversationId}/stream`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({
      content: options.content,
      use_health_context: options.useHealthContext ?? true,
      resource_type: options.resourceType || undefined,
      resource_id: options.resourceId || undefined,
    }),
    signal: options.signal,
  });

  if (!response.ok) {
    let errorText = `Generation failed (${response.status})`;
    try {
      const errJson = await response.json();
      errorText = errJson.detail || errJson.message || errorText;
    } catch {
      // Non-JSON response
    }
    const err = new Error(errorText);
    callbacks.onError(err, "");
    throw err;
  }

  if (!response.body) {
    const err = new Error("Streaming response body is unavailable");
    callbacks.onError(err, "");
    throw err;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder("utf-8");
  let accumulatedText = "";
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        const rawLine = line.replace(/\r$/, "");
        if (!rawLine.startsWith("data:")) continue;

        const dataContent = rawLine.replace(/^data:\s?/, "");
        if (dataContent.trim() === "[DONE]") {
          callbacks.onDone(accumulatedText);
          return accumulatedText;
        }

        if (dataContent.trim().startsWith("[ERROR:")) {
          const errorMsg =
            dataContent.trim().slice(7, -1).trim() ||
            "Generation error encountered";
          const err = new Error(errorMsg);
          callbacks.onError(err, accumulatedText);
          throw err;
        }

        accumulatedText += dataContent;
        callbacks.onToken(dataContent);
      }
    }

    callbacks.onDone(accumulatedText);
    return accumulatedText;
  } catch (err: any) {
    if (err.name === "AbortError") {
      return accumulatedText;
    }
    callbacks.onError(
      err instanceof Error ? err : new Error(String(err)),
      accumulatedText
    );
    throw err;
  } finally {
    try {
      reader.releaseLock();
    } catch {
      // Ignored
    }
  }
}
