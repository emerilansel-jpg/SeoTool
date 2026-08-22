import { Loader2, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";

export interface GmbSnapshotLike {
  id: string;
  status: string;
  rank: number | null;
}

interface GmbScanPipelineProps {
  /** Mutation is in flight (server still scanning synchronously). */
  isScanning: boolean;
  /** Latest poll result from the run being viewed. */
  runStatus?: "pending" | "running" | "completed" | "failed";
  snapshots?: GmbSnapshotLike[];
  /** Human error message when the scan request itself failed. */
  error?: string | null;
}

/**
 * Explains the scan pipeline to the user and shows live progress:
 * submit -> DataForSEO live scan per grid point -> ranked heatmap.
 */
export function GmbScanPipeline({
  isScanning,
  runStatus,
  snapshots,
  error,
}: GmbScanPipelineProps) {
  if (error) {
    return (
      <div className="mb-4 p-4 rounded-lg bg-error/10 border border-error/30 text-sm flex items-start gap-3">
        <XCircle className="w-5 h-5 text-error shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold">Scan failed to start</p>
          <p className="text-base-content/70">{error}</p>
        </div>
      </div>
    );
  }

  const total = snapshots?.length ?? 0;
  const done = snapshots?.filter((s) => s.status !== "pending").length ?? 0;
  const ranked = snapshots?.filter((s) => s.rank !== null) ?? [];
  const avgRank = ranked.length
    ? Math.round(
        (ranked.reduce((sum, s) => sum + (s.rank ?? 0), 0) / ranked.length) *
          10,
      ) / 10
    : null;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  if (runStatus === "failed" && !isScanning) {
    return (
      <div className="mb-4 p-4 rounded-lg bg-warning/10 border border-warning/30 text-sm flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold">Scan failed</p>
          <p className="text-base-content/70">
            The grid scan could not be completed. Check your DataForSEO
            connection or credits, then try again.
          </p>
        </div>
      </div>
    );
  }

  if (runStatus === "completed" && !isScanning) {
    return (
      <div className="mb-4 p-4 rounded-lg bg-success/10 border border-success/30 text-sm flex items-start gap-3">
        <CheckCircle2 className="w-5 h-5 text-success shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="font-semibold">
            Scan complete — found in {ranked.length} of {total} grid points
          </p>
          <p className="text-base-content/70">
            {avgRank !== null
              ? `Average local rank: #${avgRank}. Green means top 3, yellow means 4-10, red means 11+, grey means not found in the top 20.`
              : "The business was not found in the top 20 Maps results at any grid point. Try a broader keyword or check the exact Google Business Profile name."}
          </p>
        </div>
      </div>
    );
  }

  // running or scanning
  return (
    <div className="mb-4 p-4 rounded-lg bg-base-200/60 border border-base-300 text-sm">
      <div className="flex items-center gap-2 font-semibold">
        <Loader2 className="w-4 h-4 animate-spin" />
        {isScanning
          ? "Scanning grid points with live Google Maps data…"
          : "Waiting for scan results…"}
        <span className="ml-auto text-base-content/70 font-normal">
          {done}/{total} points
        </span>
      </div>
      <progress
        className="progress progress-primary w-full mt-2"
        value={pct}
        max={100}
      />
      <p className="text-xs text-base-content/60 mt-1">
        Each grid point runs a separate Google Maps search for your keyword. A{" "}
        {total}-point grid usually finishes in under a minute.
      </p>
    </div>
  );
}
