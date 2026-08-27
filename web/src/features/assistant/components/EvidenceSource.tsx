import React from "react";
import { Badge, Button } from "../../../shared/ui";
import { AppIcon } from "../../../components/common/AppIcon";
import { SecurityCheckIcon } from "@hugeicons/core-free-icons";
import { CitationSource } from "../types/assistant.types";
import { Link } from "react-router-dom";
import { routePaths } from "../../../app/route-paths";

interface EvidenceSourceProps {
  source: CitationSource;
  isFocused?: boolean;
}

export function EvidenceSource({ source, isFocused = false }: EvidenceSourceProps) {
  const isPrivate = source.isPrivateHealthContext;

  return (
    <div
      id={`evidence-source-${source.sourceIndex}`}
      className={`p-4 rounded-xl border transition-all text-xs ${
        isFocused
          ? "border-[var(--primary)] bg-[var(--accent-soft)]/80 shadow-xs"
          : "border-[var(--border)] bg-[var(--card)] hover:border-[var(--border)]"
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-[var(--primary)] text-white text-[10px] font-mono font-bold flex items-center justify-center shrink-0">
            {source.sourceIndex}
          </span>
          <Badge
            variant={isPrivate ? "default" : "outline"}
            className="text-[10px] uppercase font-bold tracking-wider"
          >
            {isPrivate ? "Your Health Context" : "Curated Clinical Guidance"}
          </Badge>
        </div>
      </div>

      <h4 className="font-bold text-[var(--foreground)] text-xs sm:text-[13px] leading-snug mt-1">
        {source.title}
      </h4>

      {source.documentId && (
        <p className="text-[11px] font-mono text-[var(--muted-foreground)] mt-1 opacity-80 truncate">
          Ref ID: {source.documentId}
        </p>
      )}

      <div className="mt-3 p-2.5 rounded-lg bg-[var(--card)] border border-[var(--border)]/60 text-[11.5px] text-[var(--foreground)] leading-relaxed">
        <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted-foreground)] mb-1">
          Clinical Guidance Excerpt
        </p>
        <p className="italic text-[var(--muted-foreground)]">
          {source.excerpt ||
            (isPrivate
              ? "Authorized patient health telemetry and biomarker reference data."
              : "Standardized gestational metabolic guidance synthesized from verified clinical care protocols.")}
        </p>
      </div>

      {isPrivate && (
        <div className="mt-3 pt-2 border-t border-[var(--border)]/60 flex items-center justify-between">
          <span className="text-[10px] text-[var(--muted-foreground)] flex items-center gap-1">
            <AppIcon icon={SecurityCheckIcon} size="xs" className="text-emerald-500" />
            Consented patient data
          </span>
          {source.sourceType === "assessment" ? (
            <Link to={routePaths.app.assessment}>
              <Button variant="ghost" size="sm" className="h-6 text-[11px] px-2">
                Open Assessment
              </Button>
            </Link>
          ) : source.sourceType === "report" ? (
            <Link to={routePaths.app.reports}>
              <Button variant="ghost" size="sm" className="h-6 text-[11px] px-2">
                Open Reports
              </Button>
            </Link>
          ) : (
            <Link to={routePaths.app.tracking}>
              <Button variant="ghost" size="sm" className="h-6 text-[11px] px-2">
                Open Tracking
              </Button>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
