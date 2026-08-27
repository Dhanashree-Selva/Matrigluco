import React from "react";
import { AssistantMessage as AssistantMessageType } from "../types/assistant.types";
import { Avatar, AvatarFallback } from "../../../shared/ui";

interface UserMessageProps {
  message: AssistantMessageType;
  userInitials?: string;
}

export function UserMessage({ message, userInitials = "U" }: UserMessageProps) {
  return (
    <div className="flex justify-end gap-2.5 my-3 max-w-2xl ml-auto">
      <div className="flex flex-col items-end max-w-[85%] sm:max-w-[75%]">
        <div className="flex items-center gap-1.5 mb-1 px-1 text-[11px] font-mono text-[var(--muted-foreground)]">
          <span className="font-bold text-[var(--foreground)]">YOU</span>
          {message.formattedTime && <span>· {message.formattedTime}</span>}
        </div>

        <div className="p-3.5 sm:p-4 rounded-2xl rounded-tr-xs bg-[var(--primary)]/10 dark:bg-[var(--primary)]/20 border border-[var(--primary)]/20 text-sm sm:text-[14.5px] text-[var(--foreground)] leading-relaxed shadow-2xs font-sans whitespace-pre-wrap break-words">
          {message.content}
        </div>
      </div>

      <Avatar className="w-7 h-7 mt-1 border border-[var(--border)] shrink-0 hidden sm:flex">
        <AvatarFallback className="text-[10px] font-bold bg-[var(--accent-soft)] text-[var(--foreground)]">
          {userInitials}
        </AvatarFallback>
      </Avatar>
    </div>
  );
}
