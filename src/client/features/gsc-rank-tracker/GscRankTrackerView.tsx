// oxlint-disable max-lines, max-lines-per-function -- single-file view, same pattern as GmbGridView
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { History, Lightbulb, RefreshCw, Search } from "lucide-react";
import { getStandardErrorMessage } from "@/client/lib/error-messages";
import {
  backfillGscRankTracker,
  explainGscKeywordMove,
  getGscKeywordHistory,
  getGscRankTrackerKeywords,
  getGscRankTrackerStatus,
  setGscKeywordStatus,
  syncGscRankTracker,
} from "@/serverFunctions/gsc-rank-tracker";

type GscKeywordRow = {
  id: string;
  keyword: string;
  lastPosition: number | null;
  lastImpressions: number;
  lastClicks: number;
  lastUrl: string | null;
  lastDay: string | null;
  status: "active" | "ignored";
};

type GscHistoryPoint = {
  day: string;
  position: number | null;
  impressions: number;
  clicks: number;
  url: string | null;
};

type GscMoveExplanation = {
  keyword: string;
  positionChange: number;
  periodStart: string;
  periodEnd: string;
  beforeUrl: string | null;
  afterUrl: string | null;
  urlChanged: boolean;
  cannibalization: boolean;
  explanation: string;
};

const PAGE_SIZE = 50;
const HISTORY_DAYS = 90;
const BACKFILL_CHUNK_DAYS = 30;
const MAX_BACKFILL_DAYS = 480;

const GRANT_ERROR_LABEL: Record<string, string> = {
  not_connected: "Not connected",
  token_expired: "GSC token expired",
  api_error: "GSC API error",
};

const fmt = (n: number) => new Intl.NumberFormat().format(n);
const dayStr = (d: Date) => d.toISOString().slice(0, 10);
const addDays = (d: Date, n: number) => new Date(d.getTime() + n * 86_400_000);
const shortUrl = (url: string) => url.replace(/^https?:\/\//, "").replace(/\/$/, "");

export function GscRankTrackerView({ projectId }: { projectId: string }) {
  const queryClient = useQueryClient();
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<"position" | "impressions" | "keyword">("position");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [activeKeyword, setActiveKeyword] = useState<string | null>(null);
  const [explanation, setExplanation] = useState<GscMoveExplanation | null>(null);
  const [backfillFrom, setBackfillFrom] = useState(dayStr(addDays(new Date(), -32)));
  const [backfillTo, setBackfillTo] = useState(dayStr(addDays(new Date(), -2)));
  const [backfillLabel, setBackfillLabel] = useState<string | null>(null);

  // Debounced keyword filter (300ms), or apply immediately on Enter.
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const statusQuery = useQuery({
    queryKey: ["gsc-rank-tracker", "status", projectId],
    queryFn: () => getGscRankTrackerStatus({ data: { projectId } }),
  });
  const grantOk = statusQuery.data?.grant.ok === true;

  const keywordsQuery = useQuery({
    queryKey: ["gsc-rank-tracker", "keywords", projectId, search, page, sortBy, sortDir],
    queryFn: () =>
      getGscRankTrackerKeywords({
        data: { projectId, search: search || undefined, page, pageSize: PAGE_SIZE, sortBy, sortDir },
      }),
    enabled: grantOk,
  });

  const invalidateAll = () => void queryClient.invalidateQueries({ queryKey: ["gsc-rank-tracker"] });

  const syncMutation = useMutation({
    mutationFn: () => syncGscRankTracker({ data: { projectId } }),
    onSuccess: (res) => {
      toast.success(
        `Synced ${res.keywordsTouched} keywords, ${res.historyRows} history rows (${res.from} to ${res.to})`,
      );
      invalidateAll();
    },
    onError: (error) => toast.error(getStandardErrorMessage(error, "Sync failed")),
  });

  const statusMutation = useMutation({
    mutationFn: (input: { keyword: string; status: "active" | "ignored" }) =>
      setGscKeywordStatus({ data: { projectId, ...input } }),
    onSuccess: () => invalidateAll(),
    onError: (error) => toast.error(getStandardErrorMessage(error, "Failed to update keyword")),
  });

  const explainMutation = useMutation({
    mutationFn: (input: { keyword: string }) => explainGscKeywordMove({ data: { projectId, keyword: input.keyword } }),
    onSuccess: (res) => {
      setExplanation(res);
      setActiveKeyword(res.keyword);
    },
    onError: (error) => toast.error(getStandardErrorMessage(error, "Could not explain the position move")),
  });

  const toggleSort = (col: "position" | "impressions") => {
    if (sortBy === col) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(col);
      setSortDir("asc");
    }
    setPage(1);
  };

  const openHistory = (keyword: string) => {
    setExplanation(null);
    setActiveKeyword(keyword);
  };

  // Client-driven chunked backfill: sequential 30-day mutateAsync calls with progress updates.
  const handleBackfill = async () => {
    if (backfillLabel !== null) return;
    if (!backfillFrom || !backfillTo) {
      toast.error("Pick both a from and to date for the backfill.");
      return;
    }
    const from = new Date(`${backfillFrom}T00:00:00.000Z`);
    let end = new Date(`${backfillTo}T00:00:00.000Z`);
    if (Number.isNaN(from.getTime()) || Number.isNaN(end.getTime()) || from > end) {
      toast.error("From date must be on or before the to date.");
      return;
    }
    const spanDays = Math.round((end.getTime() - from.getTime()) / 86_400_000) + 1;
    if (spanDays > MAX_BACKFILL_DAYS) {
      end = addDays(from, MAX_BACKFILL_DAYS - 1);
      toast.info(`Backfill window clamped to ${MAX_BACKFILL_DAYS} days (ends ${dayStr(end)}).`);
    }
    const chunks: Array<{ fromDate: string; toDate: string }> = [];
    let cursor = from;
    while (cursor <= end) {
      const chunkEnd = addDays(cursor, BACKFILL_CHUNK_DAYS - 1) > end ? end : addDays(cursor, BACKFILL_CHUNK_DAYS - 1);
      chunks.push({ fromDate: dayStr(cursor), toDate: dayStr(chunkEnd) });
      cursor = addDays(chunkEnd, 1);
    }
    let totalRows = 0;
    let keywordsTouched = 0;
    setBackfillLabel("");
    try {
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        setBackfillLabel(`Backfilling ${chunk.fromDate} .. ${chunk.toDate} (${i + 1}/${chunks.length})`);
        const res = await backfillGscRankTracker({ data: { projectId, ...chunk } });
        totalRows += res.historyRows;
        keywordsTouched += res.keywordsTouched;
      }
      toast.success(`Backfill complete: ${totalRows} history rows across ${keywordsTouched} keywords.`);
      invalidateAll();
    } catch (error) {
      toast.error(getStandardErrorMessage(error, "Backfill failed"));
    } finally {
      setBackfillLabel(null);
    }
  };

  if (statusQuery.isPending) {
    return (
      <div className="flex justify-center py-12">
        <span className="loading loading-spinner loading-md" />
      </div>
    );
  }
  if (statusQuery.isError) {
    return (
      <div className="alert alert-error">
        {getStandardErrorMessage(statusQuery.error, "Failed to load GSC rank tracker status")}
      </div>
    );
  }

  const { summary, grant } = statusQuery.data;
  const rows = keywordsQuery.data?.rows ?? [];
  const total = keywordsQuery.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const backfillRunning = backfillLabel !== null;
  const posArrow = sortBy === "position" ? (sortDir === "asc" ? " up" : " down") : "";
  const impArrow = sortBy === "impressions" ? (sortDir === "asc" ? " up" : " down") : "";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {grant.ok ? (
            <span className="badge badge-success">GSC connected</span>
          ) : (
            <span className="badge badge-error">
              {GRANT_ERROR_LABEL[grant.error ?? "not_connected"]} - connect Search Console in GSC Insights
            </span>
          )}
        </div>
        <button
          type="button"
          className="btn btn-primary btn-sm"
          disabled={!grant.ok || syncMutation.isPending || backfillRunning}
          onClick={() => syncMutation.mutate()}
        >
          {syncMutation.isPending ? (
            <span className="loading loading-spinner loading-xs" />
          ) : (
            <RefreshCw className="size-4" />
          )}
          Sync now
        </button>
      </div>

      {!grant.ok ? (
        <NotConnectedCard projectId={projectId} />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-base-300 bg-base-300/70 md:grid-cols-4">
            <StatCell label="Tracked keywords" value={fmt(summary.trackedCount)} />
            <StatCell
              label="Avg position"
              value={summary.avgPosition === null ? "-" : summary.avgPosition.toFixed(1)}
            />
            <StatCell label="Improved (7d)" value={fmt(summary.improved)} valueClassName="text-success" />
            <StatCell label="Declined (7d)" value={fmt(summary.declined)} valueClassName="text-error" />
          </div>

          <div className="card border border-base-300 bg-base-100">
            <div className="card-body gap-3 p-4">
              <div className="flex flex-wrap items-end gap-3">
                <div>
                  <p className="mb-1 text-xs text-base-content/60">From</p>
                  <input
                    type="date"
                    className="input input-sm"
                    value={backfillFrom}
                    onChange={(e) => setBackfillFrom(e.target.value)}
                  />
                </div>
                <div>
                  <p className="mb-1 text-xs text-base-content/60">To</p>
                  <input
                    type="date"
                    className="input input-sm"
                    value={backfillTo}
                    onChange={(e) => setBackfillTo(e.target.value)}
                  />
                </div>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  disabled={backfillRunning || syncMutation.isPending}
                  onClick={() => void handleBackfill()}
                >
                  {backfillRunning ? (
                    <span className="loading loading-spinner loading-xs" />
                  ) : (
                    <History className="size-4" />
                  )}
                  Backfill history
                </button>
                <p className="text-xs text-base-content/50">
                  Pulls daily position history in 30-day chunks (max 480 days).
                </p>
              </div>
              {backfillRunning ? (
                <div className="flex items-center gap-2 text-xs text-base-content/60">
                  <span className="loading loading-spinner loading-xs" />
                  <span>{backfillLabel}</span>
                </div>
              ) : null}
            </div>
          </div>

          <div className="card border border-base-300 bg-base-100">
            <div className="card-body p-0">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-base-300 px-4 py-3">
                <h3 className="font-medium">Keywords</h3>
                <label className="input input-sm flex items-center gap-2">
                  <Search className="size-4 opacity-50" />
                  <input
                    type="text"
                    className="grow"
                    placeholder="Filter keywords"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        setSearch(searchInput.trim());
                        setPage(1);
                      }
                    }}
                  />
                </label>
              </div>

              {keywordsQuery.isPending ? (
                <div className="flex justify-center py-10">
                  <span className="loading loading-spinner loading-md" />
                </div>
              ) : total === 0 && rows.length === 0 ? (
                <div className="px-4 py-10 text-center">
                  <p className="font-medium">No keywords tracked yet</p>
                  <p className="mt-1 text-sm text-base-content/60">
                    Run Sync now to pull keywords with impressions from Search Console.
                  </p>
                </div>
              ) : rows.length === 0 ? (
                <div className="px-4 py-10 text-center text-sm text-base-content/60">
                  No keywords match the current filter.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th>Keyword</th>
                        <th>
                          <button
                            type="button"
                            className="btn btn-ghost btn-xs px-1"
                            onClick={() => toggleSort("position")}
                          >
                            Position{posArrow}
                          </button>
                        </th>
                        <th>
                          <button
                            type="button"
                            className="btn btn-ghost btn-xs px-1"
                            onClick={() => toggleSort("impressions")}
                          >
                            Impressions{impArrow}
                          </button>
                        </th>
                        <th>Clicks</th>
                        <th>Top URL</th>
                        <th>Status</th>
                        <th />
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((row) => (
                        <KeywordRow
                          key={row.id}
                          row={row}
                          explainPending={
                            explainMutation.isPending && explainMutation.variables?.keyword === row.keyword
                          }
                          statusPending={statusMutation.isPending && statusMutation.variables?.keyword === row.keyword}
                          onHistory={() => openHistory(row.keyword)}
                          onExplain={() => explainMutation.mutate({ keyword: row.keyword })}
                          onToggleStatus={() =>
                            statusMutation.mutate({
                              keyword: row.keyword,
                              status: row.status === "active" ? "ignored" : "active",
                            })
                          }
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="flex items-center justify-between gap-3 border-t border-base-300 px-4 py-3">
                <span className="text-sm text-base-content/60">
                  Page {page} of {totalPages} ({fmt(total)} keywords)
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="btn btn-xs"
                    disabled={page <= 1 || keywordsQuery.isPending}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    Prev
                  </button>
                  <button
                    type="button"
                    className="btn btn-xs"
                    disabled={page >= totalPages || keywordsQuery.isPending}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {activeKeyword ? (
        <HistoryModal
          projectId={projectId}
          keyword={activeKeyword}
          explanation={explanation}
          onClose={() => {
            setActiveKeyword(null);
            setExplanation(null);
          }}
        />
      ) : null}
    </div>
  );
}

function NotConnectedCard({ projectId }: { projectId: string }) {
  return (
    <div className="card border border-base-300 bg-base-100">
      <div className="card-body items-center py-12 text-center">
        <p className="font-medium">Search Console is not connected yet</p>
        <p className="max-w-md text-sm text-base-content/60">
          The GSC Rank Tracker reads positions straight from Google Search Console. Connect Search Console under "GSC
          Insights" first, then come back here.
        </p>
        <Link to="/p/$projectId/search-performance" params={{ projectId }} className="btn btn-primary btn-sm">
          Open GSC Insights
        </Link>
      </div>
    </div>
  );
}

function StatCell({ label, value, valueClassName }: { label: string; value: string; valueClassName?: string }) {
  return (
    <div className="bg-base-100 p-4">
      <p className="text-xs text-base-content/60">{label}</p>
      <p className={`text-lg font-semibold ${valueClassName ?? ""}`}>{value}</p>
    </div>
  );
}

function PositionCell({ position }: { position: number | null }) {
  if (position === null) {
    return <span className="text-base-content/40">-</span>;
  }
  const tone = position <= 3 ? "text-success font-semibold" : position <= 10 ? "text-info font-medium" : "";
  return <span className={tone}>{position.toFixed(1)}</span>;
}

function KeywordRow({
  row,
  explainPending,
  statusPending,
  onHistory,
  onExplain,
  onToggleStatus,
}: {
  row: GscKeywordRow;
  explainPending: boolean;
  statusPending: boolean;
  onHistory: () => void;
  onExplain: () => void;
  onToggleStatus: () => void;
}) {
  return (
    <tr className="hover">
      <td className="max-w-xs truncate font-medium" title={row.keyword}>
        {row.keyword}
      </td>
      <td>
        <PositionCell position={row.lastPosition} />
      </td>
      <td>{fmt(row.lastImpressions)}</td>
      <td>{fmt(row.lastClicks)}</td>
      <td className="max-w-[14rem]">
        {row.lastUrl ? (
          <a
            href={row.lastUrl}
            target="_blank"
            rel="noreferrer"
            className="link link-hover block truncate text-xs"
            title={row.lastUrl}
          >
            {shortUrl(row.lastUrl)}
          </a>
        ) : (
          <span className="text-xs text-base-content/40">-</span>
        )}
      </td>
      <td>
        <span className={`badge badge-sm ${row.status === "active" ? "badge-success badge-outline" : "badge-ghost"}`}>
          {row.status === "active" ? "Active" : "Ignored"}
        </span>
      </td>
      <td>
        <div className="flex flex-wrap items-center gap-1">
          <button type="button" className="btn btn-ghost btn-xs" onClick={onHistory}>
            <History className="size-3.5" />
            History
          </button>
          <button type="button" className="btn btn-ghost btn-xs" disabled={explainPending} onClick={onExplain}>
            {explainPending ? (
              <span className="loading loading-spinner loading-xs" />
            ) : (
              <Lightbulb className="size-3.5" />
            )}
            Why did it move?
          </button>
          <button type="button" className="btn btn-ghost btn-xs" disabled={statusPending} onClick={onToggleStatus}>
            {row.status === "active" ? "Ignore" : "Activate"}
          </button>
        </div>
      </td>
    </tr>
  );
}

function HistoryModal({
  projectId,
  keyword,
  explanation,
  onClose,
}: {
  projectId: string;
  keyword: string;
  explanation: GscMoveExplanation | null;
  onClose: () => void;
}) {
  const historyQuery = useQuery({
    queryKey: ["gsc-rank-tracker", "history", projectId, keyword],
    queryFn: () => getGscKeywordHistory({ data: { projectId, keyword, days: HISTORY_DAYS } }),
  });
  const history = historyQuery.data?.history ?? [];

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-2xl">
        <button
          type="button"
          className="btn btn-circle btn-ghost btn-sm absolute right-2 top-2"
          onClick={onClose}
          aria-label="Close"
        >
          x
        </button>
        <h3 className="pr-8 font-semibold">{keyword}</h3>
        <p className="text-xs text-base-content/50">Last {HISTORY_DAYS} days from Search Console</p>

        {explanation ? <ExplainPanel explanation={explanation} /> : null}

        <div className="mt-4">
          {historyQuery.isPending ? (
            <div className="flex justify-center py-6">
              <span className="loading loading-spinner loading-sm" />
            </div>
          ) : historyQuery.data === null ? (
            <p className="py-6 text-center text-sm text-base-content/60">
              This keyword is not tracked yet. Run a sync first.
            </p>
          ) : (
            <>
              <Sparkline history={history} />
              <div className="mt-3 max-h-56 overflow-y-auto rounded-lg border border-base-300">
                <table className="table table-sm">
                  <thead>
                    <tr>
                      <th>Day</th>
                      <th>Position</th>
                      <th>Impressions</th>
                      <th>Clicks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="text-center text-base-content/50">
                          No history rows yet.
                        </td>
                      </tr>
                    ) : (
                      history.toReversed().map((point) => (
                        <tr key={point.day} className="hover">
                          <td className="text-xs">{point.day}</td>
                          <td>
                            <PositionCell position={point.position} />
                          </td>
                          <td>{fmt(point.impressions)}</td>
                          <td>{fmt(point.clicks)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
      <button type="button" className="modal-backdrop" onClick={onClose} aria-label="Close backdrop" />
    </div>
  );
}

function ExplainPanel({ explanation }: { explanation: GscMoveExplanation }) {
  const improved = explanation.positionChange < 0;
  const declined = explanation.positionChange > 0;
  const change = explanation.positionChange > 0 ? `+${explanation.positionChange}` : `${explanation.positionChange}`;
  return (
    <div className="mt-3 space-y-2 rounded-lg border border-base-300 bg-base-200/50 p-3 text-sm">
      <div className="flex flex-wrap items-center gap-2">
        <span className={`badge badge-sm ${improved ? "badge-success" : declined ? "badge-error" : "badge-ghost"}`}>
          {improved ? "Improved" : declined ? "Declined" : "Flat"} {change}
        </span>
        <span className="text-xs text-base-content/60">
          {explanation.periodStart} .. {explanation.periodEnd} (7-day averages)
        </span>
        {explanation.urlChanged ? <span className="badge badge-info badge-sm">URL changed</span> : null}
        {explanation.cannibalization ? (
          <span className="badge badge-warning badge-sm">Possible cannibalization</span>
        ) : null}
      </div>
      <p>{explanation.explanation}</p>
      <div className="grid grid-cols-1 gap-1 text-xs text-base-content/60 sm:grid-cols-2">
        <p className="truncate">Before: {explanation.beforeUrl ?? "-"}</p>
        <p className="truncate">After: {explanation.afterUrl ?? "-"}</p>
      </div>
    </div>
  );
}

function Sparkline({ history }: { history: GscHistoryPoint[] }) {
  const points = history.filter((point): point is GscHistoryPoint & { position: number } => point.position !== null);
  if (points.length < 2) {
    return (
      <p className="py-6 text-center text-sm text-base-content/50">Not enough position data for a trend line yet.</p>
    );
  }
  const width = 560;
  const height = 140;
  const pad = 10;
  const topPos = Math.max(...points.map((p) => p.position), 1);
  // Inverted y-axis: position 1 sits at the top of the chart.
  const coords = points.map((point, i) => ({
    x: pad + (i / (points.length - 1)) * (width - pad * 2),
    y: pad + ((point.position - 1) / Math.max(1, topPos - 1)) * (height - pad * 2),
  }));
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-36 w-full" role="img" aria-label="Daily position trend">
      <polyline
        fill="none"
        strokeWidth={2}
        strokeLinejoin="round"
        strokeLinecap="round"
        points={coords.map((c) => `${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(" ")}
        className="stroke-primary"
      />
    </svg>
  );
}
