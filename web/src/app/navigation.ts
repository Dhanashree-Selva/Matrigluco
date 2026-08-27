import {
  Home01Icon,
  Activity02Icon,
  SparklesIcon,
  Clock01Icon,
  DocumentCodeIcon,
  AiBrain01Icon,
  Calendar03Icon,
  Notification02Icon,
  UserCircleIcon,
  Menu01Icon,
} from "@hugeicons/core-free-icons";
import { routePaths } from "./route-paths";

export interface NavigationItem {
  key: string;
  label: string;
  path: string;
  icon: typeof Home01Icon;
  badge?: number;
  matchPrefix?: boolean;
}

export const primaryCareRailNavigation: NavigationItem[] = [
  {
    key: "dashboard",
    label: "Home",
    path: routePaths.app.dashboard,
    icon: Home01Icon,
  },
  {
    key: "tracking",
    label: "Track",
    path: routePaths.app.tracking,
    icon: Activity02Icon,
  },
  {
    key: "assessment",
    label: "Assess",
    path: routePaths.app.assessment,
    icon: SparklesIcon,
    matchPrefix: true,
  },
  {
    key: "history",
    label: "History",
    path: routePaths.app.history,
    icon: Clock01Icon,
  },
  {
    key: "reports",
    label: "Reports",
    path: routePaths.app.reports,
    icon: DocumentCodeIcon,
    matchPrefix: true,
  },
  {
    key: "assistant",
    label: "Assistant",
    path: routePaths.app.assistant,
    icon: AiBrain01Icon,
  },
];

export const secondaryCareRailNavigation: NavigationItem[] = [
  {
    key: "notifications",
    label: "Notifications",
    path: routePaths.app.notifications,
    icon: Notification02Icon,
  },
  {
    key: "account",
    label: "Account",
    path: routePaths.app.account.profile,
    icon: UserCircleIcon,
    matchPrefix: true,
  },
];

export const mobileBottomNavigation = [
  {
    key: "home",
    label: "Home",
    path: routePaths.app.dashboard,
    icon: Home01Icon,
  },
  {
    key: "track",
    label: "Track",
    path: routePaths.app.tracking,
    icon: Activity02Icon,
  },
  {
    key: "assess",
    label: "Assess",
    path: routePaths.app.assessment,
    icon: SparklesIcon,
  },
  {
    key: "assistant",
    label: "Assistant",
    path: routePaths.app.assistant,
    icon: AiBrain01Icon,
  },
  {
    key: "more",
    label: "More",
    path: "#more",
    icon: Menu01Icon,
    isAction: true,
  },
];

export const mobileMoreMenuItems = [
  {
    group: "YOUR HEALTH",
    items: [
      { label: "History", path: routePaths.app.history, icon: Clock01Icon },
      { label: "Reports", path: routePaths.app.reports, icon: DocumentCodeIcon },
    ],
  },
  {
    group: "ACCOUNT & SETTINGS",
    items: [
      { label: "Notifications", path: routePaths.app.notifications, icon: Notification02Icon },
      { label: "Profile", path: routePaths.app.account.profile, icon: UserCircleIcon },
      { label: "Security", path: routePaths.app.account.security, icon: UserCircleIcon },
      { label: "Preferences", path: routePaths.app.account.preferences, icon: UserCircleIcon },
    ],
  },
];
