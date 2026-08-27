import React, { useState, useRef, useEffect } from "react";
import { ConsultationRecord } from "../../types/consultation.types";
import { Button, Input, ScrollArea } from "../../../../shared/ui";
import { AppIcon } from "../../../../components/common/AppIcon";
import { SentIcon, Message01Icon } from "@hugeicons/core-free-icons";

interface ChatMessage {
  id: string;
  sender: "patient" | "clinician";
  senderName: string;
  text: string;
  timestamp: string;
}

interface ConsultationChatProps {
  consultation: ConsultationRecord;
  className?: string;
}

export function ConsultationChat({ consultation, className = "" }: ConsultationChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "m-1",
      sender: "clinician",
      senderName: consultation.doctorName,
      text: `Hello ${consultation.patientName}, welcome to our consultation session. I have your records on screen. How have you been feeling today?`,
      timestamp: consultation.formattedTime,
    },
  ]);
  const [inputText, setInputText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: "patient",
      senderName: consultation.patientName,
      text: inputText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputText("");
  };

  return (
    <div className={`p-4 rounded-3xl bg-[var(--card)] border border-[var(--border)] shadow-xs flex flex-col h-[520px] max-h-[70vh] ${className}`}>
      {/* Header */}
      <div className="pb-3 border-b border-[var(--border)] flex items-center justify-between">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--muted-foreground)] flex items-center gap-1.5">
            <AppIcon icon={Message01Icon} size="xxs" className="text-[var(--primary)]" />
            Direct Consultation Chat
          </h3>
          <p className="text-xs font-semibold text-[var(--foreground)] mt-0.5">
            {consultation.doctorName}
          </p>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-2 space-y-3 scrollbar-none my-2">
        {messages.map((msg) => {
          const isMe = msg.sender === "patient";

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
            >
              <span className="text-[10px] text-[var(--muted-foreground)] px-1 mb-0.5">
                {msg.senderName} · {msg.timestamp}
              </span>
              <div
                className={`p-3 rounded-2xl max-w-[85%] text-xs leading-relaxed ${
                  isMe
                    ? "bg-[var(--primary)] text-white rounded-br-xs shadow-xs"
                    : "bg-[var(--background)] border border-[var(--border)] text-[var(--foreground)] rounded-bl-xs"
                }`}
              >
                {msg.text}
              </div>
            </div>
          );
        })}
      </div>

      {/* Composer Input */}
      <form onSubmit={handleSendMessage} className="pt-2 border-t border-[var(--border)] flex items-center gap-2">
        <Input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Type message to clinician..."
          className="text-xs h-10 rounded-xl bg-[var(--background)] border-[var(--border)] focus-visible:ring-[var(--primary)]"
        />
        <Button
          type="submit"
          disabled={!inputText.trim()}
          size="icon"
          className="h-10 w-10 rounded-xl bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-white shrink-0 shadow-xs"
        >
          <AppIcon icon={SentIcon} size="xs" />
        </Button>
      </form>
    </div>
  );
}
