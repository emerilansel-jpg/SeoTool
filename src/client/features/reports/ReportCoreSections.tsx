// oxlint-disable typescript-eslint/no-unsafe-type-assertion -- all assertions narrow JSON section data
// Existing report section renderers moved out of ReportSnapshotView.
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { formatCount } from "@/client/features/ga4-insights/Ga4InsightsColumns";

type SectionData = Record<string, unknown>;

export function RankSection({ data }: { data: SectionData }) {
  return (
    <div className="rounded-xl border border-base-300 p-4">
      <h3 className="text-sm font-semibold">Rank Tracking</h3>
      <div className="mt-2 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
        <StatLine
          label="Tracked"
          value={formatCount(data.trackedKeywords as number)}
        />
        <StatLine
          label="Improved"
          value={formatCount(data.improved as number)}
          tone="success"
        />
        <StatLine
          label="Declined"
          value={formatCount(data.declined as number)}
          tone="error"
        />
        <StatLine label="Top 10" value={formatCount(data.top10 as number)} />
      </div>
    </div>
  );
}

export function AuditSection({ data }: { data: SectionData }) {
  const topIssues =
    (data.topIssues as Array<{ type?: string; count?: number }>) ?? [];
  return (
    <div className="rounded-xl border border-base-300 p-4">
      <h3 className="text-sm font-semibold">Site Audit</h3>
      <div className="mt-2 grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
        <StatLine
          label="Pages crawled"
          value={formatCount(data.pagesCrawled as number)}
        />
        <StatLine
          label="Issue types"
          value={formatCount(data.totalIssueTypes as number)}
        />
        <StatLine
          label="Status"
          value={
            data.status === "completed"
              ? "Completed"
              : ((data.status as string) ?? "Not available")
          }
        />
      </div>
      {topIssues.length > 0 ? (
        <ul className="mt-3 space-y-1 text-xs text-base-content/70">
          {topIssues.slice(0, 5).map((issue, i) => (
            <li key={i}>
              {issue.type}: {formatCount(issue.count ?? 0)}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

export function ContentSection({ data }: { data: SectionData }) {
  const distribution = data.distribution as
    | { excellent: number; good: number; fair: number; poor: number }
    | undefined;
  const worstPages =
    (data.worstPages as Array<{ url: string; score: number }>) ?? [];
  const avg = data.averageScore as number | undefined;
  return (
    <div className="rounded-xl border border-base-300 p-4">
      <h3 className="text-sm font-semibold">Content Quality</h3>
      <div className="mt-2 grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
        <StatLine
          label="Avg score"
          value={avg != null ? formatCount(avg) : "Not available"}
          tone={
            avg == null
              ? undefined
              : avg >= 90
                ? "success"
                : avg < 50
                  ? "error"
                  : undefined
          }
        />
        <StatLine
          label="Pages scored"
          value={formatCount(data.total as number)}
        />
        <StatLine
          label="Need work"
          value={formatCount(distribution?.poor ?? 0)}
          tone={(distribution?.poor ?? 0) > 0 ? "error" : "success"}
        />
      </div>
      {worstPages.length > 0 ? (
        <ul className="mt-3 space-y-1 text-xs text-base-content/70">
          {worstPages.slice(0, 5).map((page, i) => (
            <li key={i} className="truncate">
              {page.score} · {page.url}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

export function GscSection({ data }: { data: SectionData }) {
  const totals = data.totals as Record<string, number> | undefined;
  const trend = data.trend as
    | Array<{ date: string; clicks: number; impressions: number }>
    | undefined;
  return (
    <div className="rounded-xl border border-base-300 p-4">
      <h3 className="text-sm font-semibold">Search Console</h3>
      {totals ? (
        <div className="mt-2 grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
          <StatLine label="Clicks" value={formatCount(totals.clicks ?? 0)} />
          <StatLine
            label="Impressions"
            value={formatCount(totals.impressions ?? 0)}
          />
          <StatLine
            label="CTR"
            value={
              totals.ctr != null
                ? `${(totals.ctr * 100).toFixed(1)}%`
                : "Not available"
            }
          />
        </div>
      ) : null}
      {trend && trend.length > 1 ? (
        <div className="mt-3">
          <p className="mb-1 text-xs font-medium text-base-content/60">
            Clicks trend
          </p>
          <div
            className="h-36 w-full"
            role="img"
            aria-label="Clicks trend chart"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={trend}
                margin={{ top: 8, right: 12, left: -18, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  opacity={0.15}
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  width={35}
                />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="clicks"
                  stroke="#2563eb"
                  strokeWidth={1.5}
                  dot={false}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function Ga4Section({ data }: { data: SectionData }) {
  const totals = data.totals as Record<string, number> | undefined;
  return (
    <div className="rounded-xl border border-base-300 p-4">
      <h3 className="text-sm font-semibold">Google Analytics 4</h3>
      {totals ? (
        <div className="mt-2 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
          <StatLine
            label="Sessions"
            value={formatCount(totals.sessions ?? 0)}
          />
          <StatLine label="Users" value={formatCount(totals.totalUsers ?? 0)} />
          <StatLine
            label="Pageviews"
            value={formatCount(totals.screenPageViews ?? 0)}
          />
          <StatLine
            label="Engagement"
            value={
              totals.engagementRate != null
                ? `${(totals.engagementRate * 100).toFixed(1)}%`
                : "Not available"
            }
          />
        </div>
      ) : null}
    </div>
  );
}

export function BacklinksSection({ data }: { data: SectionData }) {
  return (
    <div className="rounded-xl border border-base-300 p-4">
      <h3 className="text-sm font-semibold">Backlinks</h3>
      <div className="mt-2 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
        <StatLine
          label="Backlinks"
          value={formatCount((data.backlinks as number) ?? 0)}
        />
        <StatLine
          label="Ref. domains"
          value={formatCount((data.referringDomains as number) ?? 0)}
        />
        <StatLine
          label="New"
          value={formatCount((data.newBacklinks as number) ?? 0)}
          tone="success"
        />
        <StatLine
          label="Lost"
          value={formatCount((data.lostBacklinks as number) ?? 0)}
          tone="error"
        />
      </div>
    </div>
  );
}

function StatLine({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "success" | "error";
}) {
  return (
    <div>
      <div className="text-xs text-base-content/50">{label}</div>
      <div
        className={`font-medium ${
          tone === "success"
            ? "text-success"
            : tone === "error"
              ? "text-error"
              : ""
        }`}
      >
        {value}
      </div>
    </div>
  );
}
