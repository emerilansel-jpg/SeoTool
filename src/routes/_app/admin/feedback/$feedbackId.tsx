// oxlint-disable max-lines, max-lines-per-function, typescript-eslint/no-unsafe-assignment, typescript-eslint/no-unsafe-member-access, typescript-eslint/no-unsafe-type-assertion, typescript-eslint/no-unsafe-argument
import { useState } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  getAdminFeedbackDetail,
  resendFeedbackNotification,
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

export const Route = createFileRoute("/_app/admin/feedback/$feedbackId")({
  component: AdminFeedbackDetailPage,
});

function AdminFeedbackDetailPage() {
  const { feedbackId } = Route.useParams();
  const queryClient = useQueryClient();
  const getDetail = useServerFn(getAdminFeedbackDetail);
  const updateStatus = useServerFn(updateFeedbackStatus);
  const resendNotification = useServerFn(resendFeedbackNotification);

  const [notifyUser, setNotifyUser] = useState(true);
  const [messageToUser, setMessageToUser] = useState("");
  const [newStatus, setNewStatus] = useState<FeedbackStatus | "">("");

  const detailQuery = useQuery({
    queryKey: ["admin-feedback-detail", feedbackId],
    queryFn: () => getDetail({ data: { id: feedbackId } }),
  });

  const statusMutation = useMutation({
    mutationFn: (status: FeedbackStatus) =>
      updateStatus({
        data: {
          id: feedbackId,
          status,
          resolvedInVersion:
            status === "resolved" || status === "wont_fix"
              ? APP_VERSION
              : undefined,
          notifyUser,
          messageToUser: messageToUser || undefined,
        },
      }),
    onSuccess: (result) => {
      toast.success(
        result.emailed
          ? "Saved. The reporter has been emailed."
          : "Saved. (No email sent — already notified or notify disabled.)",
      );
      void queryClient.invalidateQueries({
        queryKey: ["admin-feedback-detail", feedbackId],
      });
      void queryClient.invalidateQueries({ queryKey: ["admin-feedback"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const resendMutation = useMutation({
    mutationFn: () => resendNotification({ data: { id: feedbackId } }),
    onSuccess: (result) => {
      toast.success(
        result.emailed
          ? "Resolution email sent to the reporter."
          : "No email was sent (template not configured). Check server logs.",
      );
      void queryClient.invalidateQueries({
        queryKey: ["admin-feedback-detail", feedbackId],
      });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  if (detailQuery.isLoading) {
    return (
      <div className="flex items-center justify-center p-10">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    );
  }

  if (detailQuery.isError || !detailQuery.data) {
    return (
      <div className="space-y-3 text-sm">
        <p className="text-error">
          Could not load this report. It may have been removed.
        </p>
        <Link to="/admin/feedback" className="btn btn-ghost btn-sm">
          ← Back to all feedback
        </Link>
      </div>
    );
  }

  const row = detailQuery.data;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <Link to="/admin/feedback" className="btn btn-ghost btn-sm">
          ← All feedback
        </Link>
        <span className={`badge ${STATUS_BADGES[row.status] ?? "badge-ghost"}`}>
          {row.status.replace("_", " ")}
        </span>
      </div>

      <div className="card bg-base-100 border border-base-300">
        <div className="card-body gap-4 p-5">
          <div className="flex items-baseline gap-3">
            <span className="font-mono text-lg font-bold text-primary">
              #{row.displayNumber}
            </span>
            <h2 className="text-lg font-bold">{row.title}</h2>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm text-base-content/70 md:grid-cols-4">
            <div>
              <span className="block text-xs text-base-content/50">Type</span>
              {row.type === "bug" ? "🐞 Bug" : "💡 Feature request"}
            </div>
            <div>
              <span className="block text-xs text-base-content/50">
                Reporter email
              </span>
              <span className="break-all">{row.email}</span>
            </div>
            <div>
              <span className="block text-xs text-base-content/50">
                Received
              </span>
              {row.createdAt ? new Date(row.createdAt).toLocaleString() : "-"}
            </div>
            <div>
              <span className="block text-xs text-base-content/50">
                App version
              </span>
              {row.appVersion ? `v${row.appVersion}` : "-"}
            </div>
            <div className="md:col-span-2">
              <span className="block text-xs text-base-content/50">
                Page URL
              </span>
              <span className="break-all font-mono text-xs">
                {row.pageUrl ?? "-"}
              </span>
            </div>
            <div className="md:col-span-2">
              <span className="block text-xs text-base-content/50">
                Browser / OS
              </span>
              <span className="break-all text-xs">{row.userAgent ?? "-"}</span>
            </div>
          </div>

          <div>
            <h3 className="mb-1 text-xs font-bold uppercase tracking-wider text-base-content/50">
              Description
            </h3>
            <p className="whitespace-pre-wrap rounded-lg bg-base-200/50 p-3 text-sm leading-relaxed">
              {row.description}
            </p>
          </div>

          {row.screenshotBase64 ? (
            <div>
              <h3 className="mb-1 text-xs font-bold uppercase tracking-wider text-base-content/50">
                Screenshot
              </h3>
              <img
                src={`data:${row.screenshotMime ?? "image/png"};base64,${row.screenshotBase64}`}
                alt="Reporter screenshot"
                className="max-h-[400px] rounded-lg border border-base-300"
              />
            </div>
          ) : null}

          <div className="border-t border-base-200 pt-4">
            <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-base-content/50">
              Resolution
            </h3>
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <select
                  className="select select-bordered select-sm"
                  value={newStatus || row.status}
                  onChange={(event) =>
                    setNewStatus(event.target.value as FeedbackStatus)
                  }
                  aria-label="Change report status"
                >
                  <option value="new">New</option>
                  <option value="in_progress">In progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="wont_fix">Won't fix</option>
                </select>
                <input
                  type="text"
                  value={
                    row.resolvedInVersion && newStatus === ""
                      ? row.resolvedInVersion
                      : APP_VERSION
                  }
                  readOnly
                  className="input input-bordered input-sm w-24 font-mono"
                  aria-label="Version containing the fix"
                />
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  disabled={statusMutation.isPending || !newStatus}
                  onClick={() => {
                    if (newStatus) statusMutation.mutate(newStatus);
                  }}
                >
                  {statusMutation.isPending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    "Save status"
                  )}
                </button>
              </div>

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  className="checkbox checkbox-sm"
                  checked={notifyUser}
                  onChange={(event) => setNotifyUser(event.target.checked)}
                />
                Notify user by email
              </label>
              <textarea
                value={messageToUser}
                onChange={(event) => setMessageToUser(event.target.value)}
                rows={2}
                placeholder="Message to user (optional) — included in the resolution email."
                className="textarea textarea-bordered w-full text-sm"
              />

              <div className="flex flex-wrap items-center gap-3 text-sm">
                {row.notifiedAt ? (
                  <span className="text-xs text-success">
                    ✓ Notified {new Date(row.notifiedAt).toLocaleString()}
                  </span>
                ) : (
                  <span className="text-xs text-base-content/50">
                    Not notified yet
                  </span>
                )}
                <button
                  type="button"
                  className="btn btn-ghost btn-xs"
                  disabled={resendMutation.isPending}
                  onClick={() => resendMutation.mutate()}
                >
                  {resendMutation.isPending ? (
                    <Loader2 className="size-3 animate-spin" />
                  ) : (
                    "Resend Notification"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
