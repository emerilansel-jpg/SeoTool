// oxlint-disable typescript-eslint/no-unsafe-type-assertion -- DB planTier is string, narrowing to union for lookup maps
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Building2, DollarSign, Users, TrendingUp } from "lucide-react";
import { getAnalyticsOverview } from "@/serverFunctions/analytics";
import { PLAN_TIER_LABELS, PLAN_PRICES_USD } from "@/shared/plans";

const TIER_COLORS: Record<string, string> = {
  free: "#94a3b8",
  lite: "#3b82f6",
  pro: "#8b5cf6",
  agency: "#f59e0b",
};

export function AdminDashboard() {
  const getOverview = useServerFn(getAnalyticsOverview);

  const { data, isLoading } = useQuery({
    queryKey: ["analytics-overview"],
    queryFn: () => getOverview(),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <span className="loading loading-spinner loading-lg" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-8 text-center text-base-content/60">
        Unable to load analytics data.
      </div>
    );
  }

  const paidRate =
    data.totalOrgs > 0
      ? ((data.paidOrgCount / data.totalOrgs) * 100).toFixed(1)
      : "0.0";

  const chartData = data.planDistribution.map((d) => ({
    name:
      PLAN_TIER_LABELS[d.planTier as keyof typeof PLAN_TIER_LABELS] ??
      d.planTier,
    count: d.orgCount,
    tier: d.planTier,
  }));

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 p-4 py-10 md:p-6 md:py-12">
      <div>
        <h1 className="text-xl font-semibold">Platform Analytics</h1>
        <p className="text-sm text-base-content/60 mt-1">
          Platform-wide metrics: organizations, revenue, and quota usage.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard
          icon={<Building2 className="w-5 h-5" />}
          label="Total Orgs"
          value={data.totalOrgs.toString()}
        />
        <StatCard
          icon={<DollarSign className="w-5 h-5" />}
          label="MRR Estimate"
          value={`$${data.mrrEstimate.toLocaleString()}`}
        />
        <StatCard
          icon={<Users className="w-5 h-5" />}
          label="Paid Orgs"
          value={data.paidOrgCount.toString()}
        />
        <StatCard
          icon={<TrendingUp className="w-5 h-5" />}
          label="Paid Rate"
          value={`${paidRate}%`}
        />
      </div>

      {/* Plan Distribution Chart */}
      <div className="rounded-lg border border-base-300 bg-base-100 p-4">
        <h2 className="font-medium mb-4">Plan Tier Distribution</h2>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis dataKey="name" className="text-xs" />
            <YAxis allowDecimals={false} className="text-xs" />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--color-base-100)",
                border: "1px solid var(--color-base-300)",
                borderRadius: "8px",
              }}
            />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={TIER_COLORS[entry.tier] ?? "#3b82f6"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Quota Usage Summary */}
      <div className="rounded-lg border border-base-300 bg-base-100 overflow-hidden">
        <div className="border-b border-base-300 bg-base-50 p-4">
          <h2 className="font-medium">Quota Usage (Current Window)</h2>
          <p className="mt-1 text-xs text-base-content/50">
            Aggregated usage across all orgs. Only windowed features are shown
            (gauge features are not tracked in usage_quota).
          </p>
        </div>

        {data.quotaSummary.length === 0 ? (
          <p className="p-8 text-center text-base-content/50 text-sm">
            No quota usage recorded yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="table table-sm">
              <thead>
                <tr>
                  <th>Feature</th>
                  <th>Period</th>
                  <th className="text-right">Total Used</th>
                  <th className="text-right">Orgs Active</th>
                </tr>
              </thead>
              <tbody>
                {data.quotaSummary.map((row, i) => (
                  <tr key={i}>
                    <td className="font-medium">
                      {formatFeatureName(row.feature)}
                    </td>
                    <td>
                      <span className="badge badge-sm badge-ghost">
                        {row.period}
                      </span>
                    </td>
                    <td className="text-right tabular-nums">
                      {row.totalUsed.toLocaleString()}
                    </td>
                    <td className="text-right tabular-nums">{row.orgCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recent Organizations */}
      <div className="rounded-lg border border-base-300 bg-base-100 overflow-hidden">
        <div className="border-b border-base-300 bg-base-50 p-4">
          <h2 className="font-medium">Recent Organizations</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="table table-sm">
            <thead>
              <tr>
                <th>Name</th>
                <th>Plan</th>
                <th>Status</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {data.recentOrgs.map((org) => (
                <tr key={org.id}>
                  <td className="font-medium">{org.name}</td>
                  <td>
                    <span
                      className="badge badge-sm"
                      style={{
                        backgroundColor: TIER_COLORS[org.planTier] ?? "#94a3b8",
                        color: "white",
                      }}
                    >
                      {PLAN_TIER_LABELS[
                        org.planTier as keyof typeof PLAN_TIER_LABELS
                      ] ?? org.planTier}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`badge badge-sm ${
                        org.status === "active"
                          ? "badge-success"
                          : "badge-warning"
                      }`}
                    >
                      {org.status}
                    </span>
                  </td>
                  <td className="text-sm text-base-content/60">
                    {org.createdAt
                      ? new Date(org.createdAt).toLocaleDateString()
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Revenue breakdown */}
      <div className="rounded-lg border border-base-300 bg-base-100 p-4">
        <h2 className="font-medium mb-3">Revenue Breakdown (Estimated)</h2>
        <div className="space-y-2">
          {data.planDistribution
            .filter(
              (d) =>
                PLAN_PRICES_USD[d.planTier as keyof typeof PLAN_PRICES_USD] > 0,
            )
            .map((d) => {
              const price =
                PLAN_PRICES_USD[d.planTier as keyof typeof PLAN_PRICES_USD] ??
                0;
              const revenue = price * d.orgCount;
              return (
                <div
                  key={d.planTier}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: TIER_COLORS[d.planTier] }}
                    />
                    {
                      PLAN_TIER_LABELS[
                        d.planTier as keyof typeof PLAN_TIER_LABELS
                      ]
                    }
                    <span className="text-base-content/50">
                      ({d.orgCount} × ${price}/mo)
                    </span>
                  </span>
                  <span className="font-mono tabular-nums">
                    ${revenue.toLocaleString()}/mo
                  </span>
                </div>
              );
            })}
          <div className="divider my-1" />
          <div className="flex items-center justify-between font-semibold">
            <span>Total MRR</span>
            <span className="font-mono tabular-nums">
              ${data.mrrEstimate.toLocaleString()}/mo
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-base-300 bg-base-100 p-4">
      <div className="flex items-center gap-2 text-base-content/60 text-xs mb-2">
        {icon}
        <span>{label}</span>
      </div>
      <div className="text-2xl font-bold tabular-nums">{value}</div>
    </div>
  );
}

function formatFeatureName(feature: string): string {
  const map: Record<string, string> = {
    keyword_search: "Keyword Searches",
    backlink_check: "Backlink Checks",
    site_audit: "Site Audits",
    ai_brand_lookup: "AI Brand Lookups",
    ai_prompt: "AI Prompts",
    content_intelligence: "Content Intelligence",
  };
  return map[feature] ?? feature;
}
