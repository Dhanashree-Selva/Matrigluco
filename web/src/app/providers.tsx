import { ReactNode } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "../query/query-client";
import { AuthProvider } from "../auth/AuthProvider";
import { ThemeProvider } from "../components/theme/theme-provider";
import { AppErrorBoundary } from "./boundaries/AppErrorBoundary";
import { Toaster } from "../shared/ui";

interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <AppErrorBoundary>
      <ThemeProvider defaultTheme="system" storageKey="matrigluco-theme">
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            {children}
            <Toaster position="top-right" closeButton />
          </AuthProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </AppErrorBoundary>
  );
}
