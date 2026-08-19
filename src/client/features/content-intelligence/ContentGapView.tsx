import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createColumnHelper } from "@tanstack/react-table";
import type { SortingState } from "@tanstack/react-table";
import { AlertCircle, Search } from "lucide-react";
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
      <span className="block max-w-[280px] truncate" title={getValue()}>
        {getValue()}
      </span>
    ),
  }),
  gapColumnHelper.accessor((row) => row.searchVolume ?? 0, {
    id: "searchVolume",
    header: ({ column }) => <SortableHeader column={column} label="Volume" />,
    cell: ({ row }) => (
      <span className="tabular-nums text-base-content/70">
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
        <span className="badge badge-ghost badge-sm">{getValue()}</span>
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

  function handleRun() {
    const competitors = parseCompetitors(competitorsText).slice(
      0,
      MAX_COMPETITORS,
    );
    const cleanDomain = domain.trim();
    if (!cleanDomain) {
      setFormError("Enter your site's domain.");
      return;
    }
    if (competitors.length === 0) {
      setFormError("Add at least one competitor domain.");
      return;
    }
    setFormError(null);
    mutation.mutate({ domain: cleanDomain, competitors });
  }

  return (
    <div className="space-y-5">
      <div className="card bg-base-100 border border-base-300">
        <div className="card-body gap-3">
          <p className="text-xs text-base-content/50">
            Each competitor domain costs credits to analyze.
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
                value={domain}
                onChange={(e) => setDomainInput(e.target.value)}
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
                  <Search className="size-4" /> Find content gaps
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

function Results({ result }: { result: GapResult }) {
  const keywords = result.keywords;
  return (
    <>
      <GapSummaryCards
        summary={result.summary}
        competitorCount={result.competitors.length}
      />

      {result.topics.length > 0 && (
        <div className="card bg-base-100 border border-base-300">
          <div className="card-body gap-3">
            <div>
              <h3 className="text-sm font-medium text-base-content/70">
                Topic clusters
              </h3>
              <p className="text-xs text-base-content/40">
                Gap keywords grouped by their core subject.
              </p>
            </div>
            <TopicList topics={result.topics} />
          </div>
        </div>
      )}

      <div className="card bg-base-100 border border-base-300">
        <div className="card-body gap-2 p-0">
          <div className="flex items-center justify-between px-4 pt-4">
            <h3 className="text-sm font-medium text-base-content/70">
              Gap keywords
            </h3>
            <span className="text-xs text-base-content/40">
              {keywords.length} shown
            </span>
          </div>
          {keywords.length === 0 ? (
            <p className="px-4 pb-4 text-sm text-base-content/50">
              No gap keywords found. Your domain already covers what these
              competitors rank for.
            </p>
          ) : (
            <GapKeywordsTable keywords={keywords} />
          )}
        </div>
      </div>
    </>
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
