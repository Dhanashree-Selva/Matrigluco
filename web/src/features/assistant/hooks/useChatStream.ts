import { useState, useRef, useCallback, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../../../query/keys";
import { streamChatMessage } from "../streaming/chat-stream";
import {
  AssistantMessage,
  GenerationState,
} from "../types/assistant.types";
import { toast } from "../../../shared/ui";

interface SendMessageOptions {
  conversationId: string;
  content: string;
  useHealthContext?: boolean;
  resourceType?: string;
  resourceId?: string;
}

export function useChatStream() {
  const queryClient = useQueryClient();
  const [generationState, setGenerationState] = useState<GenerationState>("idle");
  const [activeStreamMessage, setActiveStreamMessage] = useState<AssistantMessage | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastOptions, setLastOptions] = useState<SendMessageOptions | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const stopGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setGenerationState("stopped");
    setActiveStreamMessage((prev) =>
      prev
        ? {
            ...prev,
            isStreaming: false,
            isStopped: true,
          }
        : null
    );
  }, []);

  const sendMessage = useCallback(
    async (options: SendMessageOptions) => {
      if (!options.content.trim() || !options.conversationId) return;

      // Abort any existing stream
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      const controller = new AbortController();
      abortControllerRef.current = controller;

      setLastOptions(options);
      setErrorMessage(null);
      setGenerationState("preparing");

      // Set transient placeholder message
      const streamId = `stream-${Date.now()}`;
      setActiveStreamMessage({
        id: streamId,
        conversationId: options.conversationId,
        role: "assistant",
        content: "",
        createdAt: new Date().toISOString(),
        isStreaming: true,
      });

      // Optimistically add user message to query cache
      const tempUserMsg: AssistantMessage = {
        id: `user-${Date.now()}`,
        conversationId: options.conversationId,
        role: "user",
        content: options.content,
        createdAt: new Date().toISOString(),
      };

      queryClient.setQueryData<AssistantMessage[]>(
        queryKeys.chatbot.messages(options.conversationId),
        (old = []) => [...old, tempUserMsg]
      );

      try {
        let hasReceivedFirstToken = false;

        await streamChatMessage(
          {
            conversationId: options.conversationId,
            content: options.content,
            useHealthContext: options.useHealthContext,
            resourceType: options.resourceType,
            resourceId: options.resourceId,
            signal: controller.signal,
          },
          {
            onToken: (token) => {
              if (!hasReceivedFirstToken) {
                hasReceivedFirstToken = true;
                setGenerationState("streaming");
              }
              setActiveStreamMessage((prev) =>
                prev ? { ...prev, content: prev.content + token } : null
              );
            },
            onDone: async (finalText) => {
              setGenerationState("idle");
              setActiveStreamMessage(null);
              abortControllerRef.current = null;

              // Refetch persisted messages from MySQL
              await queryClient.invalidateQueries({
                queryKey: queryKeys.chatbot.messages(options.conversationId),
              });
              await queryClient.invalidateQueries({
                queryKey: queryKeys.chatbot.conversations(),
              });
            },
            onError: (err, partialText) => {
              if (controller.signal.aborted) {
                // Aborted by user
                return;
              }
              setGenerationState("error");
              setErrorMessage(err.message || "Response could not be completed.");
              setActiveStreamMessage((prev) =>
                prev
                  ? {
                      ...prev,
                      content: partialText,
                      isStreaming: false,
                      isError: true,
                      errorMessage: err.message,
                    }
                  : null
              );
              abortControllerRef.current = null;
            },
          }
        );
      } catch (err: any) {
        if (!controller.signal.aborted) {
          setGenerationState("error");
          setErrorMessage(err.message || "Stream connection failed");
        }
      }
    },
    [queryClient]
  );

  const retryLast = useCallback(async () => {
    if (lastOptions) {
      await sendMessage(lastOptions);
    }
  }, [lastOptions, sendMessage]);

  const clearActiveStream = useCallback(() => {
    setActiveStreamMessage(null);
    setGenerationState("idle");
    setErrorMessage(null);
  }, []);

  return {
    generationState,
    isGenerating: generationState === "preparing" || generationState === "streaming",
    isPreparing: generationState === "preparing",
    isStreaming: generationState === "streaming",
    isStopped: generationState === "stopped",
    isError: generationState === "error",
    errorMessage,
    activeStreamMessage,
    sendMessage,
    stopGeneration,
    retryLast,
    clearActiveStream,
  };
}
