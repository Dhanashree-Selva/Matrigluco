import { ShieldCheck, AlertTriangle, AlertCircle, Info } from "lucide-react";
import { cn } from "../../lib/utils";

const RISK_CONFIG = {
    low: {
        label: "Low Risk",
        bg: "bg-emerald-50 text-emerald-700 border-emerald-200",
        icon: ShieldCheck,
        dot: "bg-emerald-500",
    },
    moderate: {
        label: "Moderate Risk",
        bg: "bg-amber-50 text-amber-700 border-amber-200",
        icon: AlertTriangle,
        dot: "bg-amber-500",
    },
    high: {
        label: "High Risk",
        bg: "bg-rose-50 text-rose-700 border-rose-200",
        icon: AlertCircle,
        dot: "bg-rose-500",
    },
    unknown: {
        label: "Pending",
        bg: "bg-slate-50 text-slate-700 border-slate-200",
        icon: Info,
        dot: "bg-slate-400",
    },
};

export function RiskBadge({ level = "low", className = "", showIcon = true, size = "md" }) {
    const normalized = (level || "low").toLowerCase();
    const config = RISK_CONFIG[normalized] || RISK_CONFIG.unknown;
    const Icon = config.icon;

    const sizeClasses = {
        sm: "px-2 py-0.5 text-xs gap-1",
        md: "px-3 py-1 text-xs gap-1.5 font-bold",
        lg: "px-4 py-1.5 text-sm gap-2 font-bold",
    };

    return (
        <span
            className={cn(
                "inline-flex items-center rounded-md border shadow-xs transition-all",
                config.bg,
                sizeClasses[size] || sizeClasses.md,
                className
            )}
        >
            {showIcon && <Icon className="w-3.5 h-3.5 flex-shrink-0" />}
            <span>{config.label}</span>
        </span>
    );
}
