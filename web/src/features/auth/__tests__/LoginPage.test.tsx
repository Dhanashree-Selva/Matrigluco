import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import LoginPage from "../pages/LoginPage";
import { AuthContext } from "../../../auth/AuthContext";

const createWrapper = (mockLogin = vi.fn()) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  const authValue = {
    user: null,
    token: null,
    loading: false,
    login: mockLogin,
    register: vi.fn(),
    logout: vi.fn(),
    refreshUser: vi.fn(),
  };

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider value={authValue}>
        <BrowserRouter>{children}</BrowserRouter>
      </AuthContext.Provider>
    </QueryClientProvider>
  );
};

describe("LoginPage", () => {
  it("renders email and password inputs and sign-in button", () => {
    const Wrapper = createWrapper();
    render(<LoginPage />, { wrapper: Wrapper });

    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^sign in$/i })).toBeInTheDocument();
  });

  it("displays validation errors for invalid input", async () => {
    const Wrapper = createWrapper();
    render(<LoginPage />, { wrapper: Wrapper });

    const submitBtn = screen.getByRole("button", { name: /^sign in$/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/enter your email address/i)).toBeInTheDocument();
    });
  });

  it("calls login with entered credentials upon submission", async () => {
    const mockLogin = vi.fn().mockResolvedValue({
      user: { id: 1, email: "user@example.com", pregnancy_week: 12 },
      access_token: "mock-token",
    });
    const Wrapper = createWrapper(mockLogin);
    render(<LoginPage />, { wrapper: Wrapper });

    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: "user@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/^password/i), {
      target: { value: "Password123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /^sign in$/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith("user@example.com", "Password123");
    });
  });
});
