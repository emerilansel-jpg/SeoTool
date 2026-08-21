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
    competitors: "paddle.com, adyen.com",
  },
  {
    label: "Cloud & Dev (Vercel vs Competitors)",
    domain: "vercel.com",
    competitors: "netlify.com, render.com",
  },
  {
    label: "Issue Tracking (Linear vs Competitors)",
    domain: "linear.app",
    competitors: "asana.com, monday.com",
  },
];

/** Parse the competitors input into a normalized, de-duplicated list. */
function parseCompetitors(text: string): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const raw of text.split(/[\n,;]+/)) {
    const value = raw
      .trim()
      .toLowerCase()
      .replace(/^https?:\/\//, "")
      .replace(/^www\./, "")
      .replace(/\/.*$/, "");
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
        data: {
          projectId,
          domain: vars.domain,
          competitors: vars.competitors,
        },
      }),
    onError: (error) => {
      toast.error(
        getStandardErrorMessage(error, "Failed to analyze content gaps"),
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
    <div className="space-y-4">
      {/* Controls Form Card */}
      <div className="card bg-base-100 border border-base-300">
        <div className="card-body gap-4">
          <form
            className="flex flex-col gap-3 lg:flex-row lg:items-center"
            onSubmit={(e) => {
              e.preventDefault();
              handleRun();
            }}
          >
            {/* Domain input */}
            <label className="input input-bordered flex items-center gap-2 w-full lg:w-80 lg:min-w-0">
              <Search className="size-4 text-base-content/60 shrink-0" />
              <input
                type="text"
                className="grow min-w-0"
                placeholder="Enter your domain"
                value={domain}
                onChange={(e) => setDomainInput(e.target.value)}
              />
            </label>

            {/* Competitors input */}
            <label className="input input-bordered flex items-center gap-2 w-full lg:flex-1 lg:min-w-0">
              <Layers className="size-4 text-base-content/60 shrink-0" />
              <input
                type="text"
                className="grow min-w-0"
                placeholder="Competitors, comma-separated (e.g. comp1.com, comp2.com)"
                value={competitorsText}
                onChange={(e) => setCompetitorsText(e.target.value)}
              />
            </label>

            {/* Search Button */}
            <button
              type="submit"
              className="btn btn-primary shrink-0 px-6 font-semibold"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? (
                <>
                  <span className="loading loading-spinner loading-xs" />
                  Analyzing…
                </>
              ) : (
                "Search"
              )}
            </button>
          </form>

          {formError && (
            <div className="rounded-lg border border-error/30 bg-error/10 p-3 text-sm text-error flex items-center gap-2">
              <AlertCircle className="size-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* Helper / Preset Sub-row */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-0.5">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-medium text-base-content/50">
                Quick sets:
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

            <span className="text-xs text-base-content/40">
              Costs DataForSEO credits
            </span>
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
