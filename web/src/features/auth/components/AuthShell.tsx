import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { AppLogo } from "../../../shared/brand/AppLogo";
import { routePaths } from "../../../app/route-paths";

export interface AuthShellProps {
  children: ReactNode;
  showBrandPanel?: boolean;
}

export function AuthShell({ children }: AuthShellProps) {
  return (
    <div className="w-full max-w-[420px] mx-auto flex flex-col items-center">
      {/* Brand Header */}
      <Link
        to={routePaths.home}
        className="inline-flex items-center gap-2.5 mb-4 font-black text-xl text-[var(--foreground)] hover:opacity-90 transition-opacity"
      >
        <AppLogo size={30} className="text-[var(--primary)] shrink-0" />
        <span>Matrigluco</span>
      </Link>

      {/* Centered Auth Card */}
      <div className="w-full p-6 rounded-md bg-[var(--card)] border border-[var(--border)] shadow-md">
        {children}
      </div>
    </div>
  );
}
