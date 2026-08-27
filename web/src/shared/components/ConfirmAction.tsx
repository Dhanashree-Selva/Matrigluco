import { ReactNode, useState } from "react";
import { AlertCircleIcon } from "@hugeicons/core-free-icons";
import { AppIcon } from "../../components/common/AppIcon";

interface ConfirmActionProps {
  trigger: (open: () => void) => ReactNode;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  onConfirm: () => void | Promise<void>;
}

export function ConfirmAction({
  trigger,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  isDestructive = true,
  onConfirm,
}: ConfirmActionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    try {
      setIsLoading(true);
      await onConfirm();
      setIsOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {trigger(() => setIsOpen(true))}

      {isOpen && (
        <div
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="confirm-dialog-title"
          aria-describedby="confirm-dialog-description"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
        >
          <div className="w-full max-w-md rounded-md bg-[var(--card)] border border-[var(--border)] p-6 space-y-5 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-start gap-4">
              <div
                className={`w-10 h-10 rounded-md flex items-center justify-center shrink-0 ${isDestructive
                  ? "bg-[var(--color-danger-soft)] text-[var(--color-danger)]"
                  : "bg-[var(--accent-soft)] text-[var(--primary)]"
                  }`}
              >
                <AppIcon icon={AlertCircleIcon} size="md" />
              </div>
              <div className="space-y-1">
                <h2 id="confirm-dialog-title" className="text-base font-bold text-[var(--foreground)]">
                  {title}
                </h2>
                <p id="confirm-dialog-description" className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                  {description}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                disabled={isLoading}
                className="px-4 py-2.5 rounded-md border border-[var(--border)] text-xs font-bold text-[var(--foreground)] hover:bg-[var(--surface-soft)] transition-colors"
              >
                {cancelLabel}
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={isLoading}
                className={`px-4 py-2.5 rounded-md text-xs font-bold transition-all shadow-xs ${isDestructive
                  ? "bg-[var(--color-danger)] hover:bg-[var(--color-danger)]/90 text-white"
                  : "bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white"
                  }`}
              >
                {isLoading ? "Processing..." : confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
