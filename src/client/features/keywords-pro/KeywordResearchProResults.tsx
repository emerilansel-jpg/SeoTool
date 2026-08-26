import { Download, Sparkles } from "lucide-react";
import type { KeywordResearchProResult } from "@/shared/keyword-research-pro";

function number(value: number | null, maximumFractionDigits = 0) {
  return value == null
    ? "—"
    : new Intl.NumberFormat(undefined, { maximumFractionDigits }).format(value);
}

function scoreClass(score: number) {
  if (score >= 75) return "text-success";
  if (score >= 60) return "text-primary";
  if (score >= 45) return "text-warning";
  return "text-error";
}

export function ResearchResults({
  result,
}: {
  result: KeywordResearchProResult;
}) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Opportunity report</h2>
          <p className="text-xs text-base-content/60">
            Higher scores mean an easier organic opportunity. KGR is most useful
            on keywords with volume up to 250.
          </p>
        </div>
        <button className="btn btn-sm" onClick={() => exportCsv(result)}>
          <Download className="size-4" /> Export CSV
        </button>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-base-300 bg-base-100">
        <table className="table table-sm">
          <thead>
            <tr>
              <th>Keyword</th>
              <th className="text-right">Volume</th>
              <th className="text-right">KGR</th>
              <th className="text-right">Allintitle</th>
              <th className="text-right">Weak SERP</th>
              <th className="text-right">Content</th>
              <th className="text-right">Links</th>
              <th className="text-right">Total</th>
              <th>Opportunity</th>
            </tr>
          </thead>
          <tbody>
            {result.rows.map((row) => (
              <tr key={row.keyword}>
                <td className="min-w-64">
                  <details>
                    <summary className="cursor-pointer font-medium">
                      {row.keyword}
                    </summary>
                    <CompetitorDetails row={row} />
                  </details>
                </td>
                <td className="text-right">{number(row.searchVolume)}</td>
                <td className="text-right font-mono">
                  {row.kgr == null ? "—" : number(row.kgr, 3)}
                </td>
                <td className="text-right">{number(row.allintitleCount)}</td>
                <td className="text-right">{row.weakSerpCount}/10</td>
                <td className="text-right font-semibold">{row.contentScore}</td>
                <td className="text-right font-semibold">
                  {row.linkScore ?? "—"}
                </td>
                <td
                  className={`text-right text-base font-bold ${scoreClass(row.totalScore)}`}
                >
                  {row.totalScore}
                </td>
                <td>
                  <span className="badge badge-outline whitespace-nowrap">
                    {row.opportunity}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="alert text-xs">
        <Sparkles className="size-4" />
        <span>
          “Trust proxy” is SeoTool's transparent rank/spam indicator—not
          Majestic Trust Flow. We do not relabel unavailable third-party
          metrics.
        </span>
      </div>
    </div>
  );
}

function CompetitorDetails({
  row,
}: {
  row: KeywordResearchProResult["rows"][number];
}) {
  return (
    <div className="mt-3 min-w-[760px] rounded-xl bg-base-200/60 p-3 text-xs">
      <div className="mb-2 grid grid-cols-4 gap-2 text-base-content/70">
        <span>Title matches: {row.titleMatches}/10</span>
        <span>Median page rank: {number(row.medianPageRank, 1)}</span>
        <span>Median domain rank: {number(row.medianDomainRank, 1)}</span>
        <span>
          Median referring domains: {number(row.medianReferringDomains, 1)}
        </span>
      </div>
      <table className="table table-xs">
        <thead>
          <tr>
            <th>#</th>
            <th>Ranking page</th>
            <th>Title match</th>
            <th>PR</th>
            <th>DR</th>
            <th>Ref. domains</th>
            <th>Spam</th>
            <th>Trust proxy</th>
          </tr>
        </thead>
        <tbody>
          {row.competitors.map((competitor) => (
            <tr
              key={`${competitor.position}-${competitor.url ?? competitor.domain}`}
            >
              <td>{competitor.position}</td>
              <td
                className="max-w-80 truncate"
                title={competitor.title ?? competitor.url ?? ""}
              >
                {competitor.domain ?? competitor.url ?? "Unknown"}
              </td>
              <td>{competitor.exactTitleMatch ? "Exact" : "Gap"}</td>
              <td>{number(competitor.pageRank)}</td>
              <td>{number(competitor.domainRank)}</td>
              <td>{number(competitor.referringDomains)}</td>
              <td>{number(competitor.spamScore)}</td>
              <td>{number(competitor.trustProxy)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function csvQuote(value: string | number | null | undefined) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

function exportCsv(result: KeywordResearchProResult) {
  const headers = [
    "Keyword",
    "Volume",
    "CPC",
    "KD",
    "Intent",
    "Allintitle",
    "KGR",
    "Title Matches",
    "Weak SERP",
    "Content Score",
    "Link Score",
    "Total Score",
    "Opportunity",
  ];
  const lines = result.rows.map((row) =>
    [
      row.keyword,
      row.searchVolume,
      row.cpc,
      row.keywordDifficulty,
      row.intent,
      row.allintitleCount,
      row.kgr,
      row.titleMatches,
      row.weakSerpCount,
      row.contentScore,
      row.linkScore,
      row.totalScore,
      row.opportunity,
    ]
      .map(csvQuote)
      .join(","),
  );
  const url = URL.createObjectURL(
    new Blob([[headers.join(","), ...lines].join("\n")], {
      type: "text/csv;charset=utf-8",
    }),
  );
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "keyword-research-pro.csv";
  anchor.click();
  URL.revokeObjectURL(url);
}
