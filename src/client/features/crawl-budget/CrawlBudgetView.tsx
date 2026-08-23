import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Upload } from "lucide-react";
import { getStandardErrorMessage } from "@/client/lib/error-messages";
import { analyzeCrawlBudgetFn } from "@/serverFunctions/crawl-budget";
import type { CrawlBudgetReport } from "@/server/lib/log-parser/logParserTypes";

export function CrawlBudgetView({ projectId }: { projectId: string }) {
  const [logText, setLogText] = useState("");

  const mutation = useMutation({
    mutationFn: (text: string) =>
      analyzeCrawlBudgetFn({ data: { projectId, logText: text } }),
    onError: (error) => {
      toast.error(getStandardErrorMessage(error, "Failed to analyze logs"));
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!logText.trim()) return;
    mutation.mutate(logText);
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-3">
        <textarea
          value={logText}
          onChange={(e) => setLogText(e.target.value)}
          placeholder="Paste Apache/Nginx access log content here..."
          className="textarea textarea-bordered w-full h-48 font-mono text-xs"
        />
        <div className="flex items-center gap-3">
          <button
            type="submit"
            className={`btn btn-primary gap-2 ${mutation.isPending ? "loading" : ""}`}
            disabled={mutation.isPending || !logText.trim()}
          >
            {mutation.isPending ? (
              <span className="loading loading-spinner loading-sm" />
            ) : (
              <Upload className="size-4" />
            )}
            Analyze Logs
          </button>
          <span className="text-xs text-base-content/50">
            Supports Apache Combined and Nginx default log formats
          </span>
        </div>
      </form>

      {mutation.data ? <CrawlBudgetReportView report={mutation.data} /> : null}
    </div>
  );
}

const fmt = (n: number) => new Intl.NumberFormat().format(n);

function CrawlBudgetReportView({ report }: { report: CrawlBudgetReport }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-px rounded-lg border border-base-300 bg-base-300/70 overflow-hidden">
        <StatCell label="Total Requests" value={fmt(report.totalRequests)} />
        <StatCell label="Bot Requests" value={fmt(report.totalBotRequests)} />
        <StatCell label="Bot Ratio" value={`${report.botRatio}%`} />
        <StatCell
          label="Wasted (4xx+5xx)"
          value={fmt(
            report.wastedCrawlBudget.total4xx +
              report.wastedCrawlBudget.total5xx,
          )}
        />
      </div>

      {report.botTypes.length > 0 ? (
        <div className="card bg-base-100 border border-base-300">
          <div className="card-body p-0">
            <div className="px-4 py-3 border-b border-base-300">
              <h3 className="font-medium">Bot Types</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="table table-sm">
                <thead>
                  <tr>
                    <th>Bot</th>
                    <th>Requests</th>
                    <th>%</th>
                  </tr>
                </thead>
                <tbody>
                  {report.botTypes.map((bot) => (
                    <tr key={bot.name} className="hover">
                      <td className="font-medium">{bot.name}</td>
                      <td>{fmt(bot.requests)}</td>
                      <td>{bot.percentage}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : null}

      {report.topCrawledUrls.length > 0 ? (
        <div className="card bg-base-100 border border-base-300">
          <div className="card-body p-0">
            <div className="px-4 py-3 border-b border-base-300">
              <h3 className="font-medium">Most Crawled URLs</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="table table-sm">
                <thead>
                  <tr>
                    <th>URL</th>
                    <th>Requests</th>
                    <th>Status Codes</th>
                  </tr>
                </thead>
                <tbody>
                  {report.topCrawledUrls.map((url) => (
                    <tr key={url.url} className="hover">
                      <td className="text-xs break-all max-w-md">{url.url}</td>
                      <td>{fmt(url.requests)}</td>
                      <td className="text-xs">
                        {Object.entries(url.statusCodes)
                          .map(([code, count]) => `${code}:${count}`)
                          .join(", ")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : null}

      {Object.keys(report.statusDistribution).length > 0 ? (
        <div className="card bg-base-100 border border-base-300">
          <div className="card-body p-0">
            <div className="px-4 py-3 border-b border-base-300">
              <h3 className="font-medium">Status Code Distribution</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="table table-sm">
                <thead>
                  <tr>
                    <th>Status Code</th>
                    <th>Count</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(report.statusDistribution)
                    .toSorted(([, a], [, b]) => b - a)
                    .map(([code, count]) => (
                      <tr key={code} className="hover">
                        <td>
                          <span
                            className={`badge badge-sm ${
                              code.startsWith("2")
                                ? "badge-success"
                                : code.startsWith("3")
                                  ? "badge-info"
                                  : code.startsWith("4")
                                    ? "badge-warning"
                                    : "badge-error"
                            }`}
                          >
                            {code}
                          </span>
                        </td>
                        <td>{fmt(count)}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function StatCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-base-100 px-4 py-3">
      <p className="text-xs text-base-content/60">{label}</p>
      <p className="text-lg font-semibold">{value}</p>
    </div>
  );
}
