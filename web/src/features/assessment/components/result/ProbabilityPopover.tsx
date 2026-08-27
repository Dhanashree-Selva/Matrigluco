import {
  InformationCircleIcon,
  SecurityCheckIcon,
} from "@hugeicons/core-free-icons";
import { AppIcon } from "../../../../components/common/AppIcon";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  Button,
} from "../../../../shared/ui";

export function ProbabilityPopover() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="xs"
          className="h-6 px-2 text-[11px] font-semibold text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-soft)] gap-1.5 rounded-md"
          aria-label="Explain how to read this model probability"
        >
          <AppIcon icon={InformationCircleIcon} size="xs" />
          <span>How should I read this probability?</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        side="bottom"
        className="w-80 p-4 space-y-2.5 bg-[var(--card)] border border-[var(--border)] shadow-lg"
      >
        <PopoverHeader className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-[var(--accent-soft)] text-[var(--primary)] flex items-center justify-center shrink-0">
            <AppIcon icon={InformationCircleIcon} size="xs" />
          </div>
          <PopoverTitle className="text-xs font-bold text-[var(--foreground)]">
            Model Probability Interpretation
          </PopoverTitle>
        </PopoverHeader>

        <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
          This value represents the mathematical probability calculated by the model
          based on your 8 submitted clinical inputs.
        </p>

        <div className="p-2 rounded-md bg-[var(--surface-soft)] border border-[var(--border-subtle)] space-y-1 text-[11px]">
          <div className="flex items-start gap-1.5 text-[var(--foreground)] font-medium">
            <AppIcon icon={SecurityCheckIcon} size="xs" className="text-[var(--primary)] shrink-0 mt-0.5" />
            <span>Not a diagnostic certainty</span>
          </div>
          <p className="text-[10px] text-[var(--muted-foreground)] leading-normal pl-4">
            A probability of 64% means the statistical profile correlates with higher risk,
            not that you have diabetes or will develop it with certainty.
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
}
