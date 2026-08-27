import { ReactNode } from "react";
import { SparklesIcon } from "@hugeicons/core-free-icons";
import { AppIcon } from "../../components/common/AppIcon";

interface AuthLayoutProps {
  children?: ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col justify-center items-center p-4 sm:p-6 transition-colors">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[var(--accent-soft)] text-[var(--primary)] text-xs font-bold uppercase tracking-wider">
            <AppIcon icon={SparklesIcon} size="xs" />
            <span>Matrigluco Maternal Care</span>
          </div>
        </div>

        {children}
      </div>
    </div>
  );
}
