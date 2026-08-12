import { useEffect, useState } from "react";
import { toast } from "sonner";
import { authClient, useSession } from "@/lib/auth-client";

interface SessionEntry {
  id: string;
  token?: string;
  createdAt: Date | string;
  updatedAt?: Date | string;
  expiresAt: Date | string;
  ipAddress?: string | null;
  userAgent?: string | null;
}

function parseBrowser(ua: string | null | undefined): string {
  if (!ua) return "Unknown device";
  if (ua.includes("Firefox")) return "Firefox";
  if (ua.includes("Edg")) return "Edge";
  if (ua.includes("Chrome")) return "Chrome";
  if (ua.includes("Safari")) return "Safari";
  return "Unknown browser";
}

function timeAgo(date: Date | string): string {
  const now = Date.now();
  const then = new Date(date).getTime();
  const diff = Math.max(0, now - then);
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function SessionSection() {
  const { data: currentSession } = useSession();
  const [sessions, setSessions] = useState<SessionEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRevoking, setIsRevoking] = useState(false);

  async function loadSessions() {
    setIsLoading(true);
    try {
      const result = await authClient.listSessions();
      if (result.data) {
        setSessions(result.data as unknown as SessionEntry[]);
      }
    } catch {
      // silent
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadSessions();
  }, []);

  async function revokeSession(sessionId: string) {
    setIsRevoking(true);
    try {
      await authClient.revokeSession({ token: sessionId });
      toast.success("Session revoked.");
      await loadSessions();
    } catch {
      toast.error("Could not revoke session.");
    } finally {
      setIsRevoking(false);
    }
  }

  async function revokeAll() {
    setIsRevoking(true);
    try {
      await authClient.revokeOtherSessions();
      toast.success("All other sessions revoked.");
      await loadSessions();
    } catch {
      toast.error("Could not revoke other sessions.");
    } finally {
      setIsRevoking(false);
    }
  }

  const currentSessionId = currentSession?.session?.id;

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-base-content/50">Sessions</h2>
        {sessions.length > 1 ? (
          <button
            type="button"
            className="btn btn-ghost btn-xs text-error"
            disabled={isRevoking}
            onClick={() => void revokeAll()}
          >
            Revoke all others
          </button>
        ) : null}
      </div>

      {isLoading ? (
        <p className="text-sm text-base-content/60">Loading sessions...</p>
      ) : sessions.length === 0 ? (
        <p className="text-sm text-base-content/60">No active sessions.</p>
      ) : (
        <div className="divide-y divide-base-300 rounded-lg border border-base-300">
          {sessions.map((s) => {
            const isCurrent = s.id === currentSessionId;
            return (
              <div
                key={s.id}
                className="flex items-center justify-between gap-4 p-3"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">
                    {parseBrowser(s.userAgent)}
                    {isCurrent ? (
                      <span className="ml-2 text-xs text-success">Current</span>
                    ) : null}
                  </p>
                  <p className="text-xs text-base-content/50">
                    {s.ipAddress ?? "Unknown IP"} &middot;{" "}
                    {timeAgo(s.updatedAt ?? s.createdAt)}
                  </p>
                </div>
                {!isCurrent ? (
                  <button
                    type="button"
                    className="btn btn-ghost btn-xs text-error shrink-0"
                    disabled={isRevoking}
                    onClick={() => void revokeSession(s.token ?? s.id)}
                  >
                    Revoke
                  </button>
                ) : null}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
