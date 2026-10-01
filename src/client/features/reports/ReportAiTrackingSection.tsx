import {
  buildAiTrackingModel,
  formatPlatform,
  formatReportNumber,
  formatReportPercent,
  humanize,
} from "./reportData";
import {
  CompactTable,
  CompletenessNote,
  EmptyDetail,
  Metric,
  MetricGrid,
  ReportSectionCard,
} from "./ReportSectionUi";

export function AiTrackingReportSection({ data }: { data: unknown }) {
  const model = buildAiTrackingModel(data);
  return (
    <ReportSectionCard
      title="Generative AI"
      subtitle={
        model.target
          ? `Visibility and citations for ${model.target}`
          : "Visibility and citations"
      }
    >
      <MetricGrid>
        <ComparisonMetric
          label="Visibility"
          metric={model.metrics.visibility}
        />
        <ComparisonMetric
          label="Mention rate"
          metric={model.metrics.mentionRate}
        />
        <ComparisonMetric
          label="Citation rate"
          metric={model.metrics.citationRate}
        />
        <ComparisonMetric
          label="Share of voice"
          metric={model.metrics.shareOfVoice}
        />
      </MetricGrid>
      <CompactTable
        caption="Platform performance"
        rows={model.platforms}
        rowKey={(row, index) => `${row.platform ?? "platform"}-${index}`}
        columns={[
          { label: "Platform", render: (row) => formatPlatform(row.platform) },
          {
            label: "Visibility",
            align: "right",
            render: (row) => formatReportPercent(row.visibility),
          },
          {
            label: "Mention rate",
            align: "right",
            render: (row) => formatReportPercent(row.mentionRate),
          },
          {
            label: "Citation rate",
            align: "right",
            render: (row) => formatReportPercent(row.citationRate),
          },
          {
            label: "SOV",
            align: "right",
            render: (row) => formatReportPercent(row.shareOfVoice),
          },
        ]}
      />
      <div>
        <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-base-content/60">
          Sentiment
        </h4>
        {model.sentiment.length ? (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {model.sentiment.map((item) => (
              <div
                key={item.label}
                className="rounded-lg border border-base-300 p-3"
              >
                <div className="text-xs text-base-content/55">
                  {humanize(item.label)}
                </div>
                <div className="mt-1 font-semibold tabular-nums">
                  {item.percent !== undefined
                    ? formatReportPercent(item.percent)
                    : formatReportNumber(item.count, 0)}
                </div>
                {item.percent !== undefined && item.count !== undefined ? (
                  <div className="text-[11px] text-base-content/50">
                    {formatReportNumber(item.count, 0)} mentions
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        ) : (
          <EmptyDetail>
            No sentiment data available for this period.
          </EmptyDetail>
        )}
      </div>
      <CompactTable
        caption="Competitors"
        rows={model.competitors.slice(0, 10)}
        rowKey={(row, index) => `${row.label}-${index}`}
        columns={[
          { label: "Brand", render: (row) => row.label },
          {
            label: "Mentions",
            align: "right",
            render: (row) => formatReportNumber(row.mentions, 0),
          },
          {
            label: "Visibility",
            align: "right",
            render: (row) => formatReportPercent(row.visibility),
          },
          {
            label: "SOV",
            align: "right",
            render: (row) => formatReportPercent(row.shareOfVoice),
          },
          {
            label: "Avg position",
            align: "right",
            render: (row) => formatReportNumber(row.position),
          },
        ]}
      />
      <CompactTable
        caption="Top cited pages"
        rows={model.topCitedPages.slice(0, 10)}
        rowKey={(row, index) => `${row.page}-${index}`}
        columns={[
          {
            label: "Page",
            render: (row) => (
              <div className="max-w-[360px] truncate" title={row.page}>
                {row.page}
                {row.domain ? (
                  <span className="block text-xs text-base-content/50">
                    {row.domain}
                  </span>
                ) : null}
              </div>
            ),
          },
          {
            label: "Citations",
            align: "right",
            render: (row) => formatReportNumber(row.citations, 0),
          },
          {
            label: "Mentions",
            align: "right",
            render: (row) => formatReportNumber(row.mentions, 0),
          },
        ]}
      />
      <CompactTable
        caption="Prompt movers"
        rows={model.promptMovers.slice(0, 10)}
        rowKey={(row, index) => `${row.prompt}-${index}`}
        columns={[
          {
            label: "Prompt",
            render: (row) => <span title={row.prompt}>{row.prompt}</span>,
          },
          { label: "Platform", render: (row) => formatPlatform(row.platform) },
          {
            label: "Previous",
            align: "right",
            render: (row) => formatReportNumber(row.previous),
          },
          {
            label: "Current",
            align: "right",
            render: (row) => formatReportNumber(row.current),
          },
          {
            label: "Change",
            align: "right",
            render: (row) => formatSigned(row.change),
          },
        ]}
      />
      <CompletenessNote value={model.completeness} />
    </ReportSectionCard>
  );
}

function ComparisonMetric({
  label,
  metric,
}: {
  label: string;
  metric: { current?: number; previous?: number };
}) {
  return (
    <Metric
      label={label}
      value={formatReportPercent(metric.current)}
      previous={previousPercent(metric.previous)}
    />
  );
}

function previousPercent(value: number | undefined): string | undefined {
  return value === undefined ? undefined : formatReportPercent(value);
}

function formatSigned(value: number | string | undefined | null): string {
  if (value === undefined || value === null) return "N/A";
  if (typeof value === "number") {
    return `${value > 0 ? "+" : ""}${formatReportNumber(value)}`;
  }
  return humanize(value);
}
