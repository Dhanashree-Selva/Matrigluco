import { InformationCircleIcon } from "@hugeicons/core-free-icons";
import { AppIcon } from "../../../components/common/AppIcon";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "../../../shared/ui";
import { AssessmentFieldDefinition } from "../config/assessment-fields";

interface InputRationaleProps {
  field: AssessmentFieldDefinition;
  onOpenDetails?: (field: AssessmentFieldDefinition) => void;
}

export function InputRationale({ field, onOpenDetails }: InputRationaleProps) {
  return (
    <div className="inline-flex items-center">
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            onClick={() => onOpenDetails?.(field)}
            aria-label={`Why Matrigluco asks for ${field.label}`}
            className="inline-flex items-center justify-center p-0.5 rounded-md text-[var(--muted-foreground)] hover:text-[var(--primary)] hover:bg-[var(--accent-soft)] transition-colors focus-visible:outline-2 focus-visible:outline-[var(--primary)]"
          >
            <AppIcon icon={InformationCircleIcon} size="xs" />
          </button>
        </TooltipTrigger>
        <TooltipContent
          side="top"
          align="center"
          className="max-w-xs text-xs p-2.5 rounded-md bg-[var(--card)] border border-[var(--border)] shadow-md text-[var(--foreground)]"
        >
          <p className="font-bold text-[var(--foreground)] mb-0.5">{field.label}</p>
          <p className="text-[11px] text-[var(--muted-foreground)] leading-relaxed">
            {field.rationale}
          </p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
}
