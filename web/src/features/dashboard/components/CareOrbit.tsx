import { useNavigate } from "react-router-dom";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { AppIcon } from "../../../components/common/AppIcon";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "../../../shared/ui";
import { CareOrbitNodeVM } from "../types/dashboard.types";

export interface CareOrbitProps {
  nodes: CareOrbitNodeVM[];
  className?: string;
}

export function CareOrbit({ nodes, className = "" }: CareOrbitProps) {
  const navigate = useNavigate();

  return (
    <Card
      data-slot="care-orbit"
      className={`rounded-md border border-[var(--border)] bg-[var(--card)] shadow-xs flex flex-col justify-between ${className}`}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-bold text-[var(--foreground)] tracking-tight">
          Care Orbit
        </CardTitle>
        <CardDescription className="text-xs text-[var(--muted-foreground)]">
          Four pillars of continuous maternal management
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-2">
        {/* Grid of 4 Pillars with Accessible Tooltips */}
        <TooltipProvider delayDuration={150}>
          <div className="grid grid-cols-2 gap-3">
            {nodes.map((node) => {
              return (
                <Tooltip key={node.id}>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={() => navigate(node.path)}
                      className={`p-3.5 rounded-md text-left transition-all border group flex flex-col justify-between gap-3 cursor-pointer ${
                        node.active
                          ? "bg-[var(--accent-soft)]/70 border-[var(--border-pink)] text-[var(--foreground)] shadow-2xs"
                          : "bg-[var(--surface-soft)] border-[var(--border)] text-[var(--foreground)] hover:border-[var(--border-pink)] hover:bg-[var(--accent-soft)]/50"
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div
                          className={`w-8 h-8 rounded-md flex items-center justify-center transition-colors ${
                            node.active
                              ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                              : "bg-[var(--card)] text-[var(--primary)] group-hover:bg-[var(--primary)] group-hover:text-[var(--primary-foreground)]"
                          }`}
                        >
                          <AppIcon icon={node.icon} size="xs" />
                        </div>
                        <AppIcon
                          icon={ArrowRight01Icon}
                          size="xs"
                          className="text-[var(--muted-foreground)] group-hover:text-[var(--primary)] transition-colors shrink-0"
                        />
                      </div>

                      <div>
                        <h4 className="font-bold text-xs text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors">
                          {node.label}
                        </h4>
                        <p className="text-[11px] text-[var(--muted-foreground)] mt-0.5 truncate">
                          {node.sublabel}
                        </p>
                      </div>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-xs">
                    Navigate to {node.label} ({node.sublabel})
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        </TooltipProvider>
      </CardContent>
    </Card>
  );
}
