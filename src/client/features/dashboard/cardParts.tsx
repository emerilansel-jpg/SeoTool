// Shared building blocks for the dashboard cards. Same visual language as
// the GSC IntegrationCard (rounded-xl, header row + divider) so
// the embedded SearchConsoleConnectionCard doesn't read as a different
// design system.
export function CardShell({
  title,
  icon,
  stamp,
  action,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  stamp?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-base-300/80 bg-base-100 shadow-2xs transition-all duration-200 hover:border-primary/35 hover:shadow-xs">
      <div className="flex items-center justify-between gap-4 px-5 py-3.5 border-b border-base-300/70 bg-base-200/30">
        <div className="flex items-center gap-2.5 min-w-0">
          {icon ? <div className="shrink-0">{icon}</div> : null}
          <h2 className="text-sm font-bold tracking-tight text-base-content leading-tight truncate">
            {title}
          </h2>
        </div>
        {action}
      </div>
      <div className="p-5">
        {children}
        {stamp ? (
          <p className="mt-4 text-[11px] font-mono font-medium text-base-content/45">
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
      ? "text-emerald-600 dark:text-emerald-400"
      : tone === "error"
        ? "text-rose-600 dark:text-rose-400"
        : "text-base-content";
  return (
    <div className="rounded-xl border border-base-300/70 bg-base-200/30 p-4 transition-all hover:bg-base-200/60 hover:border-base-300">
      <p className="text-[11px] font-bold uppercase tracking-wider text-base-content/55">
        {label}
      </p>
      <p
        className={`mt-1.5 text-2xl font-extrabold tracking-tight tabular-nums ${toneClass}`}
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
    ? "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 ring-1 ring-emerald-500/20"
    : isNegative
      ? "text-rose-600 dark:text-rose-400 bg-rose-500/10 ring-1 ring-rose-500/20"
      : "text-base-content/70 bg-base-200";
  return (
    <span
      className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums ${tone}`}
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
