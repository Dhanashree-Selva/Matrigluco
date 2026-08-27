import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { cn } from "../../lib/utils";

export function PageHeader({ title, subtitle, showBack = true, backTo, action, className = "" }) {
    const navigate = useNavigate();

    const handleBack = () => {
        if (backTo) {
            navigate(backTo);
        } else {
            navigate(-1);
        }
    };

    return (
        <div className={cn("flex items-center justify-between py-4 mb-6", className)}>
            <div className="flex items-center gap-3">
                {showBack && (
                    <button
                        onClick={handleBack}
                        aria-label="Go back"
                        className="p-2.5 bg-white rounded-md border border-slate-100 shadow-xs hover:bg-slate-50 active:scale-95 transition-all text-slate-700"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </button>
                )}
                <div>
                    <h1 className="text-xl font-bold text-slate-900 tracking-tight">{title}</h1>
                    {subtitle && <p className="text-xs text-slate-400 font-medium">{subtitle}</p>}
                </div>
            </div>
            {action && <div>{action}</div>}
        </div>
    );
}
