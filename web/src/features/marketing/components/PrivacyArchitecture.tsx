import { SecurityCheckIcon } from "@hugeicons/core-free-icons";
import { AppIcon } from "../../../components/common/AppIcon";

export function PrivacyArchitecture() {
  return (
    <section id="privacy" className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
      <div className="space-y-4 text-center max-w-2xl mx-auto mb-14">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[var(--accent-soft)] text-[var(--primary)] text-xs font-bold uppercase tracking-wider">
          <AppIcon icon={SecurityCheckIcon} size="xs" />
          <span>System Architecture</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-[var(--foreground)] tracking-tight">
          Private, decoupled architecture by design.
        </h2>
        <p className="text-sm text-[var(--muted-foreground)]">
          Your browser communicates exclusively with authenticated FastAPI services.
          Medical telemetry and account records are protected behind strict server-side boundary controls.
        </p>
      </div>

      {/* Architecture Flow Diagram */}
      <div className="p-8 sm:p-10 rounded-md bg-[var(--card)] border border-[var(--border)] shadow-lg space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
          {/* Node 1: Client */}
          <div className="p-5 rounded-md bg-[var(--surface-soft)] border border-[var(--border-subtle)] space-y-2">
            <p className="text-xs font-bold text-[var(--primary)] uppercase tracking-wider">Client Layer</p>
            <p className="text-sm font-bold text-[var(--foreground)]">React 19 + TypeScript</p>
            <p className="text-[11px] text-[var(--muted-foreground)]">Care Orbit UI in your browser</p>
          </div>

          {/* Node 2: API Gateway */}
          <div className="p-5 rounded-md bg-[var(--surface-soft)] border border-[var(--primary)]/30 space-y-2">
            <p className="text-xs font-bold text-[var(--primary)] uppercase tracking-wider">API Transport</p>
            <p className="text-sm font-bold text-[var(--foreground)]">FastAPI /api/v1</p>
            <p className="text-[11px] text-[var(--muted-foreground)]">JWT authentication & rate limiting</p>
          </div>

          {/* Node 3: Core Engines */}
          <div className="p-5 rounded-md bg-[var(--surface-soft)] border border-[var(--border-subtle)] space-y-2">
            <p className="text-xs font-bold text-[var(--primary)] uppercase tracking-wider">Intelligence</p>
            <p className="text-sm font-bold text-[var(--foreground)]">ML + llama.cpp</p>
            <p className="text-[11px] text-[var(--muted-foreground)]">8-factor model & local GGUF AI</p>
          </div>

          {/* Node 4: Persistence */}
          <div className="p-5 rounded-md bg-[var(--surface-soft)] border border-[var(--border-subtle)] space-y-2">
            <p className="text-xs font-bold text-[var(--primary)] uppercase tracking-wider">Storage Layer</p>
            <p className="text-sm font-bold text-[var(--foreground)]">MySQL + Private Files</p>
            <p className="text-[11px] text-[var(--muted-foreground)]">Encrypted medical repositories</p>
          </div>
        </div>

        <div className="p-4 rounded-md bg-[var(--accent-soft)]/30 border border-[var(--primary)]/15 text-xs text-[var(--foreground)] text-center max-w-2xl mx-auto">
          No client-side direct database connections. All mutations and file operations require Bearer token validation.
        </div>
      </div>
    </section>
  );
}
