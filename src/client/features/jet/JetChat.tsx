import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { getStandardErrorMessage } from "@/client/lib/error-messages";
import { useNavigate } from "@tanstack/react-router";
import { Suspense, useCallback, useEffect } from "react";
import { Loader2, Plus, Wrench } from "lucide-react";
import { createJetSession } from "@/serverFunctions/jet";
import {
  invalidateJetSessions,
  jetSessionsQueryOptions,
} from "@/client/features/jet/jetQueries";
import { useJetAccess } from "./useJetAccess";
import { JetSetupGate } from "./JetSetupGate";
import { JetConversation } from "./JetConversation";

export function JetChat({
  projectId,
  activeSessionId,
}: {
  projectId: string;
  activeSessionId: string | undefined;
}) {
  const navigate = useNavigate();
  const access = useJetAccess(projectId);
  const sessionsQuery = useQuery(jetSessionsQueryOptions(projectId));
  const sessions = sessionsQuery.data;

  const goToSession = useCallback(
    (sessionId: string | undefined) =>
      void navigate({
        to: "/p/$projectId/jet",
        params: { projectId },
        search: sessionId ? { s: sessionId } : {},
        replace: true,
      }),
    [navigate, projectId],
  );

  const createSession = useMutation({
    mutationFn: () => createJetSession({ data: { projectId } }),
    onSuccess: ({ id }) => {
      invalidateJetSessions(projectId);
      goToSession(id);
    },
    onError: (error) => {
      toast.error(
        getStandardErrorMessage(error, "Failed to create chat session"),
      );
    },
  });

  const firstSessionId = sessions?.[0]?.id;
  useEffect(() => {
    if (!sessionsQuery.isSuccess || !sessions) return;
    if (activeSessionId && !sessions.some((s) => s.id === activeSessionId)) {
      // Stale or invalid session ID in URL: redirect to first valid session or clear
      goToSession(firstSessionId);
      return;
    }
    if (!activeSessionId && firstSessionId) {
      goToSession(firstSessionId);
    }
  }, [
    activeSessionId,
    firstSessionId,
    goToSession,
    sessions,
    sessionsQuery.isSuccess,
  ]);

  if (access.showSetupGate) {
    return (
      <div className="overflow-auto px-4 py-4 md:px-6 md:py-6">
        <div className="mx-auto max-w-3xl">
          <JetSetupGate
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
        <Suspense
          fallback={
            <div className="flex flex-1 items-center justify-center">
              <Loader2 className="size-5 animate-spin text-base-content/40" />
            </div>
          }
        >
          <JetConversation
            key={activeSessionId}
            projectId={projectId}
            sessionId={activeSessionId}
          />
        </Suspense>
      </div>
    );
  }

  if (sessionsQuery.isLoading) {
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
      </div>
    </div>
  );
}

export const SamChat = JetChat;
