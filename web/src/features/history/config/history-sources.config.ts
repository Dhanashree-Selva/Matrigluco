import {
  HealthIcon,
  Activity02Icon,
  DocumentCodeIcon,
  Calendar03Icon,
} from "@hugeicons/core-free-icons";
import { HistoryEventType } from "../types/history.types";

export interface HistorySourceMeta {
  type: HistoryEventType;
  label: string;
  pluralLabel: string;
  icon: any;
  colorClass: string;
  badgeVariant: "default" | "secondary" | "outline";
  description: string;
  deepLinkPrefix: string;
}

export const HISTORY_SOURCE_CONFIG: Record<HistoryEventType, HistorySourceMeta> = {
  assessment: {
    type: "assessment",
    label: "Assessment",
    pluralLabel: "Assessments",
    icon: HealthIcon,
    colorClass: "text-[var(--primary)]",
    badgeVariant: "outline",
    description: "ML risk evaluations & metabolic assessments",
    deepLinkPrefix: "/app/assessment",
  },
  measurement: {
    type: "measurement",
    label: "Reading",
    pluralLabel: "Readings",
    icon: Activity02Icon,
    colorClass: "text-amber-500 dark:text-amber-400",
    badgeVariant: "outline",
    description: "Biometric telemetry (glucose, blood pressure, weight, etc.)",
    deepLinkPrefix: "/app/tracking",
  },
  report: {
    type: "report",
    label: "Report",
    pluralLabel: "Reports",
    icon: DocumentCodeIcon,
    colorClass: "text-blue-500 dark:text-blue-400",
    badgeVariant: "outline",
    description: "Lab diagnostic records & extracted OCR reports",
    deepLinkPrefix: "/app/reports",
  },
  consultation: {
    type: "consultation",
    label: "Consultation",
    pluralLabel: "Consultations",
    icon: Calendar03Icon,
    colorClass: "text-emerald-500 dark:text-emerald-400",
    badgeVariant: "outline",
    description: "Clinical appointments & care team sessions",
    deepLinkPrefix: "/app/consultations",
  },
};

export const ALL_HISTORY_SOURCES: HistoryEventType[] = [
  "assessment",
  "measurement",
  "report",
  "consultation",
];
