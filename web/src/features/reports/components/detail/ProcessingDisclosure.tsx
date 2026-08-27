import {
  Shield01Icon,
  InformationCircleIcon,
} from "@hugeicons/core-free-icons";
import { AppIcon } from "../../../../components/common/AppIcon";
import { REPORTS_CONFIG } from "../../config/reports.config";

export function ProcessingDisclosure() {
  return (
    <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-soft)]/50 p-4 space-y-2">
      <div className="flex items-center gap-2 text-xs font-bold text-[var(--foreground)]">
        <AppIcon icon={InformationCircleIcon} size="xs" className="text-[var(--primary)]" />
        <span>Automated OCR Extraction & Non-Diagnostic Disclosure</span>
      </div>

      <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
        {REPORTS_CONFIG.disclosureText}
      </p>

      <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center gap-2 text-[10px] text-[var(--muted-foreground)]">
        <AppIcon icon={Shield01Icon} size="xxs" className="text-emerald-500" />
        <span>{REPORTS_CONFIG.privacyNote}</span>
      </div>
    </div>
  );
}
