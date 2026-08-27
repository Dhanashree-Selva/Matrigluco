import { ReactNode } from "react";
import { AppSidebar } from "./AppSidebar";
import { AppHeader } from "./AppHeader";
import { MobileNav } from "./MobileNav";
import { ContextRail } from "./ContextRail";
import { SidebarProvider, SidebarInset } from "../../shared/ui";

interface AppLayoutProps {
  children?: ReactNode;
  title?: string;
  subtitle?: string;
  headerAction?: ReactNode;
  contextRailContent?: ReactNode;
}

export function AppLayout({
  children,
  title,
  subtitle,
  headerAction,
  contextRailContent,
}: AppLayoutProps) {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full bg-[var(--background)] text-[var(--foreground)] transition-colors">
        {/* 1. Skip to Content Link for Keyboard Users */}
        <a
          href="#workspace-main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 z-50 px-4 py-2 bg-[var(--primary)] text-white font-bold rounded-md shadow-lg"
        >
          Skip to main content
        </a>

        {/* 2. Desktop Care Rail (sidebar-08 architecture) */}
        <AppSidebar />

        {/* 3. Central Workspace Canvas via SidebarInset */}
        <SidebarInset className="flex-1 flex flex-col min-w-0 bg-[var(--background)]">
          <AppHeader title={title} subtitle={subtitle} action={headerAction} />

          <main id="workspace-main" className="flex-1 overflow-y-auto">
            {children}
          </main>
        </SidebarInset>

        {/* 4. Optional Context Rail */}
        {contextRailContent && <ContextRail>{contextRailContent}</ContextRail>}

        {/* 5. Mobile Bottom Navigation & More Sheet */}
        <MobileNav />
      </div>
    </SidebarProvider>
  );
}
