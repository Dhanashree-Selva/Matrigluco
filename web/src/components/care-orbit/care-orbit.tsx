import React from "react";
import { useNavigate } from "react-router-dom";
import {
  AiBrain01Icon,
  Activity02Icon,
  DocumentCodeIcon,
  Calendar03Icon,
} from "@hugeicons/core-free-icons";
import { AppIcon } from "../common/AppIcon";

export interface OrbitNode {
  id: string;
  label: string;
  sublabel?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: any;
  path: string;
  active?: boolean;
}

export interface CareOrbitProps {
  centerTitle?: string;
  centerSubtitle?: string;
  centerAction?: React.ReactNode;
  nodes?: OrbitNode[];
  className?: string;
}

const DEFAULT_NODES: OrbitNode[] = [
  {
    id: "assessment",
    label: "Assessment",
    sublabel: "Clinical GDM Risk",
    icon: AiBrain01Icon,
    path: "/prediction",
    active: true,
  },
  {
    id: "tracking",
    label: "Tracking",
    sublabel: "Daily Telemetry",
    icon: Activity02Icon,
    path: "/track",
  },
  {
    id: "reports",
    label: "Reports",
    sublabel: "OCR & Lab Files",
    icon: DocumentCodeIcon,
    path: "/history",
  },
  {
    id: "consultation",
    label: "Consultation",
    sublabel: "Obstetric Care",
    icon: Calendar03Icon,
    path: "/doctor",
  },
];

export function CareOrbit({
  centerTitle = "Care Orientation",
  centerSubtitle = "Select an active health pillar",
  centerAction,
  nodes = DEFAULT_NODES,
  className = "",
}: CareOrbitProps) {
  const navigate = useNavigate();

  return (
    <div
      className={`rounded-[24px] p-6 sm:p-8 bg-[var(--card)] border border-[var(--border)] shadow-xs ${className}`}
      role="region"
      aria-label="Care Orbit Navigation"
    >
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-[var(--foreground)] tracking-tight">
            {centerTitle}
          </h3>
          <p className="text-xs text-[var(--muted-foreground)] font-medium">
            {centerSubtitle}
          </p>
        </div>
        {centerAction}
      </div>

      {/* Grid on mobile / Segmented Orbit on desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {nodes.map((node) => {
          return (
            <button
              key={node.id}
              onClick={() => navigate(node.path)}
              className={`p-4 rounded-[18px] text-left transition-all border group flex flex-col justify-between gap-3 ${
                node.active
                  ? "bg-[var(--accent-soft)] border-[var(--border-pink)] text-[var(--foreground)] shadow-xs"
                  : "bg-[var(--surface-soft)] border-[var(--border)] text-[var(--foreground)] hover:border-[var(--border-pink)] hover:bg-[var(--accent-soft)]"
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <div
                  className={`w-10 h-10 rounded-md flex items-center justify-center transition-colors ${
                    node.active
                      ? "bg-[var(--primary)] text-white"
                      : "bg-[var(--card)] text-[var(--primary)] group-hover:bg-[var(--primary)] group-hover:text-white"
                  }`}
                >
                  <AppIcon icon={node.icon} size="md" />
                </div>
                {node.active && (
                  <span className="w-2 h-2 rounded-md bg-[var(--primary)] animate-pulse" />
                )}
              </div>

              <div>
                <h4 className="font-bold text-sm text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors">
                  {node.label}
                </h4>
                {node.sublabel && (
                  <p className="text-xs text-[var(--muted-foreground)] font-medium mt-0.5">
                    {node.sublabel}
                  </p>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
