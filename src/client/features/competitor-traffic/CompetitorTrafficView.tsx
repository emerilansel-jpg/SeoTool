import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { TrendingUp } from "lucide-react";
import { getStandardErrorMessage } from "@/client/lib/error-messages";
import {
  compareCompetitorTraffic,
  getCompetitorTopPages,
} from "@/serverFunctions/growth-tools";

const fmt = (n: number) => new Intl.NumberFormat().format(n);
const fmtUsd = (n: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);

const SERIES_COLORS = ["#3b82f6", "#f97316", "#22c55e", "#a855f7", "#ef4444"];

type CompareResult = {
  rows: Array<{
    domain: string;
    latestMonth: string | null;
    organicTraffic: number | null;
    etv: number | null;
    series: Array<{ month: string; traffic: number; etv: number }>;
  }>;
};

export function CompetitorTrafficView({ projectId }: { projectId: string }) {
  const [domainsInput, setDomainsInput] = useState("");
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);

  const compareMutation = useMutation({
    mutationFn: () => {
      const domains = domainsInput
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
        .slice(0, 5);
      return compareCompetitorTraffic({
        data: { projectId, domains },
      });
    },
    onSuccess: () => {
      setSelectedDomain(null);
      toast.success("Traffic comparison ready.");
    },
    onError: (error) =>
      toast.error(getStandardErrorMessage(error, "Comparison failed")),
  });

  const domainCount = domainsInput
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean).length;

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-base-300 bg-base-100 p-6">
        <div className="flex items-center gap-2">
          <TrendingUp className="size-5 text-primary" />
          <h2 className="text-lg font-semibold">Compare domains</h2>
        </div>
        <p className="mt-1 text-sm text-base-content/60">
          Estimated monthly organic traffic and traffic value for up to 5
          domains. One DataForSEO Labs call covers all of them.
        </p>
        <textarea
          className="textarea textarea-bordered mt-3 w-full font-mono text-sm"
          rows={4}
          placeholder={"example.com\ncompetitor.com\ncompetitor2.com"}
          value={domainsInput}
          onChange={(event) => setDomainsInput(event.target.value)}
        />
        <button
          type="button"
          className="btn btn-primary mt-3"
          disabled={compareMutation.isPending || domainCount === 0}
          onClick={() => compareMutation.mutate()}
        >
          {compareMutation.isPending ? (
            <span className="loading loading-spinner loading-sm" />
          ) : null}
          Compare {domainCount > 0 ? `${domainCount} domain(s)` : ""}
        </button>
      </div>

      {compareMutation.data && compareMutation.data.rows.length > 0 ? (
        <CompareResultView
          result={compareMutation.data}
          projectId={projectId}
          selectedDomain={selectedDomain}
          onSelectDomain={setSelectedDomain}
        />
      ) : null}
    </div>
  );
}

function CompareResultView({
  result,
  projectId,
  selectedDomain,
  onSelectDomain,
}: {
  result: CompareResult;
  projectId: string;
  selectedDomain: string | null;
  onSelectDomain: (domain: string | null) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="overflow-x-auto rounded-lg border border-base-300 bg-base-100">
        <table className="table table-sm">
          <thead>
            <tr>
              <th>Domain</th>
              <th>Latest month</th>
              <th>Est. organic traffic</th>
              <th>Traffic value</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {result.rows.map((row) => (
              <tr key={row.domain} className="hover">
                <td className="font-medium">{row.domain}</td>
                <td className="text-base-content/60">
                  {row.latestMonth ?? "-"}
                </td>
                <td>
                  {row.organicTraffic === null ? "-" : fmt(row.organicTraffic)}
                </td>
                <td>{row.etv === null ? "-" : fmtUsd(row.etv)}</td>
                <td className="text-right">
                  <button
                    type="button"
                    className="btn btn-xs btn-outline"
                    onClick={() =>
                      onSelectDomain(
                        selectedDomain === row.domain ? null : row.domain,
                      )
                    }
                  >
                    {selectedDomain === row.domain ? "Hide pages" : "Top pages"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <TrafficChart rows={result.rows} />

      {selectedDomain ? (
        <TopPages projectId={projectId} domain={selectedDomain} />
      ) : null}
    </div>
  );
}

function TrafficChart({ rows }: { rows: CompareResult["rows"] }) {
  const withSeries = rows.filter((row) => row.series.length > 1);
  if (withSeries.length === 0) return null;

  const width = 720;
  const height = 220;
  const padding = { top: 12, right: 12, bottom: 24, left: 48 };
  const months = withSeries[0].series.map((point) => point.month);
  const maxTraffic = Math.max(
    ...withSeries.flatMap((row) => row.series.map((point) => point.traffic)),
    1,
  );

  const x = (index: number) =>
    padding.left +
    (index / Math.max(months.length - 1, 1)) *
      (width - padding.left - padding.right);
  const y = (traffic: number) =>
    height -
    padding.bottom -
    (traffic / maxTraffic) * (height - padding.top - padding.bottom);

  return (
    <div className="rounded-lg border border-base-300 bg-base-100 p-6">
      <h2 className="text-base font-semibold">
        Estimated organic traffic (monthly)
      </h2>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="mt-3 w-full"
        role="img"
        aria-label="Monthly organic traffic comparison"
      >
        {[0, 0.5, 1].map((fraction) => (
          <g key={fraction}>
            <line
              x1={padding.left}
              x2={width - padding.right}
              y1={y(maxTraffic * fraction)}
              y2={y(maxTraffic * fraction)}
              stroke="currentColor"
              strokeOpacity="0.15"
            />
            <text
              x={padding.left - 6}
              y={y(maxTraffic * fraction) + 4}
              textAnchor="end"
              className="fill-current text-[10px] opacity-60"
            >
              {fmt(Math.round(maxTraffic * fraction))}
            </text>
          </g>
        ))}
        {withSeries.map((row, rowIndex) => (
          <polyline
            key={row.domain}
            fill="none"
            stroke={SERIES_COLORS[rowIndex % SERIES_COLORS.length]}
            strokeWidth="2"
            points={row.series
              .map((point, index) => `${x(index)},${y(point.traffic)}`)
              .join(" ")}
          >
            <title>{row.domain}</title>
          </polyline>
        ))}
        {months.map((month, index) =>
          index % 6 === 0 ? (
            <text
              key={month}
              x={x(index)}
              y={height - 6}
              textAnchor="middle"
              className="fill-current text-[10px] opacity-60"
            >
              {month}
            </text>
          ) : null,
        )}
      </svg>
      <div className="mt-2 flex flex-wrap gap-3 text-xs">
        {withSeries.map((row, rowIndex) => (
          <span key={row.domain} className="inline-flex items-center gap-1.5">
            <span
              className="inline-block size-2.5 rounded-full"
              style={{
                backgroundColor: SERIES_COLORS[rowIndex % SERIES_COLORS.length],
              }}
            />
            {row.domain}
          </span>
        ))}
      </div>
    </div>
  );
}

function TopPages({
  projectId,
  domain,
}: {
  projectId: string;
  domain: string;
}) {
  const query = getCompetitorTopPagesQuery(projectId, domain);
  if (query.isLoading) {
    return (
      <div className="flex justify-center rounded-lg border border-base-300 bg-base-100 py-10">
        <span className="loading loading-spinner" />
      </div>
    );
  }
  const pages = query.data?.pages ?? [];
  return (
    <div className="rounded-lg border border-base-300 bg-base-100 p-6">
      <h2 className="text-base font-semibold">Top pages: {domain}</h2>
      {pages.length === 0 ? (
        <p className="mt-2 text-sm text-base-content/50">
          No page data available for this domain.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="table table-sm mt-2">
            <thead>
              <tr>
                <th>URL</th>
                <th>Est. traffic</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody>
              {pages.map((page) => (
                <tr key={page.url}>
                  <td className="max-w-96 truncate">
                    <a
                      className="link link-hover text-xs"
                      href={page.url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {page.url}
                    </a>
                  </td>
                  <td>{page.traffic === null ? "-" : fmt(page.traffic)}</td>
                  <td>{page.etv === null ? "-" : fmtUsd(page.etv)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// Small wrapper so TopPages stays a plain function component.
function getCompetitorTopPagesQuery(projectId: string, domain: string) {
  return useQuery({
    queryKey: ["competitor-top-pages", projectId, domain],
    queryFn: () =>
      getCompetitorTopPages({ data: { projectId, domain, limit: 20 } }),
    enabled: !!domain,
  });
}
