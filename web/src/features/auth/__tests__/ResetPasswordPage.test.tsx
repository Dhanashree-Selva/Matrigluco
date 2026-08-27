import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ResetPasswordPage from "../pages/ResetPasswordPage";
import { authApi } from "../api/auth.api";

vi.mock("../api/auth.api", () => ({
  authApi: {
    resetPassword: vi.fn(),
  },
}));

const createWrapper = (initialEntries = ["/reset-password?token=valid-test-token"]) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>
    </QueryClientProvider>
  );
};

describe("ResetPasswordPage", () => {
  it("renders error state when token is missing", () => {
    const Wrapper = createWrapper(["/reset-password"]);
    render(<ResetPasswordPage />, { wrapper: Wrapper });

    expect(screen.getByText(/reset link invalid or missing/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /request new reset link/i })).toBeInTheDocument();
  });

  it("renders reset password form when valid token is present", () => {
    const Wrapper = createWrapper(["/reset-password?token=valid-test-token"]);
    render(<ResetPasswordPage />, { wrapper: Wrapper });

    expect(screen.getByLabelText(/^new password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm new password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /update password/i })).toBeInTheDocument();
  });

  it("submits new password with token and shows success screen", async () => {
    vi.mocked(authApi.resetPassword).mockResolvedValue({
      message: "Password has been reset successfully.",
    });

    const Wrapper = createWrapper(["/reset-password?token=valid-test-token"]);
    render(<ResetPasswordPage />, { wrapper: Wrapper });

    fireEvent.change(screen.getByLabelText(/^new password/i), {
      target: { value: "NewSecurePassword123" },
    });
    fireEvent.change(screen.getByLabelText(/confirm new password/i), {
      target: { value: "NewSecurePassword123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /update password/i }));

    await waitFor(() => {
      expect(screen.getByText(/password updated successfully/i)).toBeInTheDocument();
      expect(screen.getByRole("link", { name: /sign in now/i })).toBeInTheDocument();
    });
  });
});
