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
  return (
    <div
      className={`rounded-xl border p-4 text-sm ${
        partial
          ? "border-warning/30 bg-warning/10"
          : "border-success/30 bg-success/10"
      }`}
    >
      <div className="flex items-start gap-3">
        {partial ? (
          <AlertTriangle className="mt-0.5 size-5 shrink-0 text-warning" />
        ) : (
          <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-success" />
        )}
        <div className="flex-1">
          <p className="font-semibold">
            {partial ? "Scan completed with some errors" : "Scan complete"}
          </p>
          <p className="text-base-content/70">
            Found in {run.foundPoints} of {total} points
            {run.failedPoints > 0 ? ` · ${run.failedPoints} failed` : ""}.
          </p>
          <div className="mt-3 grid grid-cols-3 gap-3">
            <Metric
              label="SoLV (top 3)"
              value={run.solv == null ? "—" : `${run.solv}%`}
            />
            <Metric
              label="Average rank"
              value={run.averageRank == null ? "—" : `#${run.averageRank}`}
            />
            <Metric
              label="Provider cost"
              value={`$${run.costUsd.toFixed(4)}`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-base-100/70 p-2">
      <p className="text-xs text-base-content/60">{label}</p>
      <p className="font-semibold">{value}</p>
    </div>
  );
}
