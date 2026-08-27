import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import AssistantPage from "../pages/AssistantPage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { assistantApi } from "../api/assistant.api";

vi.mock("../../../app/providers/AuthProvider", () => ({
  useAuth: () => ({
    user: { id: "user-1", fullName: "Jane Doe", email: "jane@example.com" },
    isAuthenticated: true,
  }),
}));

describe("AssistantPage", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });

    vi.spyOn(assistantApi, "getReadiness").mockResolvedValue({
      status: "ready",
      dependencies: {
        ai: {
          status: "ready",
          model_version: "Llama-3-8B-Q4",
        },
      },
    });

    vi.spyOn(assistantApi, "getConversations").mockResolvedValue([
      {
        id: "conv-1",
        user_id: "user-1",
        title: "Initial Maternal Consultation",
        status: "active",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ]);

    vi.spyOn(assistantApi, "getMessages").mockResolvedValue([
      {
        id: "msg-1",
        conversation_id: "conv-1",
        role: "user",
        content: "What does my risk score mean?",
        created_at: new Date().toISOString(),
      },
      {
        id: "msg-2",
        conversation_id: "conv-1",
        role: "assistant",
        content: "Your risk score represents a statistical estimate based on maternal clinical markers [1].",
        sources: ["gdm_clinical_guidance"],
        created_at: new Date().toISOString(),
      },
    ]);
  });

  it("renders assistant header, context halo, and conversation dialogue", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AssistantPage />
        </BrowserRouter>
      </QueryClientProvider>
    );

    expect(screen.getByText("Matrigluco Assistant")).toBeInTheDocument();
    expect(screen.getByText(/Educational guidance · not a diagnosis/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Context:/i)[0]).toBeInTheDocument();

    // Check message rendering
    expect(await screen.findByText("What does my risk score mean?")).toBeInTheDocument();
    expect(
      await screen.findByText(/Your risk score represents a statistical estimate/i)
    ).toBeInTheDocument();
  });
});
