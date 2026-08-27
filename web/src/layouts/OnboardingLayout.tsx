import { ReactNode } from "react";
import { ThemeToggle } from "../components/theme/theme-toggle";

interface OnboardingLayoutProps {
  children?: ReactNode;
}

export function OnboardingLayout({ children }: OnboardingLayoutProps) {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col justify-between p-4 sm:p-6 transition-colors">
      <header className="flex justify-end p-2">
        <ThemeToggle />
      </header>

      <main className="w-full max-w-xl mx-auto flex-1 flex flex-col justify-center">
        {children}
      </main>

      <footer className="py-4 text-center text-xs text-[var(--muted-foreground)]">
        <p>Personalized maternal health onboarding.</p>
      </footer>
    </div>
  );
}
