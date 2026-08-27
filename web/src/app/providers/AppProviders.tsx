import { ReactNode } from "react";
import { AppErrorBoundary } from "../boundaries/AppErrorBoundary";
import { ThemeProvider } from "./ThemeProvider";
import { QueryProvider } from "./QueryProvider";
import { AuthProvider } from "./AuthProvider";

interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <AppErrorBoundary>
      <ThemeProvider defaultTheme="system" storageKey="matrigluco-theme">
        <QueryProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </QueryProvider>
      </ThemeProvider>
    </AppErrorBoundary>
  );
}
