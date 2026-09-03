import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  AlertTriangle,
  CheckCircle,
  FileCode,
  Globe,
  Info,
} from "lucide-react";
import { toast } from "sonner";
import { getStandardErrorMessage } from "@/client/lib/error-messages";
import { validateSitemapFn } from "@/serverFunctions/sitemap-validation";
import type { ValidationReport } from "@/server/lib/sitemap/sitemapTypes";
import { formatNumber } from "@/client/features/backlinks/backlinksPageUtils";

export function SitemapValidationView({ projectId }: { projectId: string }) {
  const [url, setUrl] = useState("");

  const mutation = useMutation({
    mutationFn: (sitemapUrl: string) =>
      validateSitemapFn({ data: { projectId, url: sitemapUrl } }),
    onError: (error) => {
      toast.error(getStandardErrorMessage(error, "Failed to validate sitemap"));
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = url.trim();
    if (!trimmed) return;
    mutation.mutate(trimmed);
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="flex gap-3">
        <div className="join flex-1">
          <div className="join-item flex items-center px-3 bg-base-200 border border-r-0 border-base-300 rounded-l-lg">
            <Globe className="size-4 text-base-content/50" />
          </div>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="example.com or https://example.com/sitemap.xml"
            className="input join-item input-bordered flex-1"
          />
        </div>
        <button
          type="submit"
          className={`btn btn-primary gap-2 ${mutation.isPending ? "loading" : ""}`}
          disabled={mutation.isPending || !url.trim()}
        >
          {mutation.isPending ? (
            <span className="loading loading-spinner loading-sm" />
          ) : (
            <FileCode className="size-4" />
          )}
          Validate
        </button>
      </form>

      {mutation.data ? (
        <ValidationReportView report={mutation.data} />
      ) : (
        <div className="rounded-2xl border border-dashed border-base-300 bg-base-100 p-8 text-center text-base-content/60 space-y-5">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary mx-auto">
            <FileCode className="size-7" />
          </div>
          <div className="space-y-1.5 max-w-md mx-auto">
            <p className="text-lg font-bold text-base-content">
              Enter a sitemap URL to validate
            </p>
            <p className="text-sm text-base-content/70 leading-relaxed">
              Verify XML format structure, detect broken URL links, uncover
              duplicate paths, and validate sitemap index trees.
            </p>
          </div>

          <div className="pt-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-base-content/50 mb-3">
              Sample sitemaps to test
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2 max-w-lg mx-auto">
              {[
                "https://github.com/sitemap.xml",
                "https://stripe.com/sitemap.xml",
                "https://vercel.com/sitemap.xml",
              ].map((sample) => (
                <button
                  key={sample}
                  type="button"
                  onClick={() => {
                    setUrl(sample);
                    mutation.mutate(sample);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-full border border-base-300 bg-base-200/60 px-3.5 py-1.5 text-xs font-medium text-base-content/80 transition-all duration-150 hover:border-primary/40 hover:bg-primary/10 hover:text-primary active:scale-95"
                >
                  <FileCode className="size-3 text-primary/70" />
                  {sample.replace("https://", "")}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function severityIcon(severity: "error" | "warning" | "info") {
  return severity === "error" ? (
    <AlertTriangle className="size-4 text-error" />
  ) : severity === "warning" ? (
    <AlertTriangle className="size-4 text-warning" />
  ) : (
    <Info className="size-4 text-info" />
  );
}

function ValidationReportView({ report }: { report: ValidationReport }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-px rounded-lg border border-base-300 bg-base-300/70 overflow-hidden">
        <SummaryCell
          label="Total URLs"
          value={formatNumber(report.totalUrls)}
          icon={<FileCode className="size-4 text-primary" />}
        />
        <SummaryCell
          label="Valid"
          value={formatNumber(report.validUrls)}
          icon={<CheckCircle className="size-4 text-success" />}
        />
        <SummaryCell
          label="Errors"
          value={formatNumber(report.errorCount)}
          icon={<AlertTriangle className="size-4 text-error" />}
        />
        <SummaryCell
          label="Warnings"
          value={formatNumber(report.warningCount)}
          icon={<AlertTriangle className="size-4 text-warning" />}
        />
      </div>

      {report.isSitemapIndex ? (
        <div className="alert alert-info">
          <Info className="size-4" />
          <span>
            Sitemap index detected with {report.childSitemaps} child sitemap(s).
          </span>
        </div>
      ) : null}

      {report.issues.length > 0 ? (
        <div className="card bg-base-100 border border-base-300">
          <div className="card-body p-0">
            <div className="px-4 py-3 border-b border-base-300">
              <h3 className="font-medium">Issues ({report.issues.length})</h3>
            </div>
            <div className="divide-y divide-base-300">
              {report.issues.map((issue, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 px-4 py-2.5 text-sm"
                >
                  {severityIcon(issue.severity)}
                  <div className="flex-1">
                    <span>{issue.message}</span>
                    {issue.url ? (
                      <span className="block text-xs text-base-content/50 mt-0.5 break-all">
                        {issue.url}
                      </span>
                    ) : null}
                  </div>
                  <span
                    className={`badge badge-xs ${
                      issue.severity === "error"
                        ? "badge-error"
                        : issue.severity === "warning"
                          ? "badge-warning"
                          : "badge-info"
                    }`}
                  >
                    {issue.severity}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="alert alert-success">
          <CheckCircle className="size-4" />
          <span>No issues found. Sitemap is valid.</span>
        </div>
      )}

      {report.urls.length > 0 ? (
        <div className="card bg-base-100 border border-base-300">
          <div className="card-body p-0">
            <div className="px-4 py-3 border-b border-base-300">
              <h3 className="font-medium">
                URLs (showing {Math.min(report.urls.length, 100)} of{" "}
                {report.totalUrls})
              </h3>
              {report.truncated ? (
                <p className="mt-1 text-xs text-warning">
                  Large sitemap detected. Showing first 100 URLs for
                  performance. Export to see all {report.totalUrls} URLs.
                </p>
              ) : null}
            </div>
            <div className="overflow-x-auto">
              <table className="table table-sm">
                <thead>
                  <tr>
                    <th>URL</th>
                    <th>Last Modified</th>
                    <th>Change Freq</th>
                    <th>Priority</th>
                  </tr>
                </thead>
                <tbody>
                  {report.urls.slice(0, 100).map((url, i) => (
                    <tr key={i} className="hover">
                      <td className="break-all max-w-md text-xs">{url.loc}</td>
                      <td className="text-xs whitespace-nowrap">
                        {url.lastmod ?? "-"}
                      </td>
                      <td className="text-xs">{url.changefreq ?? "-"}</td>
                      <td className="text-xs">{url.priority ?? "-"}</td>
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

function SummaryCell({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-base-100 px-4 py-3 flex items-center gap-3">
      {icon}
      <div>
        <p className="text-xs text-base-content/60">{label}</p>
        <p className="text-lg font-semibold">{value}</p>
      </div>
    </div>
  );
}
