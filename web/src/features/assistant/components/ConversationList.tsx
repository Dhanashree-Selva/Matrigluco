import React, { useState } from "react";
import {
  ScrollArea,
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "../../../shared/ui";
import { AppIcon } from "../../../components/common/AppIcon";
import { Clock01Icon } from "@hugeicons/core-free-icons";
import { AssistantConversation } from "../types/assistant.types";

interface ConversationListProps {
  conversations: AssistantConversation[];
  activeConversationId?: string | null;
  onSelectConversation: (id: string) => void;
  onDeleteConversation: (id: string) => void;
}

export function ConversationList({
  conversations,
  activeConversationId,
  onSelectConversation,
  onDeleteConversation,
}: ConversationListProps) {
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  if (!conversations || conversations.length === 0) {
    return (
      <div className="p-4 text-center text-xs text-[var(--muted-foreground)]">
        <p>No previous conversations.</p>
        <p className="mt-1 text-[11px]">Start a new conversation to explore maternal health education.</p>
      </div>
    );
  }

  return (
    <>
      <ScrollArea className="flex-1 w-full min-w-0 overflow-hidden px-2">
        <div className="space-y-1 py-1 w-full min-w-0">
          {conversations.map((conv) => {
            const isActive = conv.id === activeConversationId;

            return (
              <div
                key={conv.id}
                className={`group flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl text-xs transition-all cursor-pointer w-full max-w-full overflow-hidden ${
                  isActive
                    ? "bg-[var(--primary)] text-white font-semibold shadow-xs"
                    : "text-[var(--foreground)] hover:bg-[var(--accent-soft)]"
                }`}
                onClick={() => onSelectConversation(conv.id)}
              >
                <div className="flex-1 min-w-0 overflow-hidden pr-1">
                  <p className="truncate text-xs font-medium block">
                    {conv.title || "Maternal Health Guidance"}
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5 opacity-75 text-[10px] truncate">
                    <AppIcon icon={Clock01Icon} size="xxs" className="shrink-0" />
                    <span className="truncate">{conv.formattedDate} · {conv.formattedTime}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteTargetId(conv.id);
                  }}
                  className={`opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-black/10 transition-opacity shrink-0 ${
                    isActive ? "text-white" : "text-[var(--muted-foreground)] hover:text-red-500"
                  }`}
                  aria-label="Delete conversation"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            );
          })}
        </div>
      </ScrollArea>

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog
        open={Boolean(deleteTargetId)}
        onOpenChange={(open) => !open && setDeleteTargetId(null)}
      >
        <AlertDialogContent className="max-w-sm bg-[var(--card)] border border-[var(--border)] p-5">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-sm font-bold text-[var(--foreground)]">
              Delete this conversation?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-[var(--muted-foreground)] leading-relaxed mt-1">
              This will remove the saved consultation session from your account history. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="pt-2">
            <AlertDialogCancel size="sm">Cancel</AlertDialogCancel>
            <AlertDialogAction
              size="sm"
              variant="destructive"
              onClick={() => {
                if (deleteTargetId) {
                  onDeleteConversation(deleteTargetId);
                  setDeleteTargetId(null);
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
