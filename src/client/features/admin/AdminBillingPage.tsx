import { useState } from "react";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import type { ColumnDef } from "@tanstack/react-table";
import { Search } from "lucide-react";
import {
  listAdminSubscriptions,
  listAdminWebhookEvents,
  listAdminCancellationFeedback,
} from "@/serverFunctions/admin-billing";
import type { AdminSubscriptionListItem } from "@/server/features/admin/repositories/AdminBillingRepository";
import { PLAN_TIER_LABELS, isPlanTier } from "@/shared/plans";
import {
  CANCELLATION_REASON_LABELS,
  type CancellationReason,
} from "@/shared/cancellation";
import {
  AppDataTable,
  useAppTable,
} from "@/client/components/table/AppDataTable";
import { AdminOrgActions } from "@/client/features/admin/AdminOrgActions";

const TIER_BADGE_CLASS: Record<string, string> = {
  free: "badge-neutral",
  lite: "badge-primary",
  pro: "badge-success",
  agency: "badge-warning",
};

const PAGE_SIZE = 20;

function isCancellationReason(value: string): value is CancellationReason {
  return value in CANCELLATION_REASON_LABELS;
}

export function AdminBillingPage() {
  const search = useSearch({ from: "/_app/admin/billing/" });
  const navigate = useNavigate();
  const listSubs = useServerFn(listAdminSubscriptions);
  const listEvents = useServerFn(listAdminWebhookEvents);
  const listCancellations = useServerFn(listAdminCancellationFeedback);

  const q = search.q ?? "";
  const page = search.page ?? 1;

  const [input, setInput] = useState(q);
  const [debounce, setDebounce] = useState<ReturnType<
    typeof setTimeout
  > | null>(null);

  const subsQuery = useQuery({
    queryKey: ["admin-subs", q, page],
    queryFn: () =>
      listSubs({
        data: { search: q || undefined, page, pageSize: PAGE_SIZE },
      }),
  });

  const eventsQuery = useQuery({
    queryKey: ["admin-webhook-events"],
    queryFn: () => listEvents(),
  });

  const cancellationsQuery = useQuery({
    queryKey: ["admin-cancellation-feedback"],
    queryFn: () => listCancellations(),
  });

  const onSearchChange = (value: string) => {
    setInput(value);
    if (debounce) clearTimeout(debounce);
    setDebounce(
      setTimeout(() => {
        void navigate({
          to: "/admin/billing",
          search: { q: value || undefined, page: 1 },
          replace: true,
        });
      }, 350),
    );
  };

  const goToPage = (nextPage: number) => {
    void navigate({
      to: "/admin/billing",
      search: { q: q || undefined, page: nextPage },
      replace: true,
    });
  };

  const columns: ColumnDef<AdminSubscriptionListItem>[] = [
    {
      id: "org",
      header: "Organization",
      cell: ({ row }) => (
        <div className="min-w-0">
          <div className="truncate font-medium">
            {row.original.organizationName}
          </div>
          <div className="truncate text-xs text-base-content/50">
            {row.original.ownerEmail ?? "no owner"}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "planTier",
      header: "Plan",
      cell: ({ row }) => {
        const tier = row.original.planTier;
        return (
          <div className="flex flex-col items-start gap-1">
            <span
              className={`badge badge-sm ${TIER_BADGE_CLASS[tier] ?? "badge-neutral"}`}
            >
              {isPlanTier(tier) ? PLAN_TIER_LABELS[tier] : tier}
            </span>
            {row.original.paypalSubscriptionId ? (
              <span className="font-mono text-[10px] text-base-content/40">
                {row.original.paypalSubscriptionId}
              </span>
            ) : null}
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <span
          className={`badge badge-sm ${row.original.status === "active" ? "badge-success" : "badge-warning"}`}
        >
          {row.original.status}
        </span>
      ),
    },
    {
      id: "period",
      header: "Period ends",
      cell: ({ row }) => (
        <span className="text-sm tabular-nums text-base-content/60">
          {row.original.currentPeriodEnd
            ? new Date(row.original.currentPeriodEnd).toLocaleDateString()
            : "-"}
        </span>
      ),
    },
    {
      id: "owner",
      header: "Owner",
      cell: ({ row }) =>
        row.original.ownerUserId ? (
          <Link
            to="/admin/users/$userId"
            params={{ userId: row.original.ownerUserId }}
            className="link link-hover link-primary text-xs"
          >
            View user
          </Link>
        ) : (
          <span className="text-xs text-base-content/40">-</span>
        ),
    },
    {
      id: "actions",
      header: "Actions",
      enableSorting: false,
      cell: ({ row }) => (
        <AdminOrgActions
          organizationId={row.original.organizationId}
          planTier={row.original.planTier}
        />
      ),
    },
  ];

  const table = useAppTable({
    data: subsQuery.data?.subscriptions ?? [],
    columns,
  });

  const total = subsQuery.data?.total ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const events = eventsQuery.data ?? [];
  const cancellations = cancellationsQuery.data ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <label className="input input-bordered input-sm flex flex-1 items-center gap-2">
          <Search className="size-4 text-base-content/40" />
          <input
            type="text"
            className="grow"
            placeholder="Search by organization or owner email..."
            value={input}
            onChange={(event) => onSearchChange(event.target.value)}
          />
        </label>
        <span className="text-xs text-base-content/50 tabular-nums">
          {total} subscriptions
        </span>
      </div>

      <div className="card bg-base-100 border border-base-300">
        <div className="card-body p-0">
          <AppDataTable
            table={table}
            isLoading={subsQuery.isLoading}
            loading={
              <div className="p-4">
                <div className="skeleton h-40 rounded-lg" />
              </div>
            }
            empty={
              <div className="border border-dashed border-base-300 rounded-lg m-4 p-8 text-center text-sm text-base-content/50">
                {q ? `No subscriptions match "${q}".` : "No subscriptions yet."}
              </div>
            }
          />
        </div>
      </div>

      {pageCount > 1 ? (
        <div className="flex items-center justify-between">
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            disabled={page <= 1}
            onClick={() => goToPage(page - 1)}
          >
            Previous
          </button>
          <span className="text-xs text-base-content/50 tabular-nums">
            Page {page} of {pageCount}
          </span>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            disabled={page >= pageCount}
            onClick={() => goToPage(page + 1)}
          >
            Next
          </button>
        </div>
      ) : null}

      <div className="card bg-base-100 border border-base-300 overflow-hidden">
        <div className="border-b border-base-300 bg-base-200 p-4">
          <h2 className="font-medium">Recent PayPal Webhook Events</h2>
          <p className="mt-1 text-xs text-base-content/50">
            Every verified delivery, deduplicated by PayPal event id. Failed
            rows kept the raw payload for debugging.
          </p>
        </div>
        {events.length === 0 ? (
          <p className="p-8 text-center text-sm text-base-content/50">
            No webhook events recorded yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="table table-sm">
              <thead>
                <tr>
                  <th>Received</th>
                  <th>Event</th>
                  <th>Org</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {events.map((event) => (
                  <tr key={event.id}>
                    <td className="text-sm tabular-nums text-base-content/60">
                      {event.receivedAt
                        ? new Date(event.receivedAt).toLocaleString()
                        : "-"}
                    </td>
                    <td className="font-mono text-xs">{event.eventType}</td>
                    <td className="font-mono text-xs text-base-content/50">
                      {event.organizationId ?? "-"}
                    </td>
                    <td>
                      <span
                        className={`badge badge-sm ${
                          event.status === "processed"
                            ? "badge-success"
                            : event.status === "failed"
                              ? "badge-error"
                              : "badge-ghost"
                        }`}
                      >
                        {event.status}
                      </span>
                      {event.errorMessage ? (
                        <span className="ml-2 text-xs text-error/80">
                          {event.errorMessage}
                        </span>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="card bg-base-100 border border-base-300 overflow-hidden">
        <div className="border-b border-base-300 bg-base-200 p-4">
          <h2 className="font-medium">Recent Cancellation Feedback</h2>
          <p className="mt-1 text-xs text-base-content/50">
            Exit-survey responses from the All Access cancel flow. Use the
            reasons to target save offers and product fixes.
          </p>
        </div>
        {cancellations.length === 0 ? (
          <p className="p-8 text-center text-sm text-base-content/50">
            No cancellation feedback recorded yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="table table-sm">
              <thead>
                <tr>
                  <th>When</th>
                  <th>Organization</th>
                  <th>Plan</th>
                  <th>Reason</th>
                  <th>Detail</th>
                </tr>
              </thead>
              <tbody>
                {cancellations.map((row) => (
                  <tr key={row.id}>
                    <td className="text-sm tabular-nums text-base-content/60">
                      {row.createdAt
                        ? new Date(row.createdAt).toLocaleString()
                        : "-"}
                    </td>
                    <td className="text-sm">
                      {row.organizationName ?? row.organizationId}
                    </td>
                    <td className="text-sm">{row.planTier}</td>
                    <td>
                      <span className="badge badge-sm badge-ghost">
                        {isCancellationReason(row.reason)
                          ? CANCELLATION_REASON_LABELS[row.reason]
                          : row.reason}
                      </span>
                    </td>
                    <td className="max-w-xs truncate text-xs text-base-content/60">
                      {row.detail ?? "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
