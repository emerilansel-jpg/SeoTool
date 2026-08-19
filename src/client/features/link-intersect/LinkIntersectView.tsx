import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createColumnHelper } from "@tanstack/react-table";
import type { SortingState } from "@tanstack/react-table";
import { AlertCircle, Waypoints } from "lucide-react";
import { toast } from "sonner";
import { getStandardErrorMessage } from "@/client/lib/error-messages";
import {
  AppDataTable,
  useAppTable,
} from "@/client/components/table/AppDataTable";
import { SortableHeader } from "@/client/components/table/SortableHeader";
import { getLinkIntersect } from "@/serverFunctions/link-intersect";
import { getProjects } from "@/serverFunctions/projects";
import { IntersectSummaryCards } from "@/client/features/link-intersect/LinkIntersectParts";
import type { IntersectDomain } from "@/server/features/link-intersect/services/linkIntersectTypes";

type IntersectResult = Awaited<ReturnType<typeof getLinkIntersect>>;

const MAX_COMPETITORS = 3;

/** Parse the competitors textarea into a normalized, de-duplicated list. */
function parseCompetitors(text: string): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const raw of text.split(/[\n,]+/)) {
    const value = raw
      .trim()
      .toLowerCase()
      .replace(/^https?:\/\//, "")
      .replace(/^www\./, "");
    if (!value || seen.has(value)) continue;
    seen.add(value);
    result.push(value);
  }
  return result;
}

const intersectColumnHelper = createColumnHelper<IntersectDomain>();

const intersectColumns = [
  intersectColumnHelper.accessor("domain", {
    header: "Domain",
    cell: ({ getValue }) => (
      <span className="block max-w-[280px] truncate" title={getValue()}>
        {getValue()}
      </span>
    ),
  }),
  intersectColumnHelper.accessor((row) => row.rank ?? 0, {
    id: "rank",
    header: ({ column }) => <SortableHeader column={column} label="Rank" />,
    cell: ({ row }) => <RankPill value={row.original.rank} />,
    sortDescFirst: true,
  }),
  intersectColumnHelper.accessor((row) => row.backlinks ?? 0, {
    id: "backlinks",
    header: ({ column }) => (
      <SortableHeader column={column} label="Backlinks" />
    ),
    cell: ({ row }) => (
      <span className="tabular-nums text-base-content/70">
        {row.original.backlinks != null
          ? row.original.backlinks.toLocaleString()
          : "—"}
      </span>
    ),
    sortDescFirst: true,
  }),
  intersectColumnHelper.accessor((row) => Object.keys(row.competitors).length, {
    id: "linksTo",
    header: "Links to",
    enableSorting: false,
    cell: ({ row }) => (
      <div className="flex flex-wrap gap-1">
        {Object.keys(row.original.competitors).map((comp) => (
          <span key={comp} className="badge badge-ghost badge-sm">
            {comp}
          </span>
        ))}
      </div>
    ),
  }),
];

function RankPill({ value }: { value: number | null }) {
  if (value == null) return <span className="text-base-content/30">—</span>;
  const tone =
    value < 20
      ? "badge-ghost"
      : value < 50
        ? "badge-warning badge-soft"
        : "badge-success badge-soft";
  return <span className={`badge badge-sm ${tone}`}>{value}</span>;
}

export function LinkIntersectView({ projectId }: { projectId: string }) {
  const projectsQuery = useQuery({
    queryKey: ["projects"],
    queryFn: () => getProjects(),
  });
  const project = projectsQuery.data?.find((p) => p.id === projectId);

  const [targetInput, setTargetInput] = useState("");
  const [competitorsText, setCompetitorsText] = useState("");
  const target = targetInput || project?.domain || "";

  const [formError, setFormError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: (vars: { target: string; competitors: string[] }) =>
      getLinkIntersect({
        data: {
          projectId,
          target: vars.target,
          competitors: vars.competitors,
        },
      }),
    onError: (error) => {
      toast.error(
        getStandardErrorMessage(error, "Failed to compute link intersection"),
      );
    },
  });

  const result = mutation.data;

  function handleRun() {
    const competitors = parseCompetitors(competitorsText).slice(
      0,
      MAX_COMPETITORS,
    );
    const cleanTarget = target.trim();
    if (!cleanTarget) {
      setFormError("Enter your site's domain.");
      return;
    }
    if (competitors.length === 0) {
      setFormError("Add at least one competitor domain.");
      return;
    }
    setFormError(null);
    mutation.mutate({ target: cleanTarget, competitors });
  }

  return (
    <div className="space-y-5">
      <div className="card bg-base-100 border border-base-300">
        <div className="card-body gap-3">
          <p className="text-xs text-base-content/50">
            Find domains linking to your competitors but not to you. Each call
            costs backlinks credits.
          </p>

          <div className="grid gap-3 md:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-xs font-medium uppercase tracking-wider text-base-content/50">
                Your domain
              </span>
              <input
                type="text"
                className="input input-bordered input-sm"
                placeholder="example.com"
                value={target}
                onChange={(e) => setTargetInput(e.target.value)}
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-medium uppercase tracking-wider text-base-content/50">
                Competitors (up to {MAX_COMPETITORS}, one per line)
              </span>
              <textarea
                className="textarea textarea-bordered textarea-sm h-20"
                placeholder={"competitor1.com\ncompetitor2.com"}
                value={competitorsText}
                onChange={(e) => setCompetitorsText(e.target.value)}
              />
            </label>
          </div>

          {formError && (
            <p className="flex items-center gap-2 text-sm text-error">
              <AlertCircle className="size-4" /> {formError}
            </p>
          )}

          <div>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={handleRun}
              disabled={mutation.isPending}
            >
              {mutation.isPending ? (
                <>
                  <span className="loading loading-spinner loading-xs" />{" "}
                  Analyzing…
                </>
              ) : (
                <>
                  <Waypoints className="size-4" /> Find link opportunities
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {result && <Results result={result} />}
    </div>
  );
}

function Results({ result }: { result: IntersectResult }) {
  const domains = result.domains;
  return (
    <>
      <IntersectSummaryCards
        summary={result.summary}
        competitorCount={result.competitors.length}
      />

      <div className="card bg-base-100 border border-base-300">
        <div className="card-body gap-2 p-0">
          <div className="flex items-center justify-between px-4 pt-4">
            <h3 className="text-sm font-medium text-base-content/70">
              Link opportunities
            </h3>
            <span className="text-xs text-base-content/40">
              {domains.length} shown
            </span>
          </div>
          {domains.length === 0 ? (
            <p className="px-4 pb-4 text-sm text-base-content/50">
              No link opportunities found. These competitors may share the same
              backlink profile as your domain.
            </p>
          ) : (
            <IntersectTable domains={domains} />
          )}
        </div>
      </div>
    </>
  );
}

function IntersectTable({ domains }: { domains: IntersectDomain[] }) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: "rank", desc: true },
  ]);
  const table = useAppTable({
    data: domains,
    columns: intersectColumns,
    state: { sorting },
    onSortingChange: setSorting,
    withSorting: true,
  });

  return <AppDataTable table={table} />;
}
