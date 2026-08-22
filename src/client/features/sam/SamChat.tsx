import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { getStandardErrorMessage } from "@/client/lib/error-messages";
import { useNavigate } from "@tanstack/react-router";
import { Suspense, useCallback, useEffect } from "react";
import { Loader2, Plus, Wrench } from "lucide-react";
import { createSamSession } from "@/serverFunctions/sam";
import {
  invalidateSamSessions,
  samSessionsQueryOptions,
} from "@/client/features/sam/samQueries";
import { useSamAccess } from "./useSamAccess";
import { SamSetupGate } from "./SamSetupGate";
import { SamConversation } from "./SamConversation";

/**
 * The SAM route's content: the active conversation, full-width. The chat
 * history list lives in the app sidebar's Chat tab (SamSidebarPanel); this
 * component only auto-selects the most recent session on landing and shows the
 * start-a-chat empty state when the project has none.
 */
export function SamChat({
  projectId,
  activeSessionId,
}: {
  projectId: string;
  activeSessionId: string | undefined;
}) {
  const navigate = useNavigate();
  const access = useSamAccess(projectId);
  const sessionsQuery = useQuery(samSessionsQueryOptions(projectId));
  const sessions = sessionsQuery.data ?? [];

  const goToSession = useCallback(
    (sessionId: string) =>
      void navigate({
        to: "/p/$projectId/sam",
        params: { projectId },
        search: { s: sessionId },
        replace: true,
      }),
    [navigate, projectId],
  );

  const createSession = useMutation({
    mutationFn: () => createSamSession({ data: { projectId } }),
    onSuccess: ({ id }) => {
      invalidateSamSessions(projectId);
      goToSession(id);
    },
    onError: (error) => {
      toast.error(
        getStandardErrorMessage(error, "Failed to create chat session"),
      );
    },
  });

  // Default to the most recent session once they load; if none exist, leave the
  // empty state so the user can start one explicitly.
  const firstSessionId = sessions[0]?.id;
  useEffect(() => {
    if (activeSessionId || !firstSessionId) return;
    goToSession(firstSessionId);
  }, [activeSessionId, firstSessionId, goToSession]);

  // SAM cannot answer a turn without OPENROUTER_API_KEY, so surface setup
  // instructions instead of letting a chat fail mid-stream. Only shown once the
  // check confirms the key is missing (self-hosted) — never as a blocking
  // skeleton while the check is in flight.
  if (access.showSetupGate) {
    return (
      <div className="overflow-auto px-4 py-4 md:px-6 md:py-6">
        <div className="mx-auto max-w-3xl">
          <SamSetupGate
            errorMessage={access.errorMessage}
            isRefetching={access.isRefetching}
            onRetry={access.onRetry}
          />
        </div>
      </div>
    );
  }

  if (activeSessionId) {
    return (
      <div className="flex h-full min-h-0">
        {/* useAgentChat suspends while it fetches the session's history; this
            boundary keeps that suspension inside the chat panel instead of
            letting it bubble up and swap out the whole shell — which read as
            a full page refresh on every session switch. */}
        <Suspense
          fallback={
            <div className="flex flex-1 items-center justify-center">
              <Loader2 className="size-5 animate-spin text-base-content/40" />
            </div>
          }
        >
          <SamConversation
            key={activeSessionId}
            projectId={projectId}
            sessionId={activeSessionId}
          />
        </Suspense>
      </div>
    );
  }

  if (sessionsQuery.isLoading) {
    // Sessions are still loading; the auto-select effect will redirect into
    // the most recent one. Show a loader instead of flashing the empty state.
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="size-5 animate-spin text-base-content/40" />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col items-center justify-center gap-6 p-6 text-center max-w-xl mx-auto">
      <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-xs">
        <Wrench className="size-7" />
      </div>
      <div className="space-y-1.5">
        <p className="text-xl font-bold text-base-content">
          What should we work on today?
        </p>
        <p className="text-sm text-base-content/70 leading-relaxed max-w-md">
          Jet is your autonomous AI SEO strategist with full access to your
          audits, keywords, backlinks, and Search Console data.
        </p>
      </div>

      <button
        type="button"
        className="btn btn-primary font-semibold shadow-xs gap-2"
        disabled={createSession.isPending}
        onClick={() => createSession.mutate()}
      >
        {createSession.isPending ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Plus className="size-4" />
        )}
        Start New Conversation
      </button>

      <div className="w-full pt-4 space-y-2.5">
        <p className="text-xs font-semibold uppercase tracking-wider text-base-content/50">
          Example prompts to explore
        </p>
        <div className="grid gap-2 text-left">
          {[
            "Audit my site for broken links, missing meta tags, and indexing issues",
            "Find low-competition keyword opportunities for my organic content strategy",
            "Analyze my top competitor's backlink profile and identify link gaps",
            "Generate high-intent content topic ideas to rank in Google's top 10",
          ].map((promptText) => (
            <button
              key={promptText}
              type="button"
              disabled={createSession.isPending}
              onClick={() => createSession.mutate()}
              className="group flex items-center justify-between rounded-xl border border-base-300 bg-base-100 p-3 text-xs font-medium text-base-content/80 transition-all hover:border-primary/40 hover:bg-primary/5 hover:text-primary active:scale-[0.99]"
            >
              <span>{promptText}</span>
              <Plus className="size-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
