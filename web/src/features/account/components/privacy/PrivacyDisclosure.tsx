import React from "react";
import { AppIcon } from "../../../../components/common/AppIcon";
import {
  CpuIcon,
  DocumentValidationIcon,
  Shield01Icon,
} from "@hugeicons/core-free-icons";

export function PrivacyDisclosure() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
      {/* Local AI Runtime */}
      <div className="p-4 rounded-2xl bg-[var(--background)] border border-[var(--border)] space-y-2">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <AppIcon icon={CpuIcon} size="xs" />
          </span>
          <h4 className="text-xs font-bold text-[var(--foreground)]">Local AI Runtime</h4>
        </div>
        <p className="text-[11.5px] text-[var(--muted-foreground)] leading-relaxed">
          Assistant responses and clinical rationale generation run on the local llama.cpp AI runtime, keeping your conversations private to your deployment.
        </p>
      </div>

      {/* Report OCR Processing */}
      <div className="p-4 rounded-2xl bg-[var(--background)] border border-[var(--border)] space-y-2">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <AppIcon icon={DocumentValidationIcon} size="xs" />
          </span>
          <h4 className="text-xs font-bold text-[var(--foreground)]">Clinical Report OCR</h4>
        </div>
        <p className="text-[11.5px] text-[var(--muted-foreground)] leading-relaxed">
          Uploaded laboratory PDFs and glucose charts are parsed securely via authenticated endpoints, with OCR extraction respecting data isolation.
        </p>
      </div>

      {/* Private Authenticated Storage */}
      <div className="p-4 rounded-2xl bg-[var(--background)] border border-[var(--border)] space-y-2">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <AppIcon icon={Shield01Icon} size="xs" />
          </span>
          <h4 className="text-xs font-bold text-[var(--foreground)]">Authenticated Storage</h4>
        </div>
        <p className="text-[11.5px] text-[var(--muted-foreground)] leading-relaxed">
          Files, consult records, and risk assessments are strictly private authenticated resources. No public bucket URLs or unverified tokens.
        </p>
      </div>
    </div>
  );
}
