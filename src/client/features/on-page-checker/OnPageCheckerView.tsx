import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { FileCheck, Globe } from "lucide-react";
import { toast } from "sonner";
import { getStandardErrorMessage } from "@/client/lib/error-messages";
import { checkOnPageSeoFn } from "@/serverFunctions/on-page-checker";
import type {
  OnPageCategoryScore,
  OnPageReport,
} from "@/server/features/on-page-checker/services/onPageTypes";

export function OnPageCheckerView({ projectId }: { projectId: string }) {
  const [url, setUrl] = useState("");

  const mutation = useMutation({
    mutationFn: (pageUrl: string) =>
      checkOnPageSeoFn({ data: { projectId, url: pageUrl } }),
    onError: (error) => {
      toast.error(getStandardErrorMessage(error, "Failed to analyze page"));
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
            placeholder="https://example.com/page"
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
            <FileCheck className="size-4" />
          )}
          Analyze
        </button>
      </form>

      {mutation.data ? <OnPageReportView report={mutation.data} /> : null}
    </div>
  );
}

function OnPageReportView({ report }: { report: OnPageReport }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-6">
        <ScoreGauge score={report.overallScore} grade={report.grade} />
        <div>
          <h3 className="text-lg font-semibold">{report.url}</h3>
          <p className="text-sm text-base-content/60">
            {report.statusCode ? `HTTP ${report.statusCode}` : "No response"}
            {report.wordCount ? ` · ${report.wordCount} words` : ""}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {report.categories.map((cat) => (
          <CategoryCard key={cat.category} category={cat} />
        ))}
      </div>

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
                  <span
                    className={`badge badge-xs mt-1 ${
                      issue.severity === "error"
                        ? "badge-error"
                        : issue.severity === "warning"
                          ? "badge-warning"
                          : "badge-info"
                    }`}
                  />
                  <div className="flex-1">
                    <span className="font-medium capitalize">
                      {issue.category}
                    </span>
                    <span className="mx-1.5 text-base-content/40">·</span>
                    <span>{issue.message}</span>
                    {issue.details ? (
                      <p className="mt-1 text-xs text-base-content/50 break-all">
                        {issue.details}
                      </p>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="alert alert-success">
          <span>No issues found. Great job!</span>
        </div>
      )}
    </div>
  );
}

function ScoreGauge({ score, grade }: { score: number; grade: string }) {
  const color =
    score >= 90 ? "text-success" : score >= 70 ? "text-warning" : "text-error";

  return (
    <div className="flex flex-col items-center justify-center w-24 h-24 rounded-full border-4 border-base-300">
      <span className={`text-2xl font-bold ${color}`}>{grade}</span>
      <span className="text-xs text-base-content/60">{score}/100</span>
    </div>
  );
}

function CategoryCard({ category }: { category: OnPageCategoryScore }) {
  const color =
    category.score >= 80
      ? "border-success"
      : category.score >= 60
        ? "border-warning"
        : "border-error";
  const gradeColor =
    category.score >= 80
      ? "text-success"
      : category.score >= 60
        ? "text-warning"
        : "text-error";

  return (
    <div className={`card bg-base-100 border ${color} border-l-4`}>
      <div className="card-body p-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">{category.category}</span>
          <span className={`text-lg font-bold ${gradeColor}`}>
            {category.grade}
          </span>
        </div>
        <div className="text-xs text-base-content/60">
          {category.issues.length === 0
            ? "No issues"
            : `${category.issues.length} issue${category.issues.length > 1 ? "s" : ""}`}
        </div>
      </div>
    </div>
  );
}
