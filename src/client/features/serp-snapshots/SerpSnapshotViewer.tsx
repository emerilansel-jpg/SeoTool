import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ExternalLink, Search, Trophy, AlertCircle } from "lucide-react";
import { getSerpSnapshot } from "@/serverFunctions/serp-snapshots";

interface SerpSnapshotRow {
  id: string;
  rank: number;
  url: string | null;
  title: string | null;
  description: string | null;
  domain: string | null;
  isTrackedDomain: boolean;
  checkedAt: string | Date | null;
}

export function SerpSnapshotViewer({
  projectId,
  trackingKeywordId,
  keyword,
  defaultDevice = "desktop",
}: {
  projectId: string;
  trackingKeywordId: string;
  keyword: string;
  defaultDevice?: "desktop" | "mobile";
}) {
  const [device, setDevice] = useState<"desktop" | "mobile">(defaultDevice);

  const { data: snapshots = [], isLoading } = useQuery({
    queryKey: ["serp-snapshot", trackingKeywordId, device],
    queryFn: () =>
      getSerpSnapshot({
        data: { projectId, trackingKeywordId, device },
      }),
    enabled: Boolean(trackingKeywordId),
  });

  const trackedRow = snapshots.find((s) => s.isTrackedDomain);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <Search className="w-4 h-4" /> SERP Composition
          </h3>
          <p className="text-xs text-base-content/60 mt-0.5">
            Latest SERP for "{keyword}" — top {snapshots.length} organic results
          </p>
        </div>
        {/* Device toggle */}
        <div className="join">
          <button
            className={`btn btn-xs join-item ${device === "desktop" ? "btn-active" : ""}`}
            onClick={() => setDevice("desktop")}
          >
            Desktop
          </button>
          <button
            className={`btn btn-xs join-item ${device === "mobile" ? "btn-active" : ""}`}
            onClick={() => setDevice("mobile")}
          >
            Mobile
          </button>
        </div>
      </div>

      {/* Tracked domain position highlight */}
      {trackedRow && (
        <div className="alert alert-success py-2">
          <Trophy className="w-4 h-4 shrink-0" />
          <span className="text-sm">
            Your domain <strong>{trackedRow.domain}</strong> is ranking at{" "}
            <strong>#{trackedRow.rank}</strong>
          </span>
        </div>
      )}
      {!trackedRow && snapshots.length > 0 && (
        <div className="alert alert-warning py-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span className="text-sm">
            Your domain is not appearing in the top {snapshots.length} results
            for this keyword.
          </span>
        </div>
      )}

      {/* SERP table */}
      {isLoading ? (
        <div className="flex justify-center py-8">
          <span className="loading loading-spinner loading-sm" />
        </div>
      ) : snapshots.length === 0 ? (
        <div className="text-center py-8 text-base-content/50 text-sm border border-dashed border-base-300 rounded-box">
          No SERP snapshot available yet. SERP data is captured during the next
          rank check run.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="table table-sm">
            <thead>
              <tr>
                <th className="w-12">#</th>
                <th>Result</th>
                <th className="w-24">Domain</th>
              </tr>
            </thead>
            <tbody>
              {snapshots.map((row) => (
                <SerpRow key={row.id} row={row} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function SerpRow({ row }: { row: SerpSnapshotRow }) {
  return (
    <tr className={row.isTrackedDomain ? "bg-success/10" : ""}>
      <td className="font-mono text-center tabular-nums">
        {row.isTrackedDomain && <span className="text-success">●</span>}{" "}
        {row.rank}
      </td>
      <td>
        <div className="min-w-0">
          <div className="font-medium text-sm truncate flex items-center gap-1">
            {row.title || "(no title)"}
            {row.url && (
              <a
                href={row.url}
                target="_blank"
                rel="noreferrer"
                className="text-base-content/40 hover:text-primary"
              >
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
          {row.description && (
            <div className="text-xs text-base-content/60 truncate mt-0.5">
              {row.description}
            </div>
          )}
          {row.url && (
            <div className="text-xs text-base-content/40 truncate mt-0.5">
              {row.url}
            </div>
          )}
        </div>
      </td>
      <td>
        {row.isTrackedDomain ? (
          <span className="badge badge-success badge-sm">You</span>
        ) : (
          <span className="text-xs text-base-content/60">{row.domain}</span>
        )}
      </td>
    </tr>
  );
}
