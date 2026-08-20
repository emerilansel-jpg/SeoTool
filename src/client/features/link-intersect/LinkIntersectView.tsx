import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createColumnHelper } from "@tanstack/react-table";
import type { SortingState } from "@tanstack/react-table";
import { AlertCircle, Globe, Layers, Sparkles, Waypoints } from "lucide-react";
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

const SAMPLE_PRESETS = [
  {
    label: "SaaS Billing (Stripe vs Competitors)",
    target: "stripe.com",
    competitors: "paddle.com\nadyen.com",
  },
  {
    label: "Cloud Platforms (Vercel vs Competitors)",
    target: "vercel.com",
    competitors: "netlify.com\ncloudflare.com",
  },
  {
    label: "Issue Tracking (Linear vs Competitors)",
    target: "linear.app",
    competitors: "asana.com\nmonday.com",
  },
];

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
      <span
        className="block max-w-[280px] font-medium truncate text-base-content"
        title={getValue()}
      >
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
      <span className="tabular-nums font-semibold text-base-content/80">
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
      <div className="flex flex-wrap gap-1.5">
        {Object.keys(row.original.competitors).map((comp) => (
          <span
            key={comp}
            className="badge badge-neutral badge-soft badge-sm font-semibold"
          >
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
        ? "badge-warning badge-soft text-warning"
        : "badge-success badge-soft text-success";
  return (
    <span className={`badge badge-sm font-semibold ${tone}`}>{value}</span>
  );
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

  function handleRun(customTarget?: string, customCompetitors?: string) {
    const cleanTarget = (customTarget ?? target).trim();
    const competitorsSource = customCompetitors ?? competitorsText;
    const competitors = parseCompetitors(competitorsSource).slice(
      0,
      MAX_COMPETITORS,
    );

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

  function applyPreset(preset: (typeof SAMPLE_PRESETS)[number]) {
    setTargetInput(preset.target);
    setCompetitorsText(preset.competitors);
    handleRun(preset.target, preset.competitors);
  }

  return (
    <div className="space-y-6">
      {/* Controls Form Card */}
      <div className="card bg-base-100 border border-base-300 rounded-2xl shadow-xs">
        <div className="card-body gap-4 p-5 md:p-6">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-base-200 pb-3">
            <div className="flex items-center gap-2">
              <Waypoints className="size-4 text-primary" />
              <h2 className="text-sm font-bold tracking-tight text-base-content">
                Link Intersect Configuration
              </h2>
            </div>
            <span className="badge badge-ghost badge-sm text-base-content/60 font-medium">
              Costs Backlinks credits
            </span>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="block space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-base-content/60 flex items-center gap-1.5">
                <Globe className="size-3.5 text-primary/70" />
                Your Domain
              </span>
              <input
                type="text"
                className="input input-bordered w-full rounded-xl focus:border-primary focus:outline-hidden"
                placeholder="example.com"
                value={target}
                onChange={(e) => setTargetInput(e.target.value)}
              />
            </label>

            <label className="block space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-base-content/60 flex items-center gap-1.5">
                  <Layers className="size-3.5 text-primary/70" />
                  Competitors (up to {MAX_COMPETITORS})
                </span>
                <span className="text-xs text-base-content/40">1 per line</span>
              </div>
              <textarea
                className="textarea textarea-bordered w-full rounded-xl font-mono text-sm leading-relaxed focus:border-primary focus:outline-hidden h-24"
                placeholder={
                  "competitor1.com\ncompetitor2.com\ncompetitor3.com"
                }
                value={competitorsText}
                onChange={(e) => setCompetitorsText(e.target.value)}
              />
            </label>
          </div>

          {formError && (
            <div className="rounded-xl border border-error/30 bg-error/10 p-3 text-sm text-error flex items-center gap-2">
              <AlertCircle className="size-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-medium text-base-content/50 mr-1">
                Quick Sets:
              </span>
              {SAMPLE_PRESETS.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => applyPreset(p)}
                  className="badge badge-outline badge-sm hover:badge-primary cursor-pointer transition-colors"
                >
                  {p.target}
                </button>
              ))}
            </div>

            <button
              type="button"
              className="btn btn-primary rounded-xl gap-2 font-semibold shadow-xs"
              onClick={() => handleRun()}
              disabled={mutation.isPending}
            >
              {mutation.isPending ? (
                <>
                  <span className="loading loading-spinner loading-xs" />
                  Analyzing Links…
                </>
              ) : (
                <>
                  <Waypoints className="size-4" />
                  Find Link Opportunities
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Results or Empty State */}
      {result ? (
        <Results result={result} />
      ) : (
        <div className="rounded-2xl border border-dashed border-base-300 bg-base-100 p-8 text-center text-base-content/60 space-y-5">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary mx-auto">
            <Waypoints className="size-7" />
          </div>
          <div className="space-y-1.5 max-w-md mx-auto">
            <p className="text-lg font-bold text-base-content">
              Find backlink opportunities your competitors share
            </p>
            <p className="text-sm text-base-content/70 leading-relaxed">
              Identify domains that link to multiple competitors in your space
              but not to you yet. These represent your highest-converting
              outreach prospects.
            </p>
          </div>

          <div className="pt-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-base-content/50 mb-3">
              One-click sample comparisons
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2.5 max-w-2xl mx-auto">
              {SAMPLE_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => applyPreset(preset)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-base-300 bg-base-200/60 px-3.5 py-1.5 text-xs font-medium text-base-content/80 transition-all duration-150 hover:border-primary/40 hover:bg-primary/10 hover:text-primary active:scale-95 cursor-pointer"
                >
                  <Sparkles className="size-3 text-primary/70" />
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Results({ result }: { result: IntersectResult }) {
  const domains = result.domains;
  return (
    <div className="space-y-6">
      <IntersectSummaryCards
        summary={result.summary}
        competitorCount={result.competitors.length}
      />

      <div className="card bg-base-100 border border-base-300 rounded-2xl shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-base-300 bg-base-200/20 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold tracking-tight text-base-content">
              Link Opportunities
            </h3>
            <p className="text-xs text-base-content/50">
              Domains linking to your competitors that could link to you
            </p>
          </div>
          <span className="badge badge-neutral badge-soft badge-sm font-semibold">
            {domains.length} referring domains
          </span>
        </div>
        {domains.length === 0 ? (
          <div className="p-8 text-center text-sm text-base-content/60">
            No link opportunities found. These competitors may share the same
            backlink profile as your domain.
          </div>
        ) : (
          <IntersectTable domains={domains} />
        )}
      </div>
    </div>
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
