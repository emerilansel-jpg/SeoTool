/* eslint-disable max-lines */
// oxlint-disable typescript-eslint/no-unsafe-type-assertion -- all assertions narrow JSON section data
import { useQuery } from "@tanstack/react-query";
import {
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { getReport, getReportSnapshot } from "@/serverFunctions/reports";
import { reportPdf } from "@/client/lib/reportPdf";
import { formatCount } from "@/client/features/ga4-insights/Ga4InsightsColumns";
import type { ReportSnapshot } from "@/server/features/reports/repositories/ReportsRepository";

type SnapshotData = {
  generatedAt: string;
  range: { startDate: string; endDate: string };
  sections: Record<
    string,
    | { status: "ok"; data: unknown }
    | { status: "skipped"; reason: string }
    | { status: "error"; error: string }
  >;
};

function parseSnapshotData(snapshot: ReportSnapshot): SnapshotData | null {
  try {
    return JSON.parse(snapshot.data) as SnapshotData;
  } catch {
    return null;
  }
}

export function ReportSnapshotView({
  projectId,
  reportId,
  snapshotId,
}: {
  projectId: string;
  reportId: string;
  snapshotId: string;
}) {
  const reportQuery = useQuery({
    queryKey: ["report", projectId, reportId],
    queryFn: () => getReport({ data: { projectId, reportId } }),
  });
  const snapshotQuery = useQuery({
    queryKey: ["reportSnapshot", projectId, snapshotId],
    queryFn: () => getReportSnapshot({ data: { projectId, snapshotId } }),
  });

  const report = reportQuery.data?.report;
  const snapshot = snapshotQuery.data?.snapshot;
  const snapshotData = snapshot ? parseSnapshotData(snapshot) : null;

  if (reportQuery.isPending || snapshotQuery.isPending) {
    return (
      <div className="flex items-center gap-2 p-8 text-sm text-base-content/60">
        <Loader2 className="size-4 animate-spin" /> Loading snapshot…
      </div>
    );
  }

  if (!report || !snapshot || !snapshotData) {
    return (
      <div className="p-8 text-sm text-base-content/60">
        Snapshot not found.
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Branding header */}
      <div
        className="flex items-center justify-between rounded-lg border p-4"
        style={{
          borderColor: report.brandColor ?? "var(--bc)",
          backgroundColor: report.brandColor
            ? `${report.brandColor}08`
            : undefined,
        }}
      >
        <div>
          <h2
            className="text-xl font-semibold"
            style={{ color: report.brandColor ?? undefined }}
          >
            {report.name}
          </h2>
          {report.clientName ? (
            <p className="text-sm text-base-content/70">{report.clientName}</p>
          ) : null}
        </div>
        <div className="text-right text-xs text-base-content/50">
          <p>
            Generated {new Date(snapshotData.generatedAt).toLocaleDateString()}
          </p>
          <p>
            Range {snapshotData.range.startDate} → {snapshotData.range.endDate}
          </p>
        </div>
      </div>

      {/* Sections */}
      {report.sections.map((section) => {
        const result = snapshotData.sections[section.type];
        if (!result) return null;
        if (result.status === "skipped") {
          return (
            <div
              key={section.id}
              className="rounded-lg border border-base-300 p-4"
            >
              <h3 className="text-sm font-semibold capitalize">
                {section.type}
              </h3>
              <p className="mt-1 text-xs text-base-content/50">
                Skipped — {result.reason}
              </p>
            </div>
          );
        }
        if (result.status === "error") {
          return (
            <div key={section.id} className="alert alert-error text-sm">
              <h3 className="font-semibold capitalize">
                {section.type} — error
              </h3>
              <p>{result.error}</p>
            </div>
          );
        }
        return (
          <SectionRenderer
            key={section.id}
            type={section.type}
            data={result.data}
          />
        );
      })}

      {/* PDF download */}
      <div className="flex justify-end">
        <button
          type="button"
          className="btn btn-outline btn-sm gap-1"
          onClick={() => {
            try {
              reportPdf(report, snapshotData);
              toast.success("PDF downloaded");
            } catch {
              toast.error("PDF export failed");
            }
          }}
        >
          <Download className="size-3.5" /> Download PDF
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Section renderers
// ---------------------------------------------------------------------------

function SectionRenderer({ type, data }: { type: string; data: unknown }) {
  switch (type) {
    case "rank":
      return <RankSection data={data as Record<string, unknown>} />;
    case "audit":
      return <AuditSection data={data as Record<string, unknown>} />;
    case "gsc":
      return <GscSection data={data as Record<string, unknown>} />;
    case "ga4":
      return <Ga4Section data={data as Record<string, unknown>} />;
    case "backlinks":
      return <BacklinksSection data={data as Record<string, unknown>} />;
    case "content":
      return <ContentSection data={data as Record<string, unknown>} />;
    default:
      return (
        <div className="rounded-lg border border-base-300 p-4">
          <h3 className="text-sm font-semibold">{type}</h3>
        </div>
      );
  }
}

function RankSection({ data }: { data: Record<string, unknown> }) {
  return (
    <div className="rounded-lg border border-base-300 p-4">
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

function AuditSection({ data }: { data: Record<string, unknown> }) {
  const topIssues =
    (data.topIssues as Array<{ type?: string; count?: number }>) ?? [];
  return (
    <div className="rounded-lg border border-base-300 p-4">
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
              : ((data.status as string) ?? "—")
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

function ContentSection({ data }: { data: Record<string, unknown> }) {
  const distribution = data.distribution as
    | { excellent: number; good: number; fair: number; poor: number }
    | undefined;
  const worstPages =
    (data.worstPages as Array<{ url: string; score: number }>) ?? [];
  const avg = data.averageScore as number | undefined;
  return (
    <div className="rounded-lg border border-base-300 p-4">
      <h3 className="text-sm font-semibold">Content Quality</h3>
      <div className="mt-2 grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
        <StatLine
          label="Avg score"
          value={avg != null ? formatCount(avg) : "—"}
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
              {page.score} — {page.url}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function GscSection({ data }: { data: Record<string, unknown> }) {
  const totals = data.totals as Record<string, number> | undefined;
  const trend = data.trend as
    | Array<{ date: string; clicks: number; impressions: number }>
    | undefined;
  return (
    <div className="rounded-lg border border-base-300 p-4">
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
              totals.ctr != null ? `${(totals.ctr * 100).toFixed(1)}%` : "—"
            }
          />
        </div>
      ) : null}
      {trend && trend.length > 0 ? (
        <div className="mt-3">
          <p className="mb-1 text-xs font-medium text-base-content/60">
            Clicks trend
          </p>
          <LineChart width={600} height={120} data={trend} className="w-full">
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
        </div>
      ) : null}
    </div>
  );
}

function Ga4Section({ data }: { data: Record<string, unknown> }) {
  const totals = data.totals as Record<string, number> | undefined;
  return (
    <div className="rounded-lg border border-base-300 p-4">
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
                : "—"
            }
          />
        </div>
      ) : null}
    </div>
  );
}

function BacklinksSection({ data }: { data: Record<string, unknown> }) {
  return (
    <div className="rounded-lg border border-base-300 p-4">
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
