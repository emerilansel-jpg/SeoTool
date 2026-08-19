// Shared building blocks for the dashboard cards. Same visual language as
// the GSC IntegrationCard (rounded-xl, header row + divider) so
// the embedded SearchConsoleConnectionCard doesn't read as a different
// design system.
export function CardShell({
  title,
  stamp,
  action,
  children,
}: {
  title: string;
  stamp?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-base-300 bg-base-100 shadow-xs transition-all duration-200 hover:border-base-content/20 hover:shadow-md">
      <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-base-300/80 bg-base-200/20">
        <h2 className="text-sm font-bold tracking-tight text-base-content leading-tight">
          {title}
        </h2>
        {action}
      </div>
      <div className="p-5">
        {children}
        {stamp ? (
          <p className="mt-4 text-[11px] font-medium text-base-content/45">
            {stamp}
          </p>
        ) : null}
      </div>
    </div>
  );
}

export function EmptyCardBody({
  message,
  cta,
}: {
  message: string;
  cta: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-start gap-3.5 py-2">
      <p className="text-sm text-base-content/70 leading-relaxed">{message}</p>
      {cta}
    </div>
  );
}

export function Stat({
  label,
  value,
  tone,
  sub,
}: {
  label: string;
  value: string;
  tone?: "success" | "error";
  sub?: React.ReactNode;
}) {
  const toneClass =
    tone === "success"
      ? "text-emerald-500"
      : tone === "error"
        ? "text-rose-500"
        : "text-base-content";
  return (
    <div className="rounded-xl border border-base-300/60 bg-base-200/30 p-3">
      <p className="text-[11px] font-bold uppercase tracking-wider text-base-content/50">
        {label}
      </p>
      <p
        className={`mt-1 text-2xl font-bold tracking-tight tabular-nums ${toneClass}`}
      >
        {value}
      </p>
      {sub ? <div className="mt-1">{sub}</div> : null}
    </div>
  );
}

export function PercentDelta({
  current,
  previous,
}: {
  current: number;
  previous: number;
}) {
  if (previous <= 0) return null;
  const pct = ((current - previous) / previous) * 100;
  if (!Number.isFinite(pct)) return null;
  const rounded = Math.round(pct);
  const isPositive = rounded > 0;
  const isNegative = rounded < 0;
  const tone = isPositive
    ? "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10"
    : isNegative
      ? "text-rose-600 dark:text-rose-400 bg-rose-500/10"
      : "text-base-content/60 bg-base-200";
  return (
    <span
      className={`inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[11px] font-semibold tabular-nums ${tone}`}
    >
      {isPositive ? "▲ +" : isNegative ? "▼ " : ""}
      {Math.abs(rounded)}%
    </span>
  );
}

export const moreDetailsClass =
  "btn btn-ghost btn-xs font-semibold text-primary hover:bg-primary/10";

export function newLost(value: number | null): string {
  return value === null ? "—" : String(value);
}

export function formatDay(timestamp: string): string {
  const ms = Date.parse(
    // SQLite's current_timestamp default has no timezone marker; treat it as
    // UTC rather than letting the browser parse it as local time.
    /^\d{4}-\d{2}-\d{2} /.test(timestamp)
      ? `${timestamp.replace(" ", "T")}Z`
      : timestamp,
  );
  if (Number.isNaN(ms)) return timestamp;
  return new Date(ms).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}
