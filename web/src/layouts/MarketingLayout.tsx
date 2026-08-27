import { ReactNode } from "react";

interface MarketingLayoutProps {
  children?: ReactNode;
}

export function MarketingLayout({ children }: MarketingLayoutProps) {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] transition-colors">
      {children}
    </div>
  );
}
