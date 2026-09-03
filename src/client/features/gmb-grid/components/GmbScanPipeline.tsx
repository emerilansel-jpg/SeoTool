import { AlertTriangle, CheckCircle2, Loader2, XCircle } from "lucide-react";

interface RunLike {
  status: "pending" | "running" | "completed" | "partial" | "failed";
  totalPoints: number;
  completedPoints: number;
  failedPoints: number;
  foundPoints: number;
  solv: number | null;
  averageRank: number | null;
  costUsd: number;
  errorMessage: string | null;
}

interface SnapshotLike {
  id: string;
  status: string;
  rank: number | null;
}

export function GmbScanPipeline({
  run,
  snapshots,
}: {
  run: RunLike;
  snapshots: SnapshotLike[];
}) {
  const settled = snapshots.filter(
    (snapshot) => snapshot.status !== "pending",
  ).length;
  const total = run.totalPoints || snapshots.length;
  const percentage = total > 0 ? Math.round((settled / total) * 100) : 0;

  if (run.status === "pending" || run.status === "running") {
    return (
      <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 text-sm">
        <div className="flex items-center gap-2 font-semibold">
          <Loader2 className="size-4 animate-spin text-primary" />
          {run.status === "pending"
            ? "Preparing queued map checks…"
            : "Collecting Google Maps results…"}
          <span className="ml-auto font-normal text-base-content/60">
            {settled}/{total} points
          </span>
        </div>
        <progress
          className="progress progress-primary mt-3 w-full"
          value={percentage}
          max={100}
        />
        <p className="mt-2 text-xs text-base-content/60">
          Results are processed in the background. You may leave this page and
          reopen the scan from Recent scans.
        </p>
      </div>
    );
  }

  if (run.status === "failed") {
    return (
      <div className="rounded-xl border border-error/30 bg-error/10 p-4 text-sm">
        <div className="flex items-start gap-3">
          <XCircle className="mt-0.5 size-5 shrink-0 text-error" />
          <div>
            <p className="font-semibold">Scan failed</p>
            <p className="text-base-content/70">
              {run.errorMessage ||
                "No grid points could be collected. Check provider access, quota, and credits, then retry."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const partial = run.status === "partial";
  const ranks = snapshots
    .map((s) => s.rank)
    .filter((r): r is number => r != null);
  const top3 = ranks.filter((r) => r <= 3).length;
  const top10 = ranks.filter((r) => r > 3 && r <= 10).length;
  const rank11Plus = ranks.filter((r) => r > 10).length;
  const notFound = snapshots.filter(
    (s) => s.status === "completed" && s.rank === null,
  ).length;

  return (
    <div className="space-y-4">
      {/* Top Banner Status */}
      <div
        className={`rounded-xl border p-3 text-sm ${
          partial
            ? "border-warning/30 bg-warning/10"
            : "border-success/30 bg-success/10"
        }`}
      >
        <div className="flex items-center gap-2">
          {partial ? (
            <AlertTriangle className="size-4 shrink-0 text-warning" />
          ) : (
            <CheckCircle2 className="size-4 shrink-0 text-success" />
          )}
          <span className="font-semibold">
            {partial ? "Scan Completed with Errors" : "Scan Completed"}
          </span>
          <span className="text-base-content/60 text-xs ml-auto">
            {run.foundPoints} of {total} found
            {run.failedPoints > 0 ? ` · ${run.failedPoints} failed` : ""}
          </span>
        </div>
      </div>

      {/* Local Falcon Style Large Metrics Scorecards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="rounded-xl border border-base-300 bg-base-100 p-4 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-base-content/60 uppercase tracking-wider">
              SoLV (Top 3)
            </span>
            <span className="badge badge-sm badge-success font-bold">
              Top 3
            </span>
          </div>
          <div className="my-2">
            <span className="text-3xl font-extrabold tracking-tight text-success">
              {run.solv == null ? "—" : `${run.solv}%`}
            </span>
          </div>
          <p className="text-[11px] text-base-content/50 leading-tight">
            Share of Local Voice within 3-pack
          </p>
        </div>

        <div className="rounded-xl border border-base-300 bg-base-100 p-4 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-base-content/60 uppercase tracking-wider">
              Avg Rank
            </span>
            <span className="badge badge-sm badge-neutral font-mono">ATRP</span>
          </div>
          <div className="my-2">
            <span className="text-3xl font-extrabold tracking-tight">
              {run.averageRank == null ? "—" : `#${run.averageRank}`}
            </span>
          </div>
          <p className="text-[11px] text-base-content/50 leading-tight">
            Average Total Rank Position across points
          </p>
        </div>

        <div className="rounded-xl border border-base-300 bg-base-100 p-4 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-base-content/60 uppercase tracking-wider">
              Coverage
            </span>
            <span className="badge badge-sm badge-ghost">{percentage}%</span>
          </div>
          <div className="my-2 flex items-baseline gap-1.5">
            <span className="text-3xl font-extrabold tracking-tight">
              {run.foundPoints}
            </span>
            <span className="text-xs text-base-content/50 font-normal">
              / {total} pins
            </span>
          </div>
          <div className="w-full bg-base-200 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-primary h-full"
              style={{
                width: `${Math.min(100, Math.round((run.foundPoints / (total || 1)) * 100))}%`,
              }}
            />
          </div>
        </div>

        <div className="rounded-xl border border-base-300 bg-base-100 p-4 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-base-content/60 uppercase tracking-wider">
              Distribution
            </span>
            <span className="text-[10px] font-mono text-base-content/40">
              Total {total}
            </span>
          </div>
          <div className="grid grid-cols-4 gap-1 text-center my-2">
            <div className="rounded bg-success/15 py-1">
              <span className="block text-xs font-bold text-success">
                {top3}
              </span>
              <span className="text-[9px] text-base-content/50">1-3</span>
            </div>
            <div className="rounded bg-warning/15 py-1">
              <span className="block text-xs font-bold text-warning">
                {top10}
              </span>
              <span className="text-[9px] text-base-content/50">4-10</span>
            </div>
            <div className="rounded bg-error/15 py-1">
              <span className="block text-xs font-bold text-error">
                {rank11Plus}
              </span>
              <span className="text-[9px] text-base-content/50">11+</span>
            </div>
            <div className="rounded bg-neutral/15 py-1">
              <span className="block text-xs font-bold text-base-content/60">
                {notFound}
              </span>
              <span className="text-[9px] text-base-content/50">-</span>
            </div>
          </div>
          <p className="text-[10px] text-base-content/50 text-right">
            Cost: ${run.costUsd.toFixed(4)}
          </p>
        </div>
      </div>
    </div>
  );
}
