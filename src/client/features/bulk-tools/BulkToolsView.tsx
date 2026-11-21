// oxlint-disable max-lines, max-lines-per-function
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Copy, Download } from "lucide-react";
import { getStandardErrorMessage } from "@/client/lib/error-messages";
import {
  runBulkAutocomplete,
  runBulkKeywordMetrics,
  runBulkMetadataOptimizer,
  runBulkMentions,
  runBulkPaa,
} from "@/serverFunctions/bulk-tools";

type MetricsRow = Awaited<
  ReturnType<typeof runBulkKeywordMetrics>
>["rows"][number];
type GeoInput = { locationCode?: number; languageCode?: string };
type KeywordToolInput = { keywords: string[] } & GeoInput;
type TabId =
  | "metrics"
  | "intent"
  | "paa"
  | "autocomplete"
  | "mentions"
  | "metadata";

const MAX_KEYWORDS = 1000;
const MAX_LIST_KEYWORDS = 20;
const DEFAULT_LOCATION_CODE = "2840";
const DEFAULT_LANGUAGE_CODE = "en";
const CSV_HEADER = [
  "keyword",
  "volume",
  "cpc",
  "competition",
  "difficulty",
  "intent",
];
const INTENT_BADGES: Record<string, string> = {
  informational: "badge-info",
  commercial: "badge-warning",
  transactional: "badge-success",
};

const TABS: Array<{ id: TabId; label: string }> = [
  { id: "metrics", label: "Keyword Metrics" },
  { id: "intent", label: "Intent Check" },
  { id: "paa", label: "People Also Ask" },
  { id: "autocomplete", label: "Autocomplete" },
  { id: "mentions", label: "Mentions" },
  { id: "metadata", label: "Metadata Optimizer" },
];

export function BulkToolsView({ projectId }: { projectId: string }) {
  const [tab, setTab] = useState<TabId>("metrics");
  const [metricsText, setMetricsText] = useState("");
  const [paaText, setPaaText] = useState("");
  const [autocompleteText, setAutocompleteText] = useState("");
  const [mentionsText, setMentionsText] = useState("");
  const [locationCode, setLocationCode] = useState(DEFAULT_LOCATION_CODE);
  const [languageCode, setLanguageCode] = useState(DEFAULT_LANGUAGE_CODE);
  const [maxPages, setMaxPages] = useState("15");
  const [auditId, setAuditId] = useState("");

  const onBulkError = (fallback: string) => (error: unknown) =>
    toast.error(getStandardErrorMessage(error, fallback));

  const metricsMutation = useMutation({
    mutationFn: (input: KeywordToolInput) =>
      runBulkKeywordMetrics({ data: { projectId, ...input } }),
    onSuccess: (result) =>
      toast.success(`Metrics ready for ${result.rows.length} keywords.`),
    onError: onBulkError("Failed to fetch keyword metrics"),
  });
  const paaMutation = useMutation({
    mutationFn: (input: KeywordToolInput) =>
      runBulkPaa({ data: { projectId, ...input } }),
    onSuccess: () => toast.success("People Also Ask results ready."),
    onError: onBulkError("Failed to fetch People Also Ask"),
  });
  const autocompleteMutation = useMutation({
    mutationFn: (input: KeywordToolInput) =>
      runBulkAutocomplete({ data: { projectId, ...input } }),
    onSuccess: () => toast.success("Autocomplete suggestions ready."),
    onError: onBulkError("Failed to fetch autocomplete suggestions"),
  });
  const mentionsMutation = useMutation({
    mutationFn: (input: { terms: string[] } & GeoInput) =>
      runBulkMentions({ data: { projectId, ...input } }),
    onSuccess: () => toast.success("Mention results ready."),
    onError: onBulkError("Failed to fetch mention results"),
  });
  const metadataMutation = useMutation({
    mutationFn: (input: { maxPages: number; auditId?: string }) =>
      runBulkMetadataOptimizer({
        data: { projectId, maxPages: input.maxPages, auditId: input.auditId },
      }),
    onSuccess: () => toast.success("Metadata suggestions ready."),
    onError: onBulkError("Failed to optimize metadata"),
  });

  const parseGeo = (): GeoInput | null => {
    const loc = locationCode.trim();
    const lang = languageCode.trim();
    if (loc && !/^\d+$/.test(loc)) {
      toast.error("Location code must be a numeric code, e.g. 2840 for USA.");
      return null;
    }
    return {
      locationCode: loc ? Number(loc) : undefined,
      languageCode: lang || undefined,
    };
  };

  const runKeywordTool = (
    event: React.FormEvent,
    text: string,
    mutate: (input: KeywordToolInput) => void,
  ) => {
    event.preventDefault();
    const keywords = parseKeywordList(text, MAX_LIST_KEYWORDS, "keyword");
    const geo = parseGeo();
    if (!keywords || !geo) return;
    mutate({ keywords, ...geo });
  };

  const handleRunMetrics = (event: React.FormEvent) => {
    event.preventDefault();
    const keywords = parseKeywordList(metricsText, MAX_KEYWORDS, "keyword");
    const geo = parseGeo();
    if (!keywords || !geo) return;
    metricsMutation.mutate({ keywords, ...geo });
  };

  const handleRunMentions = (event: React.FormEvent) => {
    event.preventDefault();
    const terms = parseKeywordList(mentionsText, MAX_LIST_KEYWORDS, "term");
    const geo = parseGeo();
    if (!terms || !geo) return;
    mentionsMutation.mutate({ terms, ...geo });
  };

  const handleRunMetadata = (event: React.FormEvent) => {
    event.preventDefault();
    const pages = Number(maxPages);
    if (!Number.isInteger(pages) || pages < 1 || pages > 20) {
      toast.error("Max pages must be a whole number between 1 and 20.");
      return;
    }
    metadataMutation.mutate({ maxPages: pages, auditId: auditId.trim() });
  };

  const intentMode = tab === "intent";
  const metricsRows = metricsMutation.data?.rows ?? [];

  const geoInputs = (
    <GeoInputs
      locationCode={locationCode}
      languageCode={languageCode}
      onLocationChange={setLocationCode}
      onLanguageChange={setLanguageCode}
    />
  );

  const metricsForm = (
    <ToolFormCard
      onSubmit={handleRunMetrics}
      isPending={metricsMutation.isPending}
      label={intentMode ? "Run Intent Check" : "Run Keyword Metrics"}
    >
      <KeywordTextarea
        id={intentMode ? "bulk-intent-keywords" : "bulk-metrics-keywords"}
        label="Keywords"
        value={metricsText}
        onChange={setMetricsText}
        max={MAX_KEYWORDS}
        placeholder={"best seo tools for agencies\nlocal rank tracker"}
      />
      {geoInputs}
    </ToolFormCard>
  );

  return (
    <div className="space-y-6">
      <div role="tablist" className="tabs tabs-bordered">
        {TABS.map((entry) => (
          <button
            key={entry.id}
            type="button"
            role="tab"
            className={`tab ${tab === entry.id ? "tab-active" : ""}`}
            onClick={() => setTab(entry.id)}
          >
            {entry.label}
          </button>
        ))}
      </div>

      {tab === "metrics" || tab === "intent" ? (
        <section className="space-y-6">
          {metricsForm}
          {metricsMutation.data ? (
            intentMode ? (
              <PanelCard title={`Search Intent (${metricsRows.length})`}>
                {metricsRows.length === 0 ? (
                  <EmptyState message="No intent data returned for these keywords." />
                ) : (
                  <SimpleTable
                    headers={["Keyword", "Intent", "Foreign Intents"]}
                    rows={metricsRows.map((row) => [
                      keywordCell(row),
                      <StatBadge key="intent" intent={row.intent} />,
                      row.foreignIntent.join(", ") || "-",
                    ])}
                  />
                )}
              </PanelCard>
            ) : (
              <PanelCard
                title={`Keyword Metrics (${metricsRows.length})`}
                action={
                  <CsvButton
                    filename="keyword-metrics.csv"
                    header={CSV_HEADER}
                    rows={metricsRows.map(metricsCsvRow)}
                  />
                }
              >
                {metricsRows.length === 0 ? (
                  <EmptyState message="No metrics returned for these keywords." />
                ) : (
                  <SimpleTable
                    headers={[
                      "Keyword",
                      "Volume",
                      "CPC",
                      "Competition",
                      "Difficulty",
                      "Intent",
                    ]}
                    rows={metricsRows.map((row) => [
                      keywordCell(row),
                      fmtInt(row.searchVolume),
                      fmtCpc(row.cpc),
                      fmtCompetition(row.competition),
                      <span
                        key="kd"
                        className={difficultyClass(row.difficulty)}
                      >
                        {row.difficulty ?? "-"}
                      </span>,
                      <StatBadge key="intent" intent={row.intent} />,
                    ])}
                  />
                )}
              </PanelCard>
            )
          ) : null}
        </section>
      ) : null}

      {tab === "paa" ? (
        <section className="space-y-6">
          <ToolFormCard
            onSubmit={(event) =>
              runKeywordTool(event, paaText, paaMutation.mutate)
            }
            isPending={paaMutation.isPending}
            label="Run People Also Ask"
          >
            <KeywordTextarea
              id="bulk-paa-keywords"
              label="Keywords"
              value={paaText}
              onChange={setPaaText}
              max={MAX_LIST_KEYWORDS}
              placeholder={"rank tracking software\nseo reporting tools"}
            />
            {geoInputs}
          </ToolFormCard>
          {paaMutation.data?.map((item) => (
            <PanelCard key={item.keyword} title={item.keyword}>
              {item.questions.length === 0 ? (
                <EmptyState message="No questions found for this keyword." />
              ) : (
                <ul className="list-disc space-y-1 px-8 py-3 text-sm">
                  {item.questions.map((question) => (
                    <li key={question}>{question}</li>
                  ))}
                </ul>
              )}
            </PanelCard>
          ))}
        </section>
      ) : null}

      {tab === "autocomplete" ? (
        <section className="space-y-6">
          <ToolFormCard
            onSubmit={(event) =>
              runKeywordTool(
                event,
                autocompleteText,
                autocompleteMutation.mutate,
              )
            }
            isPending={autocompleteMutation.isPending}
            label="Run Autocomplete"
          >
            <KeywordTextarea
              id="bulk-autocomplete-keywords"
              label="Keywords"
              value={autocompleteText}
              onChange={setAutocompleteText}
              max={MAX_LIST_KEYWORDS}
              placeholder={"seo agency\nrank tracker"}
            />
            {geoInputs}
          </ToolFormCard>
          {autocompleteMutation.data?.map((item) => (
            <PanelCard key={item.keyword} title={item.keyword}>
              {item.suggestions.length === 0 ? (
                <EmptyState message="No suggestions found for this keyword." />
              ) : (
                <div className="flex flex-wrap gap-2 px-4 py-3">
                  {item.suggestions.map((suggestion) => (
                    <span
                      key={suggestion}
                      className="badge badge-outline badge-sm"
                    >
                      {suggestion}
                    </span>
                  ))}
                </div>
              )}
            </PanelCard>
          ))}
        </section>
      ) : null}

      {tab === "mentions" ? (
        <section className="space-y-6">
          <ToolFormCard
            onSubmit={handleRunMentions}
            isPending={mentionsMutation.isPending}
            label="Run Mentions"
          >
            <KeywordTextarea
              id="bulk-mentions-terms"
              label="Terms"
              value={mentionsText}
              onChange={setMentionsText}
              max={MAX_LIST_KEYWORDS}
              placeholder={"JetDigital SEO\nlocal rank tracker"}
              hint="Searches each term in quotes to find exact brand mentions."
            />
            {geoInputs}
          </ToolFormCard>
          {mentionsMutation.data?.map((item) => (
            <PanelCard
              key={item.term}
              title={item.term}
              action={
                item.resultCount !== null ? (
                  <span className="text-xs text-base-content/50">
                    {fmtInt(item.resultCount)} results
                  </span>
                ) : undefined
              }
            >
              {item.results.length === 0 ? (
                <EmptyState message="No results found for this term." />
              ) : (
                <ul className="divide-y divide-base-300">
                  {item.results.map((result, index) => (
                    <li key={index} className="px-4 py-2">
                      {result.url ? (
                        <a
                          href={result.url}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="link link-hover text-sm font-medium"
                        >
                          {result.title ?? result.url}
                        </a>
                      ) : (
                        <span className="text-sm font-medium">
                          {result.title ?? "(untitled)"}
                        </span>
                      )}
                      {result.description ? (
                        <p className="mt-0.5 text-xs text-base-content/60">
                          {truncate(result.description, 160)}
                        </p>
                      ) : null}
                    </li>
                  ))}
                </ul>
              )}
            </PanelCard>
          ))}
        </section>
      ) : null}

      {tab === "metadata" ? (
        <section className="space-y-6">
          <ToolFormCard
            onSubmit={handleRunMetadata}
            isPending={metadataMutation.isPending}
            label="Run Metadata Optimizer"
          >
            <p className="text-sm text-base-content/70">
              Rewrites page titles and meta descriptions using the latest
              completed Site Audit for this project plus an LLM. Uses no keyword
              credits, only LLM cost. Pick how many pages to optimize,
              optionally paste a specific audit ID, then run.
            </p>
            <div className="flex flex-wrap items-end gap-4">
              <label className="flex flex-col gap-1 text-sm">
                <span className="font-semibold">Max pages (1-20)</span>
                <input
                  type="number"
                  min={1}
                  max={20}
                  className="input input-bordered input-sm w-28"
                  value={maxPages}
                  onChange={(event) => setMaxPages(event.target.value)}
                />
              </label>
              <label className="flex min-w-64 grow flex-col gap-1 text-sm">
                <span className="font-semibold">
                  Audit ID (optional, defaults to the latest completed audit)
                </span>
                <input
                  className="input input-bordered input-sm"
                  value={auditId}
                  placeholder="Latest completed audit"
                  onChange={(event) => setAuditId(event.target.value)}
                />
              </label>
            </div>
          </ToolFormCard>
          {metadataMutation.data ? (
            <PanelCard
              title={`Metadata Suggestions (${metadataMutation.data.suggestions.length})`}
            >
              {metadataMutation.data.suggestions.length === 0 ? (
                <EmptyState message="No suggestions were generated for this audit." />
              ) : (
                <SimpleTable
                  headers={[
                    "URL",
                    "Suggested Title",
                    "Suggested Meta Description",
                    "Notes",
                  ]}
                  rows={metadataMutation.data.suggestions.map((suggestion) => [
                    <CopyableCell
                      key="url"
                      text={suggestion.url}
                      title="Copy URL"
                      mono
                    />,
                    <CopyableCell
                      key="title"
                      text={suggestion.suggestedTitle}
                      title="Copy title"
                    />,
                    <CopyableCell
                      key="meta"
                      text={suggestion.suggestedMetaDescription}
                      title="Copy meta"
                    />,
                    <CopyableCell
                      key="notes"
                      text={suggestion.notes}
                      title="Copy notes"
                    />,
                  ])}
                />
              )}
            </PanelCard>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}

function ToolFormCard({
  onSubmit,
  isPending,
  label,
  children,
}: {
  onSubmit: (event: React.FormEvent) => void;
  isPending: boolean;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <form
      onSubmit={onSubmit}
      className="space-y-3 rounded-2xl border border-base-300 bg-base-100 p-4 shadow-sm md:p-6"
    >
      {children}
      <button
        type="submit"
        className="btn btn-primary gap-2"
        disabled={isPending}
      >
        {isPending ? (
          <span className="loading loading-spinner loading-sm" />
        ) : null}
        {label}
      </button>
    </form>
  );
}

function KeywordTextarea({
  id,
  label,
  value,
  onChange,
  max,
  placeholder,
  hint,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  max: number;
  placeholder: string;
  hint?: string;
}) {
  const count = parseLines(value).length;
  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold" htmlFor={id}>
        {label}{" "}
        <span className="font-normal text-base-content/50">
          (one per line, max {max})
        </span>
      </label>
      <textarea
        id={id}
        className="textarea textarea-bordered min-h-36 w-full font-mono text-sm"
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
      <p className="text-xs text-base-content/50">
        {count}/{max} lines{hint ? `. ${hint}` : ""}
      </p>
    </div>
  );
}

function GeoInputs({
  locationCode,
  languageCode,
  onLocationChange,
  onLanguageChange,
}: {
  locationCode: string;
  languageCode: string;
  onLocationChange: (value: string) => void;
  onLanguageChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-wrap items-end gap-4">
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-semibold">Location code</span>
        <input
          className="input input-bordered input-sm w-40"
          value={locationCode}
          placeholder="2840 (USA)"
          inputMode="numeric"
          onChange={(event) => onLocationChange(event.target.value)}
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-semibold">Language code</span>
        <input
          className="input input-bordered input-sm w-40"
          value={languageCode}
          placeholder="en"
          onChange={(event) => onLanguageChange(event.target.value)}
        />
      </label>
      <p className="self-end pb-2 text-xs text-base-content/50">
        Optional. Defaults to USA (2840) and English (en).
      </p>
    </div>
  );
}

function PanelCard({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="card bg-base-100 border border-base-300">
      <div className="card-body p-0">
        <div className="flex items-center justify-between gap-2 border-b border-base-300 px-4 py-3">
          <h3 className="font-medium">{title}</h3>
          {action}
        </div>
        {children}
      </div>
    </div>
  );
}

function SimpleTable({
  headers,
  rows,
}: {
  headers: string[];
  rows: React.ReactNode[][];
}) {
  return (
    <div className="overflow-x-auto">
      <table className="table table-sm">
        <thead>
          <tr>
            {headers.map((header) => (
              <th key={header}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((cells, rowIndex) => (
            <tr key={rowIndex} className="hover">
              {cells.map((cell, cellIndex) => (
                <td key={cellIndex}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StatBadge({ intent }: { intent: string | null }) {
  if (!intent) return <span className="text-base-content/40">-</span>;
  const badgeClass = INTENT_BADGES[intent] ?? "badge-ghost";
  return <span className={`badge badge-sm ${badgeClass}`}>{intent}</span>;
}

function CopyableCell({
  text,
  title,
  mono,
}: {
  text: string | null;
  title: string;
  mono?: boolean;
}) {
  if (!text) return <span className="text-base-content/40">-</span>;
  const copy = () => {
    void navigator.clipboard
      .writeText(text)
      .then(() => toast.success("Copied to clipboard"))
      .catch(() => toast.error("Could not copy to clipboard"));
  };
  return (
    <span className="flex items-start justify-between gap-1">
      <span className={mono ? "break-all" : "whitespace-pre-wrap"}>{text}</span>
      <button
        type="button"
        className="btn btn-ghost btn-xs"
        title={title}
        onClick={copy}
      >
        <Copy className="size-3.5" />
      </button>
    </span>
  );
}

function escapeCsvCell(cell: string): string {
  return `"${cell.replace(/"/g, '""')}"`;
}

function CsvButton({
  filename,
  header,
  rows,
}: {
  filename: string;
  header: string[];
  rows: string[][];
}) {
  const download = () => {
    const csv = [header, ...rows]
      .map((cols) => cols.map(escapeCsvCell).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };
  return (
    <button
      type="button"
      className="btn btn-outline btn-sm gap-2"
      onClick={download}
    >
      <Download className="size-4" />
      Export CSV
    </button>
  );
}

function EmptyState({ message }: { message: string }) {
  return <p className="px-4 py-6 text-sm text-base-content/60">{message}</p>;
}

function parseLines(text: string): string[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

function parseKeywordList(
  text: string,
  max: number,
  noun: string,
): string[] | null {
  const items = parseLines(text);
  if (items.length === 0) {
    toast.error(`Enter at least one ${noun}.`);
    return null;
  }
  if (items.length > max) {
    toast.error(`Max ${max} ${noun}s per run.`);
    return null;
  }
  return items;
}

function truncate(text: string, max: number): string {
  return text.length > max ? `${text.slice(0, max - 1)}...` : text;
}

const numberFormat = new Intl.NumberFormat();
const fmtInt = (value: number | null) =>
  value === null ? "-" : numberFormat.format(value);
const fmtCpc = (value: number | null) =>
  value === null ? "-" : `$${value.toFixed(2)}`;
const fmtCompetition = (value: number | null) =>
  value === null ? "-" : value.toFixed(2);

function difficultyClass(difficulty: number | null): string {
  if (difficulty === null) return "";
  if (difficulty < 30) return "text-success";
  if (difficulty < 60) return "text-warning";
  return "text-error";
}

function keywordCell(row: MetricsRow) {
  return (
    <span key="kw" className="font-medium" title={row.keyword}>
      {row.keyword}
    </span>
  );
}

function metricsCsvRow(row: MetricsRow): string[] {
  return [
    row.keyword,
    row.searchVolume === null ? "" : String(row.searchVolume),
    row.cpc === null ? "" : String(row.cpc),
    row.competition === null ? "" : String(row.competition),
    row.difficulty === null ? "" : String(row.difficulty),
    row.intent ?? "",
  ];
}
