import React from "react";
import { Button, Sheet, SheetContent, SheetHeader, SheetTitle } from "../../../shared/ui";
import { AppIcon } from "../../../components/common/AppIcon";
import { Add01Icon } from "@hugeicons/core-free-icons";
import { AssistantConversation } from "../types/assistant.types";
import { ConversationList } from "./ConversationList";

interface ConversationRailProps {
  conversations: AssistantConversation[];
  activeConversationId?: string | null;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  onDeleteConversation: (id: string) => void;
  isMobileOpen?: boolean;
  onMobileOpenChange?: (open: boolean) => void;
}

export function ConversationRail({
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
  isMobileOpen = false,
  onMobileOpenChange,
}: ConversationRailProps) {
  const content = (
    <div className="flex flex-col h-full bg-[var(--card)] border-r border-[var(--border)] w-full min-w-0 overflow-hidden">
      <div className="p-3 border-b border-[var(--border)] shrink-0">
        <Button
          type="button"
          onClick={onNewConversation}
          className="w-full justify-start gap-2 text-xs font-semibold"
          size="sm"
        >
          <AppIcon icon={Add01Icon} size="sm" />
          New Consultation
        </Button>
      </div>

      <div className="flex-1 min-h-0 overflow-hidden flex flex-col py-2 w-full min-w-0">
        <div className="px-3 pb-2 shrink-0">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
            Saved Threads
          </span>
        </div>
        <ConversationList
          conversations={conversations}
          activeConversationId={activeConversationId}
          onSelectConversation={(id) => {
            onSelectConversation(id);
            onMobileOpenChange?.(false);
          }}
          onDeleteConversation={onDeleteConversation}
        />
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Column */}
      <aside className="hidden md:flex flex-col w-60 lg:w-64 shrink-0 h-full min-w-0 overflow-hidden">
        {content}
      </aside>

      {/* Mobile Drawer */}
      <Sheet open={isMobileOpen} onOpenChange={onMobileOpenChange}>
        <SheetContent side="left" className="p-0 w-72 max-w-[85vw] bg-[var(--card)]">
          <SheetHeader className="p-4 border-b border-[var(--border)] text-left">
            <SheetTitle className="text-sm font-bold text-[var(--foreground)]">
              Consultation History
            </SheetTitle>
          </SheetHeader>
          {content}
        </SheetContent>
      </Sheet>
    </>
  );
}
