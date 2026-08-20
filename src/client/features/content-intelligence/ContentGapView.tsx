import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createColumnHelper } from "@tanstack/react-table";
import type { SortingState } from "@tanstack/react-table";
import {
  AlertCircle,
  Globe,
  Layers,
  Search,
  Sparkles,
  Split,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";
import { getStandardErrorMessage } from "@/client/lib/error-messages";
import {
  AppDataTable,
  useAppTable,
} from "@/client/components/table/AppDataTable";
import { SortableHeader } from "@/client/components/table/SortableHeader";
import { getContentGap } from "@/serverFunctions/content-intelligence";
import { getProjects } from "@/serverFunctions/projects";
import {
  DifficultyPill,
  GapSummaryCards,
  TopicList,
} from "@/client/features/content-intelligence/ContentGapParts";
import type { GapKeyword } from "@/server/features/content-intelligence/contentGap";

type GapResult = Awaited<ReturnType<typeof getContentGap>>;

const MAX_COMPETITORS = 3;

const SAMPLE_PRESETS = [
  {
    label: "SaaS Billing (Stripe vs Competitors)",
    domain: "stripe.com",
    competitors: "paddle.com\nadyen.com",
  },
  {
    label: "Cloud & Dev (Vercel vs Competitors)",
    domain: "vercel.com",
    competitors: "netlify.com\nrender.com",
  },
  {
    label: "Issue Tracking (Linear vs Competitors)",
    domain: "linear.app",
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

const gapColumnHelper = createColumnHelper<GapKeyword>();

const gapColumns = [
  gapColumnHelper.accessor("keyword", {
    header: "Keyword",
    cell: ({ getValue }) => (
      <span
        className="block max-w-[280px] font-medium truncate text-base-content"
        title={getValue()}
      >
        {getValue()}
      </span>
    ),
  }),
  gapColumnHelper.accessor((row) => row.searchVolume ?? 0, {
    id: "searchVolume",
    header: ({ column }) => <SortableHeader column={column} label="Volume" />,
    cell: ({ row }) => (
      <span className="tabular-nums font-semibold text-base-content/80">
        {row.original.searchVolume != null
          ? row.original.searchVolume.toLocaleString()
          : "—"}
      </span>
    ),
    sortDescFirst: true,
  }),
  gapColumnHelper.accessor((row) => row.keywordDifficulty ?? 0, {
    id: "keywordDifficulty",
    header: ({ column }) => (
      <SortableHeader column={column} label="Difficulty" />
    ),
    cell: ({ row }) => (
      <DifficultyPill value={row.original.keywordDifficulty} />
    ),
    sortDescFirst: false,
  }),
  gapColumnHelper.accessor((row) => row.competitors.length, {
    id: "competitors",
    header: "Competitors",
    cell: ({ getValue }) =>
      getValue() > 0 ? (
        <span className="badge badge-neutral badge-soft badge-sm font-semibold">
          {getValue()} {getValue() === 1 ? "domain" : "domains"}
        </span>
      ) : (
        <span className="text-base-content/30">—</span>
      ),
  }),
  gapColumnHelper.accessor((row) => row.cpc ?? 0, {
    id: "cpc",
    header: ({ column }) => <SortableHeader column={column} label="CPC" />,
    cell: ({ row }) => (
      <span className="tabular-nums text-base-content/70">
        {row.original.cpc != null ? `$${row.original.cpc.toFixed(2)}` : "—"}
      </span>
    ),
    sortDescFirst: true,
  }),
];

export function ContentGapView({ projectId }: { projectId: string }) {
  const projectsQuery = useQuery({
    queryKey: ["projects"],
    queryFn: () => getProjects(),
  });
  const project = projectsQuery.data?.find((p) => p.id === projectId);

  const [domainInput, setDomainInput] = useState("");
  const [competitorsText, setCompetitorsText] = useState("");
  // Seeded once the project's own domain resolves.
  const domain = domainInput || project?.domain || "";

  const [formError, setFormError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: (vars: { domain: string; competitors: string[] }) =>
      getContentGap({
        data: { projectId, domain: vars.domain, competitors: vars.competitors },
      }),
    onError: (error) => {
      toast.error(
        getStandardErrorMessage(error, "Failed to compute content gap"),
      );
    },
  });

  const result = mutation.data;

  function handleRun(customDomain?: string, customCompetitors?: string) {
    const targetDomain = (customDomain ?? domain).trim();
    const competitorsSource = customCompetitors ?? competitorsText;
    const competitors = parseCompetitors(competitorsSource).slice(
      0,
      MAX_COMPETITORS,
    );

    if (!targetDomain) {
      setFormError("Enter your site's domain.");
      return;
    }
    if (competitors.length === 0) {
      setFormError("Add at least one competitor domain.");
      return;
    }
    setFormError(null);
    mutation.mutate({ domain: targetDomain, competitors });
  }

  function applyPreset(preset: (typeof SAMPLE_PRESETS)[number]) {
    setDomainInput(preset.domain);
    setCompetitorsText(preset.competitors);
    handleRun(preset.domain, preset.competitors);
  }

  return (
    <div className="space-y-6">
      {/* Controls Form Card */}
      <div className="card bg-base-100 border border-base-300 rounded-2xl shadow-xs">
        <div className="card-body gap-4 p-5 md:p-6">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-base-200 pb-3">
            <div className="flex items-center gap-2">
              <Split className="size-4 text-primary" />
              <h2 className="text-sm font-bold tracking-tight text-base-content">
                Domain & Competitors Configuration
              </h2>
            </div>
            <span className="badge badge-ghost badge-sm text-base-content/60 font-medium">
              Costs DataForSEO credits
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
                value={domain}
                onChange={(e) => setDomainInput(e.target.value)}
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
                  {p.domain}
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
                  Analyzing Gaps…
                </>
              ) : (
                <>
                  <Search className="size-4" />
                  Find Content Gaps
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
            <Split className="size-7" />
          </div>
          <div className="space-y-1.5 max-w-md mx-auto">
            <p className="text-lg font-bold text-base-content">
              Find keywords your competitors rank for that you don&apos;t
            </p>
            <p className="text-sm text-base-content/70 leading-relaxed">
              Uncover high-intent organic keywords where competitors are
              capturing traffic. Enter your domain and up to 3 competitors
              above, or try one of the instant presets below.
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

function Results({ result }: { result: GapResult }) {
  const keywords = result.keywords;
  return (
    <div className="space-y-6">
      <GapSummaryCards
        summary={result.summary}
        competitorCount={result.competitors.length}
      />

      {result.topics.length > 0 && (
        <div className="card bg-base-100 border border-base-300 rounded-2xl shadow-xs overflow-hidden">
          <div className="px-5 py-4 border-b border-base-300 bg-base-200/20 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold tracking-tight text-base-content">
                Topic Clusters
              </h3>
              <p className="text-xs text-base-content/50">
                Gap keywords grouped by their core subject
              </p>
            </div>
            <span className="badge badge-ghost badge-sm font-semibold">
              {result.topics.length} clusters
            </span>
          </div>
          <div className="p-5">
            <TopicList topics={result.topics} />
          </div>
        </div>
      )}

      <div className="card bg-base-100 border border-base-300 rounded-2xl shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-base-300 bg-base-200/20 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold tracking-tight text-base-content">
              Gap Keywords
            </h3>
            <p className="text-xs text-base-content/50">
              Keywords where competitors hold search rank positions
            </p>
          </div>
          <span className="badge badge-neutral badge-soft badge-sm font-semibold">
            {keywords.length} keywords found
          </span>
        </div>
        {keywords.length === 0 ? (
          <div className="p-8 text-center text-sm text-base-content/60">
            No gap keywords found. Your domain already covers what these
            competitors rank for.
          </div>
        ) : (
          <GapKeywordsTable keywords={keywords} />
        )}
      </div>
    </div>
  );
}

function GapKeywordsTable({ keywords }: { keywords: GapKeyword[] }) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: "searchVolume", desc: true },
  ]);
  const table = useAppTable({
    data: keywords,
    columns: gapColumns,
    state: { sorting },
    onSortingChange: setSorting,
    withSorting: true,
  });

  return <AppDataTable table={table} />;
}
