import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Button,
  Badge,
} from "../../../shared/ui";
import { AppIcon } from "../../../components/common/AppIcon";
import { SecurityCheckIcon } from "@hugeicons/core-free-icons";

interface ContextInspectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isConsented: boolean;
  resourceLabel?: string;
  onRevokeConsent?: () => void;
}

export function ContextInspector({
  open,
  onOpenChange,
  isConsented,
  resourceLabel,
  onRevokeConsent,
}: ContextInspectorProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-[var(--card)] border border-[var(--border)] p-6">
        <DialogHeader>
          <div className="flex items-center gap-2 text-[var(--primary)] mb-1">
            <AppIcon icon={SecurityCheckIcon} size="md" />
            <DialogTitle className="text-base font-bold text-[var(--foreground)]">
              Health Context Authorization
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-[var(--muted-foreground)] leading-relaxed">
            Review how maternal health information is authorized and protected within this conversation.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 my-3 text-xs">
          <div className="p-3 rounded-xl bg-[var(--accent-soft)]/60 border border-[var(--border)] flex items-center justify-between">
            <div>
              <span className="font-semibold text-[var(--foreground)]">Current Status</span>
              <p className="text-[11px] text-[var(--muted-foreground)] mt-0.5">
                {resourceLabel || "General Maternal Health Session"}
              </p>
            </div>
            <Badge variant={isConsented ? "default" : "outline"} className="text-[11px]">
              {isConsented ? "Consented" : "Not Authorized"}
            </Badge>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-[var(--foreground)] uppercase text-[10px] tracking-wider">
              Authorized Information Categories
            </h4>
            <ul className="space-y-1.5 text-[var(--muted-foreground)] pl-4 list-disc marker:text-[var(--primary)]">
              <li>Gestational age & current trimester stage</li>
              <li>Calculated maternal risk level (if assessment is authorized)</li>
              <li>Verified lab parameter reference values</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-[var(--foreground)] uppercase text-[10px] tracking-wider">
              Privacy Protections
            </h4>
            <ul className="space-y-1.5 text-[var(--muted-foreground)] pl-4 list-disc marker:text-emerald-500">
              <li>Runs locally via offline inference on the local server</li>
              <li>No prompt or health data is sent to external cloud AI providers</li>
              <li>Raw medical files and database credentials remain restricted</li>
            </ul>
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-[var(--border)]">
          {isConsented && onRevokeConsent && (
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => {
                onRevokeConsent();
                onOpenChange(false);
              }}
              className="w-full sm:w-auto"
            >
              Withdraw Context Consent
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
