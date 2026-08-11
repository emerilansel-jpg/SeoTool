import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { AlertCircle, Search } from "lucide-react";
import { getContentGap } from "@/serverFunctions/content-intelligence";
import { getProjects } from "@/serverFunctions/projects";
import {
  DifficultyPill,
  GapSummaryCards,
  TopicList,
} from "@/client/features/content-intelligence/ContentGapParts";
import type { GapKeyword } from "@/server/features/content-intelligence/contentGap";

type GapResult = Awaited<ReturnType<typeof getContentGap>>;

type SortKey = "searchVolume" | "keywordDifficulty" | "competitors";

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
  const [sortKey, setSortKey] = useState<SortKey>("searchVolume");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const mutation = useMutation({
    mutationFn: (vars: { domain: string; competitors: string[] }) =>
      getContentGap({
        data: { projectId, domain: vars.domain, competitors: vars.competitors },
      }),
  });

  const result = mutation.data;

  const sortedKeywords = useMemo(() => {
    const keywords = result?.keywords ?? [];
    return keywords.toSorted((a, b) => {
      const av = sortValue(a, sortKey);
      const bv = sortValue(b, sortKey);
      return sortDir === "asc" ? av - bv : bv - av;
    });
  }, [result, sortKey, sortDir]);

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
            <label className="form-control">
              <span className="label-text mb-1 text-xs font-medium uppercase tracking-wider text-base-content/50">
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
            <label className="form-control">
              <span className="label-text mb-1 text-xs font-medium uppercase tracking-wider text-base-content/50">
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
          {mutation.isError && (
            <p className="flex items-center gap-2 text-sm text-error">
              <AlertCircle className="size-4" /> Could not compute the gap.
              Check your credits and competitor domains, then try again.
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

      {result && (
        <Results
          result={result}
          keywords={sortedKeywords}
          sortKey={sortKey}
          sortDir={sortDir}
          onSort={toggleSort(setSortKey, setSortDir, sortKey, sortDir)}
        />
      )}
    </div>
  );
}

function Results({
  result,
  keywords,
  sortKey,
  sortDir,
  onSort,
}: {
  result: GapResult;
  keywords: GapKeyword[];
  sortKey: SortKey;
  sortDir: "asc" | "desc";
  onSort: (key: SortKey) => void;
}) {
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
              No gap keywords found — your domain already covers what these
              competitors rank for.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="table table-zebra">
                <thead>
                  <tr>
                    <th>Keyword</th>
                    <SortHeader
                      label="Volume"
                      active={sortKey === "searchVolume"}
                      dir={sortDir}
                      onClick={() => onSort("searchVolume")}
                    />
                    <SortHeader
                      label="Difficulty"
                      active={sortKey === "keywordDifficulty"}
                      dir={sortDir}
                      onClick={() => onSort("keywordDifficulty")}
                    />
                    <th>Competitors</th>
                    <SortHeader
                      label="CPC"
                      active={sortKey === "competitors"}
                      dir={sortDir}
                      onClick={() => onSort("competitors")}
                    />
                  </tr>
                </thead>
                <tbody>
                  {keywords.map((kw) => (
                    <tr key={kw.keyword}>
                      <td className="max-w-[280px] truncate" title={kw.keyword}>
                        {kw.keyword}
                      </td>
                      <td className="tabular-nums text-base-content/70">
                        {kw.searchVolume != null
                          ? kw.searchVolume.toLocaleString()
                          : "—"}
                      </td>
                      <td>
                        <DifficultyPill value={kw.keywordDifficulty} />
                      </td>
                      <td>
                        {kw.competitors.length > 0 ? (
                          <span className="badge badge-ghost badge-sm">
                            {kw.competitors.length}
                          </span>
                        ) : (
                          <span className="text-base-content/30">—</span>
                        )}
                      </td>
                      <td className="tabular-nums text-base-content/70">
                        {kw.cpc != null ? `$${kw.cpc.toFixed(2)}` : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function SortHeader({
  label,
  active,
  dir,
  onClick,
}: {
  label: string;
  active: boolean;
  dir: "asc" | "desc";
  onClick: () => void;
}) {
  return (
    <th>
      <button
        type="button"
        className={`flex items-center gap-1 hover:text-base-content ${active ? "text-base-content" : "text-base-content/60"}`}
        onClick={onClick}
      >
        {label}
        {active && (
          <span className="text-[10px]">{dir === "asc" ? "▲" : "▼"}</span>
        )}
      </button>
    </th>
  );
}

function sortValue(row: GapKeyword, key: SortKey): number {
  if (key === "searchVolume") return row.searchVolume ?? 0;
  if (key === "keywordDifficulty") return row.keywordDifficulty ?? 0;
  return row.competitors.length;
}

function toggleSort(
  setSortKey: (key: SortKey) => void,
  setSortDir: (dir: "asc" | "desc") => void,
  sortKey: SortKey,
  sortDir: "asc" | "desc",
) {
  return (key: SortKey) => {
    if (key === sortKey) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      // Difficulty default asc (easy first), others desc.
      setSortDir(key === "keywordDifficulty" ? "asc" : "desc");
    }
  };
}
