import {
  buildBrandLookupModel,
  buildGmbGridModel,
  formatPlatform,
  formatReportCurrency,
  formatReportDate,
  formatReportNumber,
  formatReportPercent,
  humanize,
} from "./reportData";
import {
  CompactTable,
  CompletenessNote,
  Metric,
  MetricGrid,
  ReportSectionCard,
  TrendChart,
} from "./ReportSectionUi";

export function GmbGridReportSection({ data }: { data: unknown }) {
  const model = buildGmbGridModel(data);
  return (
    <ReportSectionCard
      title="Local Map Rank"
      subtitle="Google Maps visibility across tracked keywords and locations"
    >
      <MetricGrid>
        <Metric
          label="Total scans"
          value={formatReportNumber(model.totalScans, 0)}
        />
        <Metric
          label="Share of local voice"
          value={formatReportPercent(model.metrics.solv.current)}
          previous={previousPercent(model.metrics.solv.previous)}
        />
        <Metric
          label="Average rank"
          value={formatReportNumber(model.metrics.averageRank.current)}
          previous={previousNumber(model.metrics.averageRank.previous)}
          lowerIsBetter
        />
        <Metric
          label="Top 3"
          value={formatReportNumber(model.metrics.top3.current, 0)}
          previous={previousNumber(model.metrics.top3.previous, 0)}
        />
        <Metric
          label="Top 10"
          value={formatReportNumber(model.metrics.top10.current, 0)}
        />
        <Metric
          label="Top 20"
          value={formatReportNumber(model.metrics.top20.current, 0)}
        />
        <Metric
          label="Scan cost"
          value={formatReportCurrency(model.metrics.cost.current)}
          previous={
            model.metrics.cost.previous === undefined
              ? undefined
              : formatReportCurrency(model.metrics.cost.previous)
          }
        />
      </MetricGrid>
      <TrendChart
        title="Scan trend"
        data={model.trend}
        series={[
          { key: "solv", label: "SoLV", color: "#2563eb" },
          { key: "averageRank", label: "Average rank", color: "#f97316" },
        ]}
      />
      <CompactTable
        caption="Keywords and locations"
        rows={model.keywordLocations.slice(0, 20)}
        rowKey={(row, index) => `${row.keyword}-${row.location}-${index}`}
        columns={[
          { label: "Keyword", render: (row) => row.keyword },
          { label: "Location", render: (row) => row.location },
          {
            label: "Scans",
            align: "right",
            render: (row) => formatReportNumber(row.scans, 0),
          },
          {
            label: "SoLV",
            align: "right",
            render: (row) => formatReportPercent(row.solv),
          },
          {
            label: "Avg rank",
            align: "right",
            render: (row) => formatReportNumber(row.averageRank),
          },
        ]}
      />
      <CompletenessNote value={model.completeness} />
    </ReportSectionCard>
  );
}

export function BrandLookupReportSection({ data }: { data: unknown }) {
  const model = buildBrandLookupModel(data);
  return (
    <ReportSectionCard
      title="Brand Lookup"
      subtitle={
        model.target
          ? `AI search footprint for ${model.target}`
          : "AI search footprint"
      }
    >
      <MetricGrid>
        <Metric label="Target" value={model.target ?? "N/A"} />
        <Metric
          label="Total mentions"
          value={formatReportNumber(model.totalMentions, 0)}
        />
        <Metric
          label="AI search volume"
          value={formatReportNumber(model.searchVolume, 0)}
        />
        <Metric
          label="Data refreshed"
          value={formatReportDate(model.freshness)}
        />
      </MetricGrid>
      <CompactTable
        caption="Platform breakdown"
        rows={model.platforms}
        rowKey={(row, index) => `${row.platform ?? "platform"}-${index}`}
        columns={[
          { label: "Platform", render: (row) => formatPlatform(row.platform) },
          {
            label: "Status",
            render: (row) => (
              <span
                className={
                  row.status === "error" ? "text-error" : "text-success"
                }
              >
                {row.status ? humanize(row.status) : "Available"}
              </span>
            ),
          },
          {
            label: "Mentions",
            align: "right",
            render: (row) => formatReportNumber(row.mentions, 0),
          },
          {
            label: "Search volume",
            align: "right",
            render: (row) => formatReportNumber(row.searchVolume, 0),
          },
        ]}
      />
      <TrendChart
        title="Platform trend"
        data={model.platformTrend}
        series={[
          { key: "mentions", label: "Mentions", color: "#2563eb" },
          { key: "searchVolume", label: "Search volume", color: "#14b8a6" },
        ]}
      />
      <CompactTable
        caption="Share of voice"
        rows={model.sovEntries}
        rowKey={(row, index) => `${row.label}-${index}`}
        emptyText="Add competitors to the lookup to compare share of voice."
        columns={[
          {
            label: "Brand",
            render: (row) => (
              <span
                className={
                  row.isTarget ? "font-semibold text-primary" : undefined
                }
              >
                {row.label}
                {row.isTarget ? " (target)" : ""}
              </span>
            ),
          },
          {
            label: "Mentions",
            align: "right",
            render: (row) => formatReportNumber(row.mentions, 0),
          },
          {
            label: "Share",
            align: "right",
            render: (row) => formatReportPercent(row.share),
          },
        ]}
      />
      <TrendChart
        title="Share of voice trend"
        data={model.sovTrend}
        series={[{ key: "share", label: "Share of voice", color: "#7c3aed" }]}
      />
      <CompletenessNote value={model.completeness} />
    </ReportSectionCard>
  );
}

function previousPercent(value: number | undefined): string | undefined {
  return value === undefined ? undefined : formatReportPercent(value);
}

function previousNumber(
  value: number | undefined,
  maximumFractionDigits = 1,
): string | undefined {
  return value === undefined
    ? undefined
    : formatReportNumber(value, maximumFractionDigits);
}
