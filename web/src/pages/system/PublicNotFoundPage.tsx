import { Link, useNavigate } from "react-router-dom";
import { AppBrand } from "../../shared/brand/AppBrand";
import { SystemStatePage } from "../../shared/system-state/SystemStatePage";
import { useDocumentTitle } from "../../shared/hooks/useDocumentTitle";
import { routePaths } from "../../app/router/route-paths";
import { Home01Icon, Login01Icon } from "@hugeicons/core-free-icons";

export default function PublicNotFoundPage() {
  useDocumentTitle("404 — Page Not Found");
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col justify-between">
      {/* Lightweight Public Top Header */}
      <header className="w-full border-b border-[var(--border)] bg-[var(--card)]/80 backdrop-blur-sm px-6 py-4 flex items-center justify-between">
        <Link to={routePaths.home} className="hover:opacity-90 transition-opacity">
          <AppBrand size={26} wordmarkClassName="text-base font-extrabold tracking-tight" />
        </Link>
        <Link
          to={routePaths.auth.login}
          className="text-xs font-bold text-[var(--primary)] hover:underline inline-flex items-center gap-1.5"
        >
          <span>Sign in</span>
        </Link>
      </header>

      {/* Main 404 System State Surface */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <SystemStatePage
          kind="not-found"
          headline="This path doesn't exist"
          description="We couldn't find the Matrigluco page you're looking for. The link may have changed or is no longer available."
          primaryAction={{
            label: "Go home",
            onClick: () => navigate(routePaths.home),
            variant: "default",
            icon: Home01Icon,
          }}
          secondaryAction={{
            label: "Sign in to account",
            onClick: () => navigate(routePaths.auth.login),
            variant: "outline",
            icon: Login01Icon,
          }}
        />
      </main>

      {/* Lightweight Footer */}
      <footer className="py-4 border-t border-[var(--border)] text-center text-xs text-[var(--muted-foreground)]">
        Matrigluco Clinical Intelligence & Maternal Health
      </footer>
    </div>
  );
}
