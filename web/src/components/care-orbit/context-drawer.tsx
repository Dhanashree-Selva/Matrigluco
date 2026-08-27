import React from "react";
import { Cancel01Icon } from "@hugeicons/core-free-icons";
import { AppIcon } from "../common/AppIcon";

export interface ContextDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export function ContextDrawer({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  className = "",
}: ContextDrawerProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div
          className={`w-screen max-w-md bg-[var(--card)] border-l border-[var(--border)] shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300 ${className}`}
        >
          {/* Header */}
          <div className="p-6 border-b border-[var(--border)] flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-[var(--foreground)] tracking-tight">
                {title}
              </h3>
              {subtitle && (
                <p className="text-xs text-[var(--muted-foreground)] font-medium mt-0.5">
                  {subtitle}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              aria-label="Close drawer"
              className="p-2 rounded-md hover:bg-[var(--surface-soft)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
            >
              <AppIcon icon={Cancel01Icon} size="sm" />
            </button>
          </div>

          {/* Content Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {children}
          </div>

          {/* Footer */}
          {footer && (
            <div className="p-6 border-t border-[var(--border)] bg-[var(--surface-soft)]">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
