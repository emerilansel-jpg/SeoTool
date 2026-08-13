import { useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, CheckCheck } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import {
  getUnreadNotificationCount,
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/serverFunctions/notifications";
import { isHostedClientAuthMode } from "@/lib/auth-mode";

/**
 * Bell + unread badge in the sidebar header. Polls the unread count and lazily
 * loads the inbox when opened. Notifications are user-scoped, so this renders
 * only in the hosted SaaS (self-host has no notification writers).
 */
export function NotificationCenter() {
  const isHosted = isHostedClientAuthMode();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const panelRef = useRef<HTMLDivElement | null>(null);

  const getCount = useServerFn(getUnreadNotificationCount);
  const getList = useServerFn(listNotifications);
  const markRead = useServerFn(markNotificationRead);
  const markAll = useServerFn(markAllNotificationsRead);

  const countQuery = useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: () => getCount(),
    enabled: isHosted,
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
  });

  const listQuery = useQuery({
    queryKey: ["notifications", "list"],
    queryFn: () => getList(),
    enabled: isHosted && open,
  });

  // Close on outside click / Escape.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      if (
        panelRef.current &&
        e.target instanceof Node &&
        !panelRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  if (!isHosted) return null;

  const unread = countQuery.data?.count ?? 0;
  const items = listQuery.data ?? [];
  const hasUnread = unread > 0;

  async function refresh() {
    await queryClient.invalidateQueries({ queryKey: ["notifications"] });
  }

  async function handleOpenItem(id: string, linkPath: string | null) {
    try {
      await markRead({ data: { id } });
    } catch {
      // non-fatal: still navigate
    }
    setOpen(false);
    await refresh();
    if (linkPath) {
      // linkPath is a runtime-resolved internal path; the router can't infer
      // its type, so cast like other dynamic redirects in this codebase.
      // oxlint-disable-next-line typescript-eslint/no-unsafe-type-assertion
      void navigate({ to: linkPath as never });
    }
  }

  async function handleMarkAll() {
    try {
      await markAll();
      await refresh();
    } catch {
      // ignore
    }
  }

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        className="btn btn-ghost btn-sm btn-circle relative"
        aria-label={`Notifications${hasUnread ? ` (${unread} unread)` : ""}`}
        onClick={() => setOpen((v) => !v)}
      >
        <Bell className="h-5 w-5" />
        {hasUnread ? (
          <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-error px-1 text-[10px] font-bold text-error-content">
            {unread > 99 ? "99+" : unread}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute left-0 top-full z-40 mt-1 w-80 rounded-box border border-base-300 bg-base-100 shadow-lg">
          <div className="flex items-center justify-between border-b border-base-300 px-3 py-2">
            <span className="text-sm font-semibold">Notifications</span>
            {hasUnread ? (
              <button
                type="button"
                className="btn btn-ghost btn-xs"
                onClick={() => void handleMarkAll()}
              >
                <CheckCheck className="h-3.5 w-3.5" />
                Mark all read
              </button>
            ) : null}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {listQuery.isLoading ? (
              <p className="px-3 py-6 text-center text-sm text-base-content/50">
                <span className="loading loading-spinner loading-sm" />
              </p>
            ) : items.length === 0 ? (
              <p className="px-3 py-6 text-center text-sm text-base-content/50">
                You&apos;re all caught up.
              </p>
            ) : (
              <ul className="divide-y divide-base-200">
                {items.map((n) => (
                  <li key={n.id}>
                    <button
                      type="button"
                      className="block w-full px-3 py-2 text-left transition-colors hover:bg-base-200"
                      onClick={() => void handleOpenItem(n.id, n.linkPath)}
                    >
                      <div className="flex items-start gap-2">
                        <span
                          className={`mt-1.5 size-2 shrink-0 rounded-full ${
                            n.readAt ? "bg-transparent" : "bg-primary"
                          }`}
                        />
                        <div className="min-w-0 flex-1">
                          <p
                            className={`truncate text-sm ${
                              n.readAt
                                ? "text-base-content/60"
                                : "font-medium text-base-content"
                            }`}
                          >
                            {n.title}
                          </p>
                          {n.body ? (
                            <p className="mt-0.5 line-clamp-2 text-xs text-base-content/50">
                              {n.body}
                            </p>
                          ) : null}
                          <p className="mt-0.5 text-[11px] text-base-content/40">
                            {formatRelativeTime(n.createdAt)}
                          </p>
                        </div>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function formatRelativeTime(value: Date | string | null | undefined): string {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  const seconds = Math.round((date.getTime() - Date.now()) / 1000);
  const abs = Math.abs(seconds);
  const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });
  if (abs < 60) return rtf.format(seconds, "second");
  if (abs < 3600) return rtf.format(Math.round(seconds / 60), "minute");
  if (abs < 86400) return rtf.format(Math.round(seconds / 3600), "hour");
  if (abs < 2592000) return rtf.format(Math.round(seconds / 86400), "day");
  return rtf.format(Math.round(seconds / 2592000), "month");
}
