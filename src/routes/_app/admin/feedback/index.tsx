// oxlint-disable max-lines, max-lines-per-function, typescript-eslint/no-unsafe-assignment, typescript-eslint/no-unsafe-member-access, typescript-eslint/no-unsafe-type-assertion, typescript-eslint/no-unsafe-argument
import { useState } from "react";
import { toast } from "sonner";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Search } from "lucide-react";
import {
  listAdminFeedback,
  updateFeedbackStatus,
} from "@/serverFunctions/feedback";
import { APP_VERSION } from "@/shared/appVersion";
import type { FeedbackStatus } from "@/types/schemas/feedback";

const STATUS_BADGES: Record<FeedbackStatus, string> = {
  new: "badge-error",
  in_progress: "badge-warning",
  resolved: "badge-success",
  wont_fix: "badge-neutral",
};

const TYPE_LABELS: Record<string, string> = {
  bug: "🐞 Bug",
  feature: "💡 Feature",
};

interface AdminFeedbackSearch {
  type?: string;
  status?: string;
  q?: string;
}

export const Route = createFileRoute("/_app/admin/feedback/")({
  validateSearch: (search: Record<string, unknown>): AdminFeedbackSearch => ({
    type:
      search.type === "bug" || search.type === "feature"
        ? search.type
        : undefined,
    status:
      search.status === "new" ||
      search.status === "in_progress" ||
      search.status === "resolved" ||
      search.status === "wont_fix"
        ? search.status
        : undefined,
    q: typeof search.q === "string" ? search.q : undefined,
  }),
  component: AdminFeedbackPage,
});

function AdminFeedbackPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const listFeedback = useServerFn(listAdminFeedback);
  const updateStatus = useServerFn(updateFeedbackStatus);

  const [searchInput, setSearchInput] = useState(search.q ?? "");
  const [notifyUser, setNotifyUser] = useState(true);
  const [messageToUser, setMessageToUser] = useState("");
  const [quickStatusId, setQuickStatusId] = useState<string | null>(null);

  const feedbackQuery = useQuery({
    queryKey: ["admin-feedback", search.type, search.status, search.q],
    queryFn: () =>
      listFeedback({
        data: {
          type: search.type as "bug" | "feature" | undefined,
          status: search.status as FeedbackStatus | undefined,
          search: search.q || undefined,
          page: 1,
          pageSize: 50,
        },
      }),
  });

  const resolveMutation = useMutation({
    mutationFn: (input: { id: string; status: FeedbackStatus }) =>
      updateStatus({
        data: {
          id: input.id,
          status: input.status,
          resolvedInVersion: APP_VERSION,
          notifyUser,
          messageToUser: messageToUser || undefined,
        },
      }),
    onSuccess: (result) => {
      toast.success(
        result.emailed
          ? "Status updated. The reporter has been emailed."
          : "Status updated.",
      );
      setQuickStatusId(null);
      setMessageToUser("");
      void queryClient.invalidateQueries({ queryKey: ["admin-feedback"] });
      void queryClient.invalidateQueries({
        queryKey: ["admin-feedback-count"],
      });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const rows = feedbackQuery.data?.items ?? [];
  const total = feedbackQuery.data?.total ?? 0;

  function setFilter(next: Partial<AdminFeedbackSearch>) {
    void navigate({
      to: "/admin/feedback",
      search: { ...search, ...next },
    });
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        <label className="input input-bordered input-sm flex flex-1 items-center gap-2">
          <Search className="size-4 text-base-content/40" />
          <input
            type="text"
            className="grow"
            placeholder="Search by title, email, or report number..."
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter")
                setFilter({ q: searchInput || undefined });
            }}
          />
        </label>
        <select
          className="select select-bordered select-sm"
          value={search.type ?? ""}
          onChange={(event) =>
            setFilter({ type: event.target.value || undefined })
          }
          aria-label="Filter by type"
        >
          <option value="">All types</option>
          <option value="bug">🐞 Bugs</option>
          <option value="feature">💡 Features</option>
        </select>
        <select
          className="select select-bordered select-sm"
          value={search.status ?? ""}
          onChange={(event) =>
            setFilter({ status: event.target.value || undefined })
          }
          aria-label="Filter by status"
        >
          <option value="">All statuses</option>
          <option value="new">New</option>
          <option value="in_progress">In progress</option>
          <option value="resolved">Resolved</option>
          <option value="wont_fix">Won't fix</option>
        </select>
        <span className="text-xs text-base-content/50 tabular-nums">
          {total} reports
        </span>
      </div>

      <div className="rounded-lg border border-warning/30 bg-warning/10 p-3 text-xs">
        When you change a status to <strong>resolved</strong>, the reporter can
        be notified by email once. Fill in a short message for them below.
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          className="checkbox checkbox-sm"
          checked={notifyUser}
          onChange={(event) => setNotifyUser(event.target.checked)}
        />
        Notify user by email when marked resolved
      </label>
      <textarea
        value={messageToUser}
        onChange={(event) => setMessageToUser(event.target.value)}
        rows={2}
        placeholder="Message to user (optional) — e.g. 'This is fixed in v1.1.0, thanks for catching it!'"
        className="textarea textarea-bordered w-full text-sm"
      />

      <div className="card bg-base-100 border border-base-300">
        <div className="card-body p-0">
          {feedbackQuery.isLoading ? (
            <div className="flex items-center justify-center p-10">
              <Loader2 className="size-6 animate-spin text-primary" />
            </div>
          ) : rows.length === 0 ? (
            <div className="p-10 text-center text-sm text-base-content/50">
              No feedback reports match these filters. When users click the
              "Report a Bug / Request a Feature" button, their reports appear
              here.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table table-sm">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Type</th>
                    <th>Title</th>
                    <th>Email</th>
                    <th>Status</th>
                    <th>Received</th>
                    <th>Set status</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.id} className="hover:bg-base-200/50">
                      <td className="font-mono text-xs">
                        <Link
                          to="/admin/feedback/$feedbackId"
                          params={{ feedbackId: row.id }}
                          className="link link-hover link-primary"
                        >
                          #{row.displayNumber}
                        </Link>
                      </td>
                      <td>{TYPE_LABELS[row.type] ?? row.type}</td>
                      <td className="max-w-[240px]">
                        <Link
                          to="/admin/feedback/$feedbackId"
                          params={{ feedbackId: row.id }}
                          className="line-clamp-1 link link-hover"
                        >
                          {row.title}
                        </Link>
                      </td>
                      <td className="max-w-[180px] truncate text-xs text-base-content/60">
                        {row.email}
                      </td>
                      <td>
                        <span
                          className={`badge badge-sm ${STATUS_BADGES[row.status] ?? "badge-ghost"}`}
                        >
                          {row.status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="text-xs text-base-content/60">
                        {row.createdAt
                          ? new Date(row.createdAt).toLocaleDateString()
                          : "-"}
                      </td>
                      <td>
                        {quickStatusId === row.id ? (
                          <select
                            className="select select-xs"
                            autoFocus
                            defaultValue=""
                            onChange={(event) => {
                              const value = event.target.value;
                              setQuickStatusId(null);
                              if (value) {
                                resolveMutation.mutate({
                                  id: row.id,
                                  status: value as FeedbackStatus,
                                });
                              }
                            }}
                            onBlur={() => setQuickStatusId(null)}
                            aria-label={`Set status for report #${row.displayNumber}`}
                          >
                            <option value="" disabled>
                              Choose...
                            </option>
                            <option value="new">New</option>
                            <option value="in_progress">In progress</option>
                            <option value="resolved">Resolved</option>
                            <option value="wont_fix">Won't fix</option>
                          </select>
                        ) : (
                          <button
                            type="button"
                            className="btn btn-ghost btn-xs"
                            onClick={() => setQuickStatusId(row.id)}
                          >
                            Change
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      {resolveMutation.isPending ? (
        <div className="flex items-center gap-2 text-sm text-base-content/60">
          <Loader2 className="size-4 animate-spin" /> Updating status...
        </div>
      ) : null}
    </div>
  );
}
