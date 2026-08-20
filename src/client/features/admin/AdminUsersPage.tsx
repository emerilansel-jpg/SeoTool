import { useState } from "react";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import type { ColumnDef } from "@tanstack/react-table";
import { Search } from "lucide-react";
import { searchUsers } from "@/serverFunctions/admin-users";
import type { AdminUserListItem } from "@/server/features/admin/repositories/AdminUserRepository";
import { PLAN_TIER_LABELS, isPlanTier } from "@/shared/plans";
import { useAppTable } from "@/client/components/table/AppDataTable";
import { AppDataTable } from "@/client/components/table/AppDataTable";

const TIER_BADGE_CLASS: Record<string, string> = {
  free: "badge-neutral",
  lite: "badge-primary",
  pro: "badge-success",
  agency: "badge-warning",
};

const PAGE_SIZE = 25;

export function AdminUsersPage() {
  const search = useSearch({ from: "/_app/admin/users/" });
  const navigate = useNavigate();
  const runSearch = useServerFn(searchUsers);

  const q = search.q ?? "";
  const page = search.page ?? 1;

  const [input, setInput] = useState(q);
  const [debounce, setDebounce] = useState<ReturnType<
    typeof setTimeout
  > | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-users", q, page],
    queryFn: () =>
      runSearch({
        data: { search: q || undefined, page, pageSize: PAGE_SIZE },
      }),
  });

  const onSearchChange = (value: string) => {
    setInput(value);
    if (debounce) clearTimeout(debounce);
    setDebounce(
      setTimeout(() => {
        void navigate({
          to: "/admin/users",
          search: { q: value || undefined, page: 1 },
          replace: true,
        });
      }, 350),
    );
  };

  const goToPage = (nextPage: number) => {
    void navigate({
      to: "/admin/users",
      search: { q: q || undefined, page: nextPage },
      replace: true,
    });
  };

  const columns: ColumnDef<AdminUserListItem>[] = [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <div className="min-w-0">
          <div className="truncate font-medium">{row.original.name}</div>
          <div className="truncate text-xs text-base-content/50">
            {row.original.email}
          </div>
        </div>
      ),
    },
    {
      id: "plan",
      header: "Plan",
      cell: ({ row }) => {
        const tier = row.original.planTier ?? "free";
        return (
          <span
            className={`badge badge-sm ${TIER_BADGE_CLASS[tier] ?? "badge-neutral"}`}
          >
            {isPlanTier(tier) ? PLAN_TIER_LABELS[tier] : tier}
          </span>
        );
      },
    },
    {
      id: "status",
      header: "Status",
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
          {row.original.banned ? (
            <span className="badge badge-sm badge-error">Banned</span>
          ) : null}
          {row.original.emailVerified ? (
            <span className="badge badge-sm badge-ghost">Verified</span>
          ) : (
            <span className="badge badge-sm badge-ghost">Unverified</span>
          )}
        </div>
      ),
    },
    {
      accessorKey: "organizationName",
      header: "Organization",
      cell: ({ row }) => (
        <span className="text-sm text-base-content/70">
          {row.original.organizationName ?? "-"}
        </span>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Joined",
      cell: ({ row }) => (
        <span className="text-sm tabular-nums text-base-content/60">
          {row.original.createdAt
            ? new Date(row.original.createdAt).toLocaleDateString()
            : "-"}
        </span>
      ),
    },
  ];

  const table = useAppTable({
    data: data?.users ?? [],
    columns,
  });

  const total = data?.total ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <label className="input input-bordered input-sm flex flex-1 items-center gap-2">
          <Search className="size-4 text-base-content/40" />
          <input
            type="text"
            className="grow"
            placeholder="Search by name or email..."
            value={input}
            onChange={(event) => onSearchChange(event.target.value)}
          />
        </label>
        <span className="text-xs text-base-content/50 tabular-nums">
          {total} users
        </span>
      </div>

      <div className="card bg-base-100 border border-base-300">
        <div className="card-body p-0">
          <AppDataTable
            table={table}
            isLoading={isLoading}
            loading={
              <div className="p-4">
                <div className="skeleton h-40 rounded-lg" />
              </div>
            }
            empty={
              <div className="border border-dashed border-base-300 rounded-lg m-4 p-8 text-center text-sm text-base-content/50">
                {q ? `No users match "${q}".` : "No users yet."}
              </div>
            }
            getRowProps={(row) => ({
              className: "cursor-pointer hover:bg-base-200/50",
              onClick: () =>
                void navigate({
                  to: "/admin/users/$userId",
                  params: { userId: row.original.id },
                }),
            })}
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

      <p className="text-xs text-base-content/40">
        Click a row to open the user detail with billing and moderation actions.{" "}
        <Link to="/admin/billing" className="link link-hover">
          Billing admin
        </Link>{" "}
        lists organizations by subscription instead.
      </p>
    </div>
  );
}
