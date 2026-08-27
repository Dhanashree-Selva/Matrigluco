import React from "react";
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuShortcut,
  toast,
} from "../../../shared/ui";
import { AppIcon } from "../../../components/common/AppIcon";
import { DocumentCodeIcon } from "@hugeicons/core-free-icons";

interface MessageContextMenuProps {
  children: React.ReactNode;
  content: string;
  hasCitations?: boolean;
  onOpenSources?: () => void;
  onRetry?: () => void;
}

export function MessageContextMenu({
  children,
  content,
  hasCitations,
  onOpenSources,
  onRetry,
}: MessageContextMenuProps) {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      toast.success("Copied to clipboard");
    } catch {
      toast.error("Could not copy text");
    }
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent className="w-52 bg-[var(--card)] border border-[var(--border)]">
        <ContextMenuItem onClick={handleCopy} className="text-xs cursor-pointer">
          <svg className="w-3.5 h-3.5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          Copy Response
          <ContextMenuShortcut className="text-[10px]">⌘C</ContextMenuShortcut>
        </ContextMenuItem>

        {hasCitations && onOpenSources && (
          <ContextMenuItem onClick={onOpenSources} className="text-xs cursor-pointer text-[var(--primary)] font-medium">
            <AppIcon icon={DocumentCodeIcon} size="xs" className="mr-2" />
            Open Cited Sources
          </ContextMenuItem>
        )}

        {onRetry && (
          <ContextMenuItem onClick={onRetry} className="text-xs cursor-pointer">
            <svg className="w-3.5 h-3.5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Retry Response
          </ContextMenuItem>
        )}
      </ContextMenuContent>
    </ContextMenu>
  );
}
