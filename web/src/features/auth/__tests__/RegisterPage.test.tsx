import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import RegisterPage from "../pages/RegisterPage";
import { AuthContext } from "../../../auth/AuthContext";

const createWrapper = (mockRegister = vi.fn()) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  const authValue = {
    user: null,
    token: null,
    loading: false,
    login: vi.fn(),
    register: mockRegister,
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

describe("RegisterPage", () => {
  it("renders all registration fields", () => {
    const Wrapper = createWrapper();
    render(<RegisterPage />, { wrapper: Wrapper });

    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/create password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /create account/i })).toBeInTheDocument();
  });

  it("validates mismatched passwords", async () => {
    const Wrapper = createWrapper();
    render(<RegisterPage />, { wrapper: Wrapper });

    fireEvent.change(screen.getByLabelText(/full name/i), {
      target: { value: "Sarah Connor" },
    });
    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: "sarah@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/create password/i), {
      target: { value: "Password123" },
    });
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: "Different456" },
    });

    fireEvent.click(screen.getByRole("button", { name: /create account/i }));

    await waitFor(() => {
      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
    });
  });

  it("submits valid registration data", async () => {
    const mockRegister = vi.fn().mockResolvedValue({
      user: { id: 2, email: "sarah@example.com" },
      access_token: "mock-token",
    });
    const Wrapper = createWrapper(mockRegister);
    render(<RegisterPage />, { wrapper: Wrapper });

    fireEvent.change(screen.getByLabelText(/full name/i), {
      target: { value: "Sarah Connor" },
    });
    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: "sarah@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/create password/i), {
      target: { value: "Password123" },
    });
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: "Password123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /create account/i }));

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith({
        full_name: "Sarah Connor",
        email: "sarah@example.com",
        password: "Password123",
      });
    });
  });
});
