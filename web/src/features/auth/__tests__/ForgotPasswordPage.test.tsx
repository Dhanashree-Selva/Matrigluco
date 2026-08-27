import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ForgotPasswordPage from "../pages/ForgotPasswordPage";
import { authApi } from "../api/auth.api";

vi.mock("../api/auth.api", () => ({
  authApi: {
    forgotPassword: vi.fn(),
  },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{children}</BrowserRouter>
    </QueryClientProvider>
  );
};

describe("ForgotPasswordPage", () => {
  it("renders email input and submit button", () => {
    const Wrapper = createWrapper();
    render(<ForgotPasswordPage />, { wrapper: Wrapper });

    expect(screen.getByLabelText(/account email/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /send reset instructions/i })).toBeInTheDocument();
  });

  it("submits request and shows non-enumerating success feedback", async () => {
    vi.mocked(authApi.forgotPassword).mockResolvedValue({
      message: "If an account matches that email address, password reset instructions will be sent.",
    });

    const Wrapper = createWrapper();
    render(<ForgotPasswordPage />, { wrapper: Wrapper });

    fireEvent.change(screen.getByLabelText(/account email/i), {
      target: { value: "patient@example.com" },
    });

    fireEvent.click(screen.getByRole("button", { name: /send reset instructions/i }));

    await waitFor(() => {
      expect(screen.getByText(/check your email/i)).toBeInTheDocument();
      expect(screen.getByText(/patient@example.com/i)).toBeInTheDocument();
    });
  });
});
