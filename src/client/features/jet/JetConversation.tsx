import { useAgent } from "agents/react";
import { useAgentChat } from "@cloudflare/think/react";
import { useEffect, useRef } from "react";
import { ChatComposer } from "@/client/features/onboarding/OnboardingChatParts";
import { invalidateJetSessions } from "@/client/features/jet/jetQueries";
import {
  ChatMessage,
  humanizeToolLabel,
  messageHasVisibleContent,
} from "@/client/components/chat/ChatMessage";

const SUGGESTIONS = [
  "What keywords should I focus on next?",
  "Who are my top SERP competitors?",
  "How is my Search Console traffic trending?",
  "Find quick-win keywords I already rank for",
];

export function JetConversation({
  projectId,
  sessionId,
}: {
  projectId: string;
  sessionId: string;
}) {
  const agent = useAgent({ agent: "jet-chat", name: sessionId });
  const {
    messages,
    sendMessage,
    setMessages,
    clearHistory,
    status,
    error,
    connectionError,
  } = useAgentChat({ agent });

  const isBusy = status === "submitted" || status === "streaming";
  const sendText = (text: string) => void sendMessage({ text });

  const rewindTo = async (messageId: string) => {
    const response = await fetch(`/agents/jet-chat/${sessionId}/rewind`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ messageId }),
    });
    if (!response.ok) return false;
    const fresh = await fetch(
      `/agents/jet-chat/${sessionId}/get-messages`,
    ).then((res) => (res.ok ? res.json() : null));
    if (Array.isArray(fresh)) setMessages(fresh);
    return true;
  };

  const undoFrom = (messageId: string) => void rewindTo(messageId);
  const editAndResend = async (messageId: string, newText: string) => {
    if (await rewindTo(messageId)) void sendMessage({ text: newText });
  };

  const wasBusyRef = useRef(false);
  useEffect(() => {
    if (isBusy) {
      wasBusyRef.current = true;
      return;
    }
    if (wasBusyRef.current) {
      wasBusyRef.current = false;
      invalidateJetSessions(projectId);
    }
  }, [isBusy, projectId]);

  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, status]);

  const lastMessage = messages[messages.length - 1];
  const showTyping =
    isBusy &&
    (lastMessage?.role !== "assistant" ||
      !messageHasVisibleContent(lastMessage));
  const showSuggestions = messages.length === 0 && !isBusy;

  return (
    <div className="relative flex min-w-0 flex-1 flex-col">
      {import.meta.env.DEV ? (
        <button
          type="button"
          className="btn btn-ghost btn-xs absolute right-3 top-2 z-10 text-base-content/40"
          onClick={() => clearHistory()}
        >
          Clear history (dev)
        </button>
      ) : null}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-6">
        <div className="mx-auto max-w-2xl space-y-6">
          {messages.length === 0 ? (
            <div className="space-y-2 text-sm text-base-content/80">
              <p>
                Hey, I’m Jet — your in-app SEO agent. I can research keywords,
                size up competitors, read your SERPs, backlinks, rank tracking
                and Search Console, and turn it into next steps for this
                project.
              </p>
              <p>Ask me anything, or start with one of these:</p>
            </div>
          ) : null}

          {messages.map((message, index) => (
            <ChatMessage
              key={message.id}
              message={message}
              resolveToolLabel={humanizeToolLabel}
              streaming={
                isBusy &&
                index === messages.length - 1 &&
                message.role === "assistant"
              }
              onUndo={
                message.role === "user" ? () => undoFrom(message.id) : undefined
              }
              onEdit={
                message.role === "user"
                  ? (newText) => void editAndResend(message.id, newText)
                  : undefined
              }
            />
          ))}

          {showTyping ? (
            <div className="flex items-center gap-2 pt-1 text-base-content/40">
              <span className="flex items-center gap-1.5">
                <span className="size-1.5 animate-bounce rounded-full bg-current [animation-delay:-0.3s]" />
                <span className="size-1.5 animate-bounce rounded-full bg-current [animation-delay:-0.15s]" />
                <span className="size-1.5 animate-bounce rounded-full bg-current" />
              </span>
            </div>
          ) : null}

          {status === "error" || connectionError ? (
            <div className="rounded-lg border border-error/20 bg-error/5 p-3 text-sm text-error">
              <p className="font-medium">
                {connectionError?.reason ||
                  error?.message ||
                  "Something went wrong. Please try again."}
              </p>
            </div>
          ) : null}

          {showSuggestions ? (
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map((question) => (
                <button
                  key={question}
                  type="button"
                  className="rounded-full border border-base-300 bg-base-100 px-3 py-1.5 text-xs font-medium text-base-content/70 transition-colors hover:border-primary/50 hover:text-base-content"
                  onClick={() => sendText(question)}
                >
                  {question}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      <div className="flex-shrink-0 border-t border-base-300 px-5 py-3">
        <div className="mx-auto w-full max-w-2xl">
          <ChatComposer
            busy={isBusy}
            onSend={(text) => sendText(text)}
          />
        </div>
      </div>
    </div>
  );
}

export const SamConversation = JetConversation;
