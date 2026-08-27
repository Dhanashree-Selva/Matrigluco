import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  UserCircleIcon,
  SecurityCheckIcon,
  Logout01Icon,
  ArrowDown01Icon,
} from "@hugeicons/core-free-icons";
import { AppLogo } from "../../shared/brand/AppLogo";
import { AppIcon } from "../../components/common/AppIcon";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarRail,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "../../shared/ui";
import {
  primaryCareRailNavigation,
  secondaryCareRailNavigation,
} from "../../app/navigation";
import { routePaths } from "../../app/route-paths";
import { useAuth } from "../../auth/useAuth";

export function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate(routePaths.auth.login);
  };

  const displayName = user?.full_name || user?.email?.split("@")[0] || "Patient";
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <Sidebar collapsible="icon" className="border-r border-[var(--border)] bg-[var(--sidebar)]">
      {/* 1. Header: Brand Logo & Workspace */}
      <SidebarHeader className="p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              asChild
              className="hover:bg-[var(--sidebar-accent)] hover:text-[var(--sidebar-accent-foreground)] rounded-md transition-colors"
            >
              <NavLink to={routePaths.app.dashboard} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-md bg-[var(--accent-soft)] flex items-center justify-center text-[var(--primary)] shrink-0">
                  <AppLogo size={22} className="text-[var(--primary)]" />
                </div>
                <div className="grid flex-1 text-left text-xs leading-tight group-data-[collapsible=icon]:hidden">
                  <span className="truncate font-extrabold text-[var(--foreground)] text-sm">
                    Matrigluco
                  </span>
                  <span className="truncate text-[10px] text-[var(--muted-foreground)] font-medium">
                    Maternal Health Care
                  </span>
                </div>
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* 2. Main Navigation Content (sidebar-08 Group Style) */}
      <SidebarContent className="space-y-2">
        {/* Core Care Orbit Group */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] font-bold text-[var(--muted-foreground)] uppercase tracking-wider">
            Care Orbit
          </SidebarGroupLabel>
          <SidebarMenu>
            {primaryCareRailNavigation.map((item) => {
              const isActive = item.matchPrefix
                ? location.pathname.startsWith(item.path)
                : location.pathname === item.path;

              return (
                <SidebarMenuItem key={item.key}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive}
                    tooltip={item.label}
                    className={`rounded-md font-bold text-xs transition-colors ${
                      isActive
                        ? "bg-[var(--accent-soft)] text-[var(--primary)] font-extrabold shadow-2xs"
                        : "text-[var(--muted-foreground)] hover:bg-[var(--sidebar-accent)] hover:text-[var(--foreground)]"
                    }`}
                  >
                    <NavLink to={item.path} aria-current={isActive ? "page" : undefined}>
                      <AppIcon icon={item.icon} size="sm" className="shrink-0" />
                      <span>{item.label}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>

        {/* Clinical Consult & Account Group */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] font-bold text-[var(--muted-foreground)] uppercase tracking-wider">
            Consult & Account
          </SidebarGroupLabel>
          <SidebarMenu>
            {secondaryCareRailNavigation.map((item) => {
              const isActive = item.matchPrefix
                ? location.pathname.startsWith(item.path)
                : location.pathname === item.path;

              return (
                <SidebarMenuItem key={item.key}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive}
                    tooltip={item.label}
                    className={`rounded-md font-bold text-xs transition-colors ${
                      isActive
                        ? "bg-[var(--accent-soft)] text-[var(--primary)] font-extrabold shadow-2xs"
                        : "text-[var(--muted-foreground)] hover:bg-[var(--sidebar-accent)] hover:text-[var(--foreground)]"
                    }`}
                  >
                    <NavLink to={item.path} aria-current={isActive ? "page" : undefined}>
                      <AppIcon icon={item.icon} size="sm" className="shrink-0" />
                      <span>{item.label}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      {/* 3. Footer: User Profile Dropdown (sidebar-08 NavUser) */}
      <SidebarFooter className="p-2 border-t border-[var(--border-subtle)]">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-[var(--sidebar-accent)] data-[state=open]:text-[var(--sidebar-accent-foreground)] rounded-md cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-md bg-[var(--primary)] text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs">
                    {initials}
                  </div>
                  <div className="grid flex-1 text-left text-xs leading-tight group-data-[collapsible=icon]:hidden">
                    <span className="truncate font-bold text-[var(--foreground)]">
                      {displayName}
                    </span>
                    <span className="truncate text-[10px] text-[var(--muted-foreground)]">
                      {user?.email || "patient@matrigluco.org"}
                    </span>
                  </div>
                  <AppIcon icon={ArrowDown01Icon} size="xs" className="ml-auto text-[var(--muted-foreground)] group-data-[collapsible=icon]:hidden" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                side="right"
                align="end"
                className="w-56 rounded-md bg-[var(--card)] border border-[var(--border)] shadow-lg p-1.5 space-y-1 text-left"
              >
                <DropdownMenuLabel className="p-2 text-xs">
                  <div className="font-bold text-[var(--foreground)]">{displayName}</div>
                  <div className="text-[10px] text-[var(--muted-foreground)] truncate">{user?.email}</div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-[var(--border)]" />

                <DropdownMenuItem
                  onClick={() => navigate(routePaths.app.profile)}
                  className="rounded-md text-xs font-semibold p-2 cursor-pointer hover:bg-[var(--accent-soft)] hover:text-[var(--primary)] flex items-center gap-2"
                >
                  <AppIcon icon={UserCircleIcon} size="xs" />
                  <span>Personal Profile</span>
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => navigate(routePaths.app.security)}
                  className="rounded-md text-xs font-semibold p-2 cursor-pointer hover:bg-[var(--accent-soft)] hover:text-[var(--primary)] flex items-center gap-2"
                >
                  <AppIcon icon={SecurityCheckIcon} size="xs" />
                  <span>Security & Privacy</span>
                </DropdownMenuItem>

                <DropdownMenuSeparator className="bg-[var(--border)]" />

                <DropdownMenuItem
                  onClick={handleLogout}
                  className="rounded-md text-xs font-bold p-2 cursor-pointer text-[var(--destructive)] hover:bg-[var(--destructive-soft)] flex items-center gap-2"
                >
                  <AppIcon icon={Logout01Icon} size="xs" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      {/* 4. Interactive Collapse/Expand Rail */}
      <SidebarRail />
    </Sidebar>
  );
}

export { AppSidebar as CareRail };
