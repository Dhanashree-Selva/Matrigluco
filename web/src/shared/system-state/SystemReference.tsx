import { useState } from "react";
import { Copy01Icon, CheckmarkCircle02Icon } from "@hugeicons/core-free-icons";
import { AppIcon } from "../../components/common/AppIcon";
import { toast, Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "../ui";

interface SystemReferenceProps {
  requestId?: string | null;
  className?: string;
}

export function SystemReference({
  requestId,
  className = "",
}: SystemReferenceProps) {
  const [copied, setCopied] = useState(false);

  if (!requestId) return null;

  // Mask or sanitize if excessively long, keep clean safe reference string
  const cleanRef = requestId.trim().slice(0, 36);

  const handleCopy = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(cleanRef);
        setCopied(true);
        toast.success("Reference copied", {
          description: `Reference code ${cleanRef} saved to clipboard.`,
        });
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      toast.error("Unable to copy reference automatically.");
    }
  };

  return (
    <TooltipProvider delayDuration={150}>
      <div
        className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-[var(--surface-soft)] border border-[var(--border)] text-[11px] text-[var(--muted-foreground)] font-mono ${className}`}
      >
        <span className="font-semibold select-none text-[10px] tracking-wider uppercase text-[var(--foreground)] opacity-70">
          Ref:
        </span>
        <span className="tabular-nums font-medium text-[var(--foreground)]">{cleanRef}</span>

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={handleCopy}
              className="p-1 -mr-1 rounded hover:bg-[var(--accent-soft)] text-[var(--muted-foreground)] hover:text-[var(--primary)] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--primary)]"
              aria-label="Copy reference code"
            >
              <AppIcon
                icon={copied ? CheckmarkCircle02Icon : Copy01Icon}
                size="xs"
                className={copied ? "text-[var(--color-success,#10B981)]" : "text-current"}
              />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top" className="text-xs">
            {copied ? "Copied" : "Copy reference"}
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}
