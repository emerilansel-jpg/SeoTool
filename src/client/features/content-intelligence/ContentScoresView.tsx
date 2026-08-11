import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, ChevronDown } from "lucide-react";
import { getContentScores } from "@/serverFunctions/content-intelligence";
import { extractPathname } from "@/client/features/audit/shared";
import { ExportDropdown } from "@/client/features/audit/results/ResultsTables";
import { exportContentScores } from "@/client/features/audit/results/export";
import {
  ScoreBadge,
  SubScoreBar,
  SummaryCards,
  TopFlags,
} from "@/client/features/content-intelligence/ContentScoresParts";
import type {
  AggregatedFlag,
  ScoreDistribution,
} from "@/client/features/content-intelligence/ContentScoresParts";
import type { ContentFlag } from "@/server/features/content-intelligence/contentScore";

type ScoreResponse = Awaited<ReturnType<typeof getContentScores>>;
type ScoreRow = ScoreResponse["scores"][number];

type SortKey = "score" | "wordCount" | "flags";
type SubScoreField =
  | "depthScore"
  | "headingsScore"
  | "metadataScore"
  | "mediaScore"
  | "linkingScore"
  | "technicalScore";

const SUB_SCORES: Array<{ key: SubScoreField; label: string }> = [
  { key: "depthScore", label: "Depth" },
  { key: "headingsScore", label: "Headings" },
  { key: "metadataScore", label: "Metadata" },
  { key: "mediaScore", label: "Media" },
  { key: "linkingScore", label: "Linking" },
  { key: "technicalScore", label: "Technical" },
];

// Stable empty array so `scores` keeps its reference across renders when the
// query has no data yet (keeps useMemo deps stable).
const EMPTY_SCORES: ScoreRow[] = [];

export function ContentScoresView({
  projectId,
  auditId,
}: {
  projectId: string;
  auditId: string;
}) {
  const query = useQuery({
    queryKey: ["content-scores", projectId, auditId],
    queryFn: () => getContentScores({ data: { projectId, auditId } }),
  });

  const [sortKey, setSortKey] = useState<SortKey>("score");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [expandedPageId, setExpandedPageId] = useState<string | null>(null);

  const scores = query.data?.scores ?? EMPTY_SCORES;

  const summary = useMemo(() => computeSummary(scores), [scores]);
  const topFlags = useMemo(() => aggregateFlags(scores), [scores]);

  const sorted = useMemo(() => {
    return scores.toSorted((a, b) => {
      const av = metricValue(a, sortKey);
      const bv = metricValue(b, sortKey);
      return sortDir === "asc" ? av - bv : bv - av;
    });
  }, [scores, sortKey, sortDir]);

  if (query.isLoading) {
    return (
      <p className="flex items-center gap-2 py-8 text-sm text-base-content/60">
        <span className="loading loading-spinner loading-sm" /> Scoring content…
      </p>
    );
  }

  if (query.isError) {
    return (
      <div className="alert alert-error text-sm">
        <AlertCircle className="size-4" />
        Could not load content scores.
      </div>
    );
  }

  if (scores.length === 0) {
    return (
      <div className="rounded-lg border border-base-300 bg-base-100 px-4 py-6 text-sm text-base-content/60">
        No scored pages for this audit. Content scores are generated for
        successfully crawled pages when an audit completes.
      </div>
    );
  }

  const toggleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDir((dir) => (dir === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(key === "score" ? "asc" : "desc");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end">
        <ExportDropdown
          onExport={(format) => exportContentScores(scores, format)}
        />
      </div>
      <SummaryCards
        averageScore={summary.average}
        total={scores.length}
        distribution={summary.distribution}
      />

      <div className="card bg-base-100 border border-base-300">
        <div className="card-body gap-3">
          <div>
            <h3 className="text-sm font-medium text-base-content/70">
              Recurring issues
            </h3>
            <p className="text-xs text-base-content/40">
              Most common content flags across scored pages.
            </p>
          </div>
          <TopFlags flags={topFlags} />
        </div>
      </div>

      <div className="card bg-base-100 border border-base-300">
        <div className="card-body gap-2 p-0">
          <div className="overflow-x-auto">
            <table className="table table-zebra">
              <thead>
                <tr>
                  <th>Page</th>
                  <SortHeader
                    label="Score"
                    active={sortKey === "score"}
                    dir={sortDir}
                    onClick={() => toggleSort("score")}
                  />
                  <SortHeader
                    label="Words"
                    active={sortKey === "wordCount"}
                    dir={sortDir}
                    onClick={() => toggleSort("wordCount")}
                  />
                  <SortHeader
                    label="Issues"
                    active={sortKey === "flags"}
                    dir={sortDir}
                    onClick={() => toggleSort("flags")}
                  />
                  <th />
                </tr>
              </thead>
              <tbody>
                {sorted.map((row) => {
                  const isOpen = expandedPageId === row.pageId;
                  return (
                    <FragmentRow
                      key={row.id}
                      row={row}
                      isOpen={isOpen}
                      onToggle={() =>
                        setExpandedPageId(isOpen ? null : row.pageId)
                      }
                    />
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function FragmentRow({
  row,
  isOpen,
  onToggle,
}: {
  row: ScoreRow;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const criticalCount = row.flags.filter(
    (f) => f.severity === "critical",
  ).length;
  return (
    <>
      <tr className="cursor-pointer hover" onClick={onToggle}>
        <td className="max-w-[280px]">
          <div className="truncate" title={row.url}>
            {extractPathname(row.url)}
          </div>
        </td>
        <td>
          <ScoreBadge score={row.score} />
        </td>
        <td className="tabular-nums text-base-content/70">{row.wordCount}</td>
        <td className="tabular-nums">
          {row.flags.length > 0 ? (
            <span
              className={
                criticalCount > 0
                  ? "text-error font-medium"
                  : "text-base-content/70"
              }
            >
              {row.flags.length}
            </span>
          ) : (
            <span className="text-base-content/30">—</span>
          )}
        </td>
        <td className="text-right">
          <ChevronDown
            className={`size-4 text-base-content/40 transition-transform ${isOpen ? "rotate-180" : ""}`}
          />
        </td>
      </tr>
      {isOpen && (
        <tr className="bg-base-200/40">
          <td colSpan={5}>
            <div className="grid gap-4 py-1 md:grid-cols-2">
              <div className="space-y-1.5">
                {SUB_SCORES.map(({ key, label }) => (
                  <SubScoreBar key={key} label={label} score={row[key]} />
                ))}
              </div>
              <div>
                <p className="mb-1.5 text-xs font-medium uppercase tracking-wider text-base-content/50">
                  Flags ({row.flags.length})
                </p>
                {row.flags.length === 0 ? (
                  <p className="text-sm text-base-content/50">
                    No issues — this page meets all content-quality checks.
                  </p>
                ) : (
                  <ul className="space-y-1.5">
                    {row.flags.map((flag, i) => (
                      <li
                        key={`${flag.code}-${i}`}
                        className="flex items-start gap-2 text-sm"
                      >
                        <FlagDot severity={flag.severity} />
                        <span className="text-base-content/80">
                          {flag.message}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

function FlagDot({ severity }: { severity: ContentFlag["severity"] }) {
  const color =
    severity === "critical"
      ? "bg-error"
      : severity === "warning"
        ? "bg-warning"
        : "bg-base-content/30";
  return <span className={`mt-1.5 size-1.5 shrink-0 rounded-full ${color}`} />;
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

function metricValue(row: ScoreRow, key: SortKey): number {
  if (key === "flags") return row.flags.length;
  return row[key];
}

function computeSummary(scores: ScoreRow[]): {
  average: number | null;
  distribution: ScoreDistribution;
} {
  if (scores.length === 0) {
    return {
      average: null,
      distribution: { excellent: 0, good: 0, fair: 0, poor: 0 },
    };
  }
  const distribution = { excellent: 0, good: 0, fair: 0, poor: 0 };
  let total = 0;
  for (const row of scores) {
    total += row.score;
    if (row.score >= 90) distribution.excellent += 1;
    else if (row.score >= 70) distribution.good += 1;
    else if (row.score >= 50) distribution.fair += 1;
    else distribution.poor += 1;
  }
  return { average: Math.round(total / scores.length), distribution };
}

function aggregateFlags(scores: ScoreRow[]): AggregatedFlag[] {
  const byCode = new Map<string, AggregatedFlag>();
  for (const row of scores) {
    for (const flag of row.flags) {
      const existing = byCode.get(flag.code);
      if (existing) {
        existing.count += 1;
      } else {
        byCode.set(flag.code, { ...flag, count: 1 });
      }
    }
  }
  const severityRank: Record<ContentFlag["severity"], number> = {
    critical: 0,
    warning: 1,
    info: 2,
  };
  return Array.from(byCode.values())
    .toSorted((a, b) => {
      if (b.count !== a.count) return b.count - a.count;
      return severityRank[a.severity] - severityRank[b.severity];
    })
    .slice(0, 6);
}
