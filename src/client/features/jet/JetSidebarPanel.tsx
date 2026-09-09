import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { getStandardErrorMessage } from "@/client/lib/error-messages";
import { useEffect, useMemo, useState } from "react";
import { Archive, Check, Loader2, Pencil, Pin, Plus, X } from "lucide-react";
import {
  archiveJetSession,
  createJetSession,
  renameJetSession,
} from "@/serverFunctions/jet";
import {
  invalidateJetSessions,
  jetSessionsQueryOptions,
} from "@/client/features/jet/jetQueries";

const BETA_NOTICE_DISMISSED_KEY = "jet-beta-notice-dismissed";

function BetaNotice() {
  const [dismissed, setDismissed] = useState(true);
  useEffect(() => {
    setDismissed(localStorage.getItem(BETA_NOTICE_DISMISSED_KEY) === "1");
  }, []);
  if (dismissed) return null;

  return (
    <div className="mx-2 mb-2 rounded-lg border border-base-300 bg-base-100 p-3">
      <div className="flex items-center justify-between">
        <span className="badge badge-primary badge-sm">Beta</span>
        <button
          type="button"
          aria-label="Dismiss"
          className="btn btn-ghost btn-xs btn-square text-base-content/40"
          onClick={() => {
            localStorage.setItem(BETA_NOTICE_DISMISSED_KEY, "1");
            setDismissed(true);
          }}
        >
          <X className="size-3.5" />
        </button>
      </div>
      <p className="mt-1.5 text-xs text-base-content/70">
        For more powerful AI workflows, use the SeoTool.im MCP with your own
        agent like Claude Code or Hermes.
      </p>
      <Link to="/ai" className="link link-primary mt-1.5 inline-block text-xs">
        Set up the MCP →
      </Link>
    </div>
  );
}

function ageLabel(timestamp: string): string {
  const iso = timestamp.includes("T") ? timestamp : `${timestamp}Z`;
  const then = new Date(iso.replace(" ", "T")).getTime();
  if (Number.isNaN(then)) return "";
  const minutes = Math.max(0, Math.floor((Date.now() - then) / 60_000));
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

export function JetSidebarPanel({
  projectId,
  onNavigate,
}: {
  projectId: string;
  onNavigate?: () => void;
}) {
  const navigate = useNavigate();
  const location = useLocation();
  // oxlint-disable-next-line typescript-eslint/no-unsafe-type-assertion -- TanStack search param
  const activeSessionId = (location.search as { s?: string }).s;

  const sessionsQuery = useQuery(jetSessionsQueryOptions(projectId));
  const sessions = sessionsQuery.data ?? [];

  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");

  const pinnedStorageKey = `jet-pinned-sessions-${projectId}`;
  const [pinnedIds, setPinnedIds] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem(`jet-pinned-sessions-${projectId}`);
      return stored ? new Set<string>(JSON.parse(stored)) : new Set<string>();
    } catch {
      return new Set<string>();
    }
  });

  const togglePin = (sessionId: string) => {
    setPinnedIds((prev) => {
      const next = new Set(prev);
      if (next.has(sessionId)) next.delete(sessionId);
      else next.add(sessionId);
      try {
        localStorage.setItem(pinnedStorageKey, JSON.stringify([...next]));
      } catch {
        // ignore storage quota errors
      }
      return next;
    });
  };

  const sortedSessions = useMemo(() => {
    return [...sessions].sort((a, b) => {
      const aPinned = pinnedIds.has(a.id);
      const bPinned = pinnedIds.has(b.id);
      if (aPinned && !bPinned) return -1;
      if (!aPinned && bPinned) return 1;
      return 0;
    });
  }, [sessions, pinnedIds]);

  const goToSession = (sessionId: string | undefined) => {
    void navigate({
      to: "/p/$projectId/jet",
      params: { projectId },
      search: sessionId ? { s: sessionId } : {},
    });
    onNavigate?.();
  };

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

  const renameSession = useMutation({
    mutationFn: ({ sessionId, title }: { sessionId: string; title: string }) =>
      renameJetSession({ data: { sessionId, title } }),
    onSuccess: () => {
      invalidateJetSessions(projectId);
      setEditingSessionId(null);
    },
    onError: (error) => {
      toast.error(
        getStandardErrorMessage(error, "Failed to rename chat session"),
      );
    },
  });

  const archiveSession = useMutation({
    mutationFn: (sessionId: string) =>
      archiveJetSession({ data: { sessionId } }),
    onSuccess: (_result, sessionId) => {
      invalidateJetSessions(projectId);
      if (sessionId === activeSessionId) {
        goToSession(sessions.find((s) => s.id !== sessionId)?.id);
      }
    },
    onError: (error) => {
      toast.error(
        getStandardErrorMessage(error, "Failed to archive chat session"),
      );
    },
  });

  const handleSaveRename = (sessionId: string) => {
    const trimmed = editingTitle.trim();
    if (!trimmed) {
      setEditingSessionId(null);
      return;
    }
    renameSession.mutate({ sessionId, title: trimmed });
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="px-2 pb-1">
        <button
          type="button"
          className="btn btn-ghost btn-sm btn-block justify-start gap-2 font-normal text-base-content/70 hover:text-base-content"
          disabled={createSession.isPending}
          onClick={() => createSession.mutate()}
        >
          {createSession.isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Plus className="size-4" />
          )}
          New chat
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-2 py-1">
        {sessionsQuery.isLoading ? (
          <div className="flex justify-center py-6 text-base-content/50">
            <Loader2 className="size-4 animate-spin" />
          </div>
        ) : sortedSessions.length === 0 ? (
          <p className="px-2 py-6 text-center text-xs text-base-content/50">
            No chats yet. Start a new one.
          </p>
        ) : (
          sortedSessions.map((session) => {
            const isActive = session.id === activeSessionId;
            const isPinned = pinnedIds.has(session.id);
            const isEditing = editingSessionId === session.id;

            if (isEditing) {
              return (
                <div
                  key={session.id}
                  className={`flex items-center gap-1 rounded-md px-1 py-0.5 ${
                    isActive ? "bg-base-300/50" : "bg-base-300/20"
                  }`}
                >
                  <input
                    type="text"
                    className="input input-bordered input-xs min-w-0 flex-1 text-xs"
                    value={editingTitle}
                    maxLength={100}
                    autoFocus
                    disabled={renameSession.isPending}
                    onChange={(e) => setEditingTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSaveRename(session.id);
                      else if (e.key === "Escape") setEditingSessionId(null);
                    }}
                  />
                  <button
                    type="button"
                    aria-label="Save title"
                    className="btn btn-ghost btn-xs btn-square text-success"
                    disabled={renameSession.isPending}
                    onClick={() => handleSaveRename(session.id)}
                  >
                    <Check className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    aria-label="Cancel rename"
                    className="btn btn-ghost btn-xs btn-square text-base-content/50"
                    disabled={renameSession.isPending}
                    onClick={() => setEditingSessionId(null)}
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
              );
            }

            return (
              <div
                key={session.id}
                className={`group flex items-center gap-1 rounded-md px-1 ${
                  isActive ? "bg-base-300/50" : "hover:bg-base-300/40"
                }`}
              >
                <button
                  type="button"
                  onClick={() => goToSession(session.id)}
                  className="min-w-0 flex-1 truncate px-2 py-1.5 text-left text-sm text-base-content/80 flex items-center gap-1.5"
                >
                  {isPinned ? (
                    <Pin className="size-3 text-primary shrink-0 fill-primary rotate-45" />
                  ) : null}
                  <span className="truncate">{session.title}</span>
                </button>
                <span className="shrink-0 text-xs text-base-content/40 group-hover:hidden">
                  {ageLabel(session.updatedAt)}
                </span>
                <button
                  type="button"
                  aria-label={isPinned ? "Unpin chat" : "Pin chat"}
                  className={`btn btn-ghost btn-xs btn-square hidden group-hover:inline-flex ${
                    isPinned ? "text-primary" : "text-base-content/50"
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    togglePin(session.id);
                  }}
                >
                  <Pin
                    className={`size-3.5 ${isPinned ? "fill-primary rotate-45" : ""}`}
                  />
                </button>
                <button
                  type="button"
                  aria-label="Rename chat"
                  className="btn btn-ghost btn-xs btn-square hidden group-hover:inline-flex text-base-content/50"
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingSessionId(session.id);
                    setEditingTitle(session.title);
                  }}
                >
                  <Pencil className="size-3.5" />
                </button>
                <button
                  type="button"
                  aria-label="Archive chat"
                  className="btn btn-ghost btn-xs btn-square hidden group-hover:inline-flex text-base-content/50"
                  disabled={archiveSession.isPending}
                  onClick={(e) => {
                    e.stopPropagation();
                    archiveSession.mutate(session.id);
                  }}
                >
                  <Archive className="size-3.5" />
                </button>
              </div>
            );
          })
        )}
      </div>

      <BetaNotice />
    </div>
  );
}

export const SamSidebarPanel = JetSidebarPanel;
