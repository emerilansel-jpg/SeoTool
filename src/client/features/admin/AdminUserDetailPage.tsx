import { useState } from "react";
import { Link, useParams } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { ArrowLeft, LogOut, ShieldBan, ShieldOff } from "lucide-react";
import {
  banUser,
  forceLogout,
  getAdminUserDetail,
  unbanUser,
} from "@/serverFunctions/admin-users";
import { PLAN_TIER_LABELS, isPlanTier } from "@/shared/plans";
import { Modal } from "@/client/components/Modal";
import { getStandardErrorMessage } from "@/client/lib/error-messages";
import { AdminOrgActions } from "@/client/features/admin/AdminOrgActions";

const TIER_BADGE_CLASS: Record<string, string> = {
  free: "badge-neutral",
  lite: "badge-primary",
  pro: "badge-success",
  agency: "badge-warning",
};

export function AdminUserDetailPage() {
  const { userId } = useParams({ from: "/_app/admin/users/$userId" });
  const getDetail = useServerFn(getAdminUserDetail);
  const runBan = useServerFn(banUser);
  const runUnban = useServerFn(unbanUser);
  const runForceLogout = useServerFn(forceLogout);
  const queryClient = useQueryClient();

  const [banOpen, setBanOpen] = useState(false);
  const [banReason, setBanReason] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-user", userId],
    queryFn: () => getDetail({ data: { userId } }),
  });

  const invalidate = () =>
    void queryClient.invalidateQueries({ queryKey: ["admin-user", userId] });

  const banMutation = useMutation({
    mutationFn: () =>
      runBan({ data: { userId, banReason: banReason || undefined } }),
    onSuccess: () => {
      toast.success("User banned and all sessions revoked.");
      setBanOpen(false);
      setBanReason("");
      invalidate();
    },
    onError: (error) => {
      toast.error(getStandardErrorMessage(error, "Could not ban user."));
    },
  });

  const unbanMutation = useMutation({
    mutationFn: () => runUnban({ data: { userId } }),
    onSuccess: () => {
      toast.success("User unbanned.");
      invalidate();
    },
    onError: (error) => {
      toast.error(getStandardErrorMessage(error, "Could not unban user."));
    },
  });

  const logoutMutation = useMutation({
    mutationFn: () => runForceLogout({ data: { userId } }),
    onSuccess: () => {
      toast.success("All sessions revoked.");
      invalidate();
    },
    onError: (error) => {
      toast.error(getStandardErrorMessage(error, "Could not revoke sessions."));
    },
  });

  if (isLoading) {
    return <div className="skeleton h-64 rounded-lg" aria-busy="true" />;
  }

  if (!data) {
    return (
      <div className="rounded-lg border border-dashed border-base-300 p-8 text-center text-sm text-base-content/60">
        User not found.{" "}
        <Link to="/admin/users" className="link link-hover">
          Back to users
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm">
        <Link to="/admin/users" className="btn btn-ghost btn-xs gap-1">
          <ArrowLeft className="size-3.5" /> Users
        </Link>
      </div>

      <div className="card bg-base-100 border border-base-300">
        <div className="card-body p-4 gap-3">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="text-lg font-semibold">{data.name}</h2>
              <p className="font-mono text-sm text-base-content/60">
                {data.email}
              </p>
              <div className="mt-2 flex flex-wrap gap-1">
                {data.emailVerified ? (
                  <span className="badge badge-sm badge-success">Verified</span>
                ) : (
                  <span className="badge badge-sm badge-warning">
                    Unverified
                  </span>
                )}
                {data.banned ? (
                  <span className="badge badge-sm badge-error">
                    Banned{data.banCount > 1 ? ` (${data.banCount}x)` : ""}
                  </span>
                ) : null}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {data.banned ? (
                <button
                  type="button"
                  className="btn btn-ghost btn-sm gap-1"
                  disabled={unbanMutation.isPending}
                  onClick={() => unbanMutation.mutate()}
                >
                  <ShieldOff className="size-4" /> Unban
                </button>
              ) : (
                <button
                  type="button"
                  className="btn btn-error btn-soft btn-sm gap-1"
                  onClick={() => setBanOpen(true)}
                >
                  <ShieldBan className="size-4" /> Ban
                </button>
              )}
              <button
                type="button"
                className="btn btn-ghost btn-sm gap-1"
                disabled={logoutMutation.isPending}
                onClick={() => logoutMutation.mutate()}
              >
                <LogOut className="size-4" /> Force logout
              </button>
            </div>
          </div>
          <div className="grid gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
            <InfoRow label="Joined">
              {data.createdAt ? new Date(data.createdAt).toLocaleString() : "-"}
            </InfoRow>
            <InfoRow label="Active sessions">{data.sessionCount}</InfoRow>
            {data.banReason ? (
              <InfoRow label="Ban reason">{data.banReason}</InfoRow>
            ) : null}
          </div>
        </div>
      </div>

      {data.orgs.map((org) => (
        <div key={org.id} className="card bg-base-100 border border-base-300">
          <div className="card-body p-4 gap-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="min-w-0">
                <h3 className="font-semibold">{org.name}</h3>
                <p className="font-mono text-xs text-base-content/50">
                  {org.id}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-1">
                <span className="badge badge-sm badge-ghost">{org.role}</span>
                <span
                  className={`badge badge-sm ${TIER_BADGE_CLASS[org.planTier] ?? "badge-neutral"}`}
                >
                  {isPlanTier(org.planTier)
                    ? PLAN_TIER_LABELS[org.planTier]
                    : org.planTier}
                </span>
                <span
                  className={`badge badge-sm ${org.status === "active" ? "badge-success" : "badge-warning"}`}
                >
                  {org.status}
                </span>
              </div>
            </div>
            <div className="grid gap-x-6 gap-y-1 text-sm sm:grid-cols-3">
              <InfoRow label="Monthly credits">
                <span className="font-mono tabular-nums">
                  {org.monthlyCreditsRemaining.toLocaleString()}
                </span>
              </InfoRow>
              <InfoRow label="Topup credits">
                <span className="font-mono tabular-nums">
                  {org.topupCreditsRemaining.toLocaleString()}
                </span>
              </InfoRow>
              <InfoRow label="Period ends">
                {org.currentPeriodEnd
                  ? new Date(org.currentPeriodEnd).toLocaleDateString()
                  : "-"}
              </InfoRow>
            </div>
            <AdminOrgActions organizationId={org.id} planTier={org.planTier} />
          </div>
        </div>
      ))}

      {banOpen ? (
        <Modal labelledBy="ban-user-title" onClose={() => setBanOpen(false)}>
          <h3 id="ban-user-title" className="font-semibold text-base">
            Ban {data.name}
          </h3>
          <p className="text-xs text-base-content/60">
            The user is signed out everywhere and cannot sign in until unbanned.
          </p>
          <input
            type="text"
            className="input input-bordered w-full text-sm"
            placeholder="Reason (optional)"
            value={banReason}
            onChange={(event) => setBanReason(event.target.value)}
          />
          <div className="modal-action">
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => setBanOpen(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-error btn-sm"
              disabled={banMutation.isPending}
              onClick={() => banMutation.mutate()}
            >
              Ban user
            </button>
          </div>
        </Modal>
      ) : null}
    </div>
  );
}

function InfoRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-baseline justify-between gap-2 border-b border-base-300/50 py-1 last:border-0">
      <span className="text-xs uppercase tracking-wide text-base-content/45">
        {label}
      </span>
      <span className="text-right text-sm">{children}</span>
    </div>
  );
}
