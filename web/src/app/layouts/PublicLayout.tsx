import { ReactNode } from "react";

interface PublicLayoutProps {
  children?: ReactNode;
}

export function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col justify-between transition-colors">
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
