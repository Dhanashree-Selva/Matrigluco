import { ReactNode } from "react";
import Navigation from "../../components/Navigation";
import { useAuth } from "../../auth/useAuth";

interface AppShellProps {
  children?: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const { user } = useAuth();

  return (
    <div className="flex flex-col min-h-screen bg-[var(--background)] text-[var(--foreground)] transition-colors">
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6">
        {children}
      </main>

      {/* Global Navigation Shell */}
      {user && <Navigation />}
    </div>
  );
}
