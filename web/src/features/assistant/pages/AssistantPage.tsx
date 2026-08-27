import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../../../app/providers/AuthProvider";
import { AssistantHeader } from "../components/AssistantHeader";
import { ContextHalo } from "../components/ContextHalo";
import { ContextInspector } from "../components/ContextInspector";
import { ConversationRail } from "../components/ConversationRail";
import { CareDialogue } from "../components/CareDialogue";
import { CareComposer } from "../components/CareComposer";
import { EvidenceDrawer } from "../components/EvidenceDrawer";
import { AssistantUnavailable } from "../components/AssistantUnavailable";
import { AssistantSkeleton } from "../components/AssistantSkeleton";

import { useConversations } from "../hooks/useConversations";
import { useConversation } from "../hooks/useConversation";
import { useCreateConversation } from "../hooks/useCreateConversation";
import { useDeleteConversation } from "../hooks/useDeleteConversation";
import { useChatStream } from "../hooks/useChatStream";
import { useHealthContextConsent } from "../hooks/useHealthContextConsent";
import { useAiAvailability } from "../hooks/useAiAvailability";
import { useMessageFeedback } from "../hooks/useMessageFeedback";
import { CitationSource } from "../types/assistant.types";

export default function AssistantPage() {
  const [searchParams] = useSearchParams();
  const rawResourceType = searchParams.get("resourceType") as
    | "assessment"
    | "report"
    | "tracking"
    | null;
  const rawResourceId = searchParams.get("resourceId");
  const rawTopic = searchParams.get("topic");

  const { user } = useAuth();
  const userInitials = user?.fullName
    ? user.fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  // AI Readiness
  const aiAvailability = useAiAvailability();

  // Conversations
  const { data: conversations = [], isLoading: isLoadingConversations } =
    useConversations();
  const createConversation = useCreateConversation();
  const deleteConversation = useDeleteConversation();

  // Active Selected Conversation
  const [activeConversationId, setActiveConversationId] = useState<string | null>(
    null
  );

  // Auto-select first conversation if available and none selected
  useEffect(() => {
    if (!activeConversationId && conversations.length > 0) {
      setActiveConversationId(conversations[0].id);
    }
  }, [conversations, activeConversationId]);

  // Messages Query
  const { data: messages = [], isLoading: isLoadingMessages } =
    useConversation(activeConversationId);

  // Streaming State Machine
  const {
    isGenerating,
    activeStreamMessage,
    sendMessage,
    stopGeneration,
    retryLast,
  } = useChatStream();

  // Health Context Consent
  const {
    isConsented,
    resourceLabel,
    grantConsent,
    revokeConsent,
  } = useHealthContextConsent(rawResourceType || undefined, rawResourceId || undefined);

  // Evidence Drawer State
  const [isEvidenceDrawerOpen, setIsEvidenceDrawerOpen] = useState(false);
  const [focusedCitationIndex, setFocusedCitationIndex] = useState<number | null>(
    null
  );

  // Context Inspector State
  const [isContextInspectorOpen, setIsContextInspectorOpen] = useState(false);

  // Mobile Conversation Rail State
  const [isMobileRailOpen, setIsMobileRailOpen] = useState(false);

  // Feedback Mutation
  const feedbackMutation = useMessageFeedback();

  // Aggregate all citations in active conversation for Evidence Drawer
  const activeCitations = useMemo<CitationSource[]>(() => {
    const list: CitationSource[] = [];
    const seen = new Set<string>();

    // From persisted messages
    for (const msg of messages) {
      for (const cit of msg.citations || []) {
        if (!seen.has(cit.id)) {
          seen.add(cit.id);
          list.push(cit);
        }
      }
    }

    // From active stream message
    for (const cit of activeStreamMessage?.citations || []) {
      if (!seen.has(cit.id)) {
        seen.add(cit.id);
        list.push(cit);
      }
    }

    return list;
  }, [messages, activeStreamMessage]);

  const handleOpenSources = useCallback((citationIndex?: number) => {
    setFocusedCitationIndex(citationIndex ?? null);
    setIsEvidenceDrawerOpen(true);
  }, []);

  const handleNewConversation = useCallback(async () => {
    const newConv = await createConversation.mutateAsync("Maternal Health Guidance");
    setActiveConversationId(newConv.id);
  }, [createConversation]);

  const handleDeleteConversation = useCallback(
    async (id: string) => {
      await deleteConversation.mutateAsync(id);
      if (activeConversationId === id) {
        const remaining = conversations.filter((c) => c.id !== id);
        setActiveConversationId(remaining.length > 0 ? remaining[0].id : null);
      }
    },
    [deleteConversation, activeConversationId, conversations]
  );

  const handleSendMessage = useCallback(
    async (content: string) => {
      let targetConvId = activeConversationId;

      // Auto-create session on first turn if none active
      if (!targetConvId) {
        const titleSnippet = content.slice(0, 45).replace(/[^\w\s]/g, "");
        const newConv = await createConversation.mutateAsync(
          titleSnippet || "Maternal Health Guidance"
        );
        targetConvId = newConv.id;
        setActiveConversationId(newConv.id);
      }

      await sendMessage({
        conversationId: targetConvId,
        content,
        useHealthContext: isConsented,
        resourceType: rawResourceType || undefined,
        resourceId: rawResourceId || undefined,
      });
    },
    [
      activeConversationId,
      createConversation,
      sendMessage,
      isConsented,
      rawResourceType,
      rawResourceId,
    ]
  );

  // If AI is disabled in environment
  if (aiAvailability.isDisabled || aiAvailability.status === "unavailable") {
    return (
      <div className="flex flex-col h-[calc(100vh-4rem)] bg-[var(--background)]">
        <AssistantHeader aiStatus={aiAvailability.status} />
        <AssistantUnavailable status={aiAvailability.status} />
      </div>
    );
  }

  const isThreadEmpty = messages.length === 0 && !activeStreamMessage;

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-[var(--background)] overflow-hidden">
      {/* 1. Header */}
      <AssistantHeader
        aiStatus={aiAvailability.status}
        modelVersion={aiAvailability.modelVersion}
        onOpenConversationsMobile={() => setIsMobileRailOpen(true)}
      />

      {/* 2. Context Halo */}
      <ContextHalo
        isHealthContextConsented={isConsented}
        resourceLabel={resourceLabel}
        sourceCount={activeCitations.length}
        onOpenContextInspector={() => setIsContextInspectorOpen(true)}
        onOpenEvidenceDrawer={() => setIsEvidenceDrawerOpen(true)}
      />

      {/* 3. Three-Plane Main Composition */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Plane 1: Conversation Rail */}
        <ConversationRail
          conversations={conversations}
          activeConversationId={activeConversationId}
          onSelectConversation={setActiveConversationId}
          onNewConversation={handleNewConversation}
          onDeleteConversation={handleDeleteConversation}
          isMobileOpen={isMobileRailOpen}
          onMobileOpenChange={setIsMobileRailOpen}
        />

        {/* Plane 2: Dialogue + Composer */}
        <main className="flex-1 flex flex-col min-w-0 bg-[var(--background)] h-full overflow-hidden">
          {isLoadingMessages && !activeStreamMessage ? (
            <AssistantSkeleton />
          ) : (
            <CareDialogue
              messages={messages}
              activeStreamMessage={activeStreamMessage}
              isGenerating={isGenerating}
              userInitials={userInitials}
              showCareDesk={isThreadEmpty}
              showContextGate={Boolean(rawResourceType && !isConsented)}
              resourceLabel={resourceLabel}
              onAcceptConsent={grantConsent}
              onDeclineConsent={revokeConsent}
              onSelectStarterPrompt={handleSendMessage}
              onOpenSources={handleOpenSources}
              onRetry={retryLast}
              onFeedback={(msgId, rating) =>
                feedbackMutation.mutate({ messageId: msgId, rating })
              }
            />
          )}

          {/* Composer Anchored at bottom */}
          <CareComposer
            onSendMessage={handleSendMessage}
            onStopGeneration={stopGeneration}
            isGenerating={isGenerating}
            isHealthContextConsented={isConsented}
            resourceLabel={resourceLabel}
            onOpenContextGate={() => setIsContextInspectorOpen(true)}
            disabled={aiAvailability.status !== "ready"}
            initialDraft={rawTopic ? `Can you help me understand my recent ${rawTopic}?` : ""}
          />
        </main>

        {/* Plane 3: Evidence Drawer */}
        <EvidenceDrawer
          open={isEvidenceDrawerOpen}
          onOpenChange={setIsEvidenceDrawerOpen}
          sources={activeCitations}
          focusedIndex={focusedCitationIndex}
        />
      </div>

      {/* Context Permissions Dialog */}
      <ContextInspector
        open={isContextInspectorOpen}
        onOpenChange={setIsContextInspectorOpen}
        isConsented={isConsented}
        resourceLabel={resourceLabel}
        onRevokeConsent={revokeConsent}
      />
    </div>
  );
}
