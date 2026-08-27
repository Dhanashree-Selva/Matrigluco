import { ReactNode } from "react";
import { ThemeToggle } from "../components/theme/theme-toggle";

interface AuthLayoutProps {
  children?: ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen w-full bg-[var(--background)] text-[var(--foreground)] flex flex-col justify-between transition-colors relative p-4 sm:p-6">
      {/* Main Authentication Flow Container */}
      <main className="w-full flex-1 flex flex-col items-center justify-center z-10 py-4">
        {children}
      </main>

      {/* Minimal Footer */}
      <footer className="w-full py-2 shrink-0 text-center text-xs text-[var(--muted-foreground)] z-10">
        <p>Matrigluco Health Platform &bull; Evidence-Based Maternal Care Orbit</p>
      </footer>

      {/* Bottom-Right Theme Toggle */}
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50">
        <ThemeToggle />
      </div>
    </div>
  );
}
