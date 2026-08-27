import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import VerifyEmailPage from "../pages/VerifyEmailPage";
import { authApi } from "../api/auth.api";

vi.mock("../api/auth.api", () => ({
  authApi: {
    verifyEmail: vi.fn(),
    resendVerification: vi.fn(),
  },
}));

const createWrapper = (initialEntries = ["/verify-email?token=valid-test-token"]) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>
    </QueryClientProvider>
  );
};

describe("VerifyEmailPage", () => {
  it("renders resend form when token is not present", () => {
    const Wrapper = createWrapper(["/verify-email"]);
    render(<VerifyEmailPage />, { wrapper: Wrapper });

    expect(screen.getByText(/verify your email address/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /resend verification email/i })).toBeInTheDocument();
  });

  it("verifies token when present and displays success state", async () => {
    vi.mocked(authApi.verifyEmail).mockResolvedValue({
      message: "Email address verified successfully.",
    });

    const Wrapper = createWrapper(["/verify-email?token=valid-test-token"]);
    render(<VerifyEmailPage />, { wrapper: Wrapper });

    await waitFor(() => {
      expect(screen.getByText(/email verified successfully/i)).toBeInTheDocument();
      expect(screen.getByRole("link", { name: /continue to sign in/i })).toBeInTheDocument();
    });
  });
});
