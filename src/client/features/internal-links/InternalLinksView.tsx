import { Fragment, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Download, Sparkles } from "lucide-react";
import { getStandardErrorMessage } from "@/client/lib/error-messages";
import {
  generateInternalLinkSuggestions,
  listInternalLinkSuggestions,
  setInternalLinkSuggestionStatus,
} from "@/serverFunctions/internal-links";

type SuggestionStatus = "pending" | "approved" | "rejected" | "applied" | "exported";
type StatusFilter = SuggestionStatus | "all";

type Suggestion = Awaited<
  ReturnType<typeof listInternalLinkSuggestions>
>[number];

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "applied", label: "Applied" },
  { value: "exported", label: "Exported" },
];

const STATUS_BADGE: Record<SuggestionStatus, string> = {
  pending: "badge-warning",
  approved: "badge-success",
  rejected: "badge-error",
  applied: "badge-info",
  exported: "badge-neutral",
};

export function InternalLinksView({ projectId }: { projectId: string }) {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const listQuery = useQuery({
    queryKey: ["internal_link_suggestions", projectId, statusFilter],
    queryFn: () =>
      listInternalLinkSuggestions({ data: { projectId, status: statusFilter } }),
  });

  const generateMutation = useMutation({
    mutationFn: () =>
      generateInternalLinkSuggestions({ data: { projectId } }),
    onSuccess: (result) => {
      toast.success(
        result.created === 0
          ? "No new suggestions (all pairs already suggested)"
          : `${result.created} new suggestions`,
      );
      void queryClient.invalidateQueries({
        queryKey: ["internal_link_suggestions", projectId],
      });
    },
    onError: (error) => {
      toast.error(getStandardErrorMessage(error, "Failed to generate suggestions"));
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({
      suggestionId,
      status,
    }: { suggestionId: string; status: SuggestionStatus }) =>
      setInternalLinkSuggestionStatus({ data: { projectId, suggestionId, status } }),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["internal_link_suggestions", projectId],
      });
    },
    onError: (error) => {
      toast.error(getStandardErrorMessage(error, "Failed to update suggestion"));
    },
  });

  const exportMutation = useMutation({
    mutationFn: async (approved: Suggestion[]) => {
      const csv = [
        "source_url,target_url,anchor_text,sentence",
        ...approved.map((row) =>
          [
            csvEscape(row.sourceUrl),
            csvEscape(row.targetUrl),
            csvEscape(row.anchorText),
            csvEscape(row.sentence),
          ].join(","),
        ),
      ].join("\n");
      downloadCsv(csv);
      await Promise.all(
        approved.map((row) =>
          setInternalLinkSuggestionStatus({
            data: { projectId, suggestionId: row.id, status: "exported" },
          }),
        ),
      );
      return approved.length;
    },
    onSuccess: (count) => {
      toast.success(`Exported ${count} suggestions to CSV`);
      void queryClient.invalidateQueries({
        queryKey: ["internal_link_suggestions", projectId],
      });
    },
    onError: (error) => {
      toast.error(getStandardErrorMessage(error, "Failed to export suggestions"));
    },
  });

  const suggestions = listQuery.data ?? [];
  const approvedRows = suggestions.filter((row) => row.status === "approved");

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          className="btn btn-primary gap-2"
          disabled={generateMutation.isPending}
          onClick={() => generateMutation.mutate()}
        >
          {generateMutation.isPending ? (
            <span className="loading loading-spinner loading-sm" />
          ) : (
            <Sparkles className="size-4" />
          )}
          Generate suggestions
        </button>
        <button
          type="button"
          className="btn btn-outline gap-2"
          disabled={approvedRows.length === 0 || exportMutation.isPending}
          onClick={() => exportMutation.mutate(approvedRows)}
        >
          {exportMutation.isPending ? (
            <span className="loading loading-spinner loading-sm" />
          ) : (
            <Download className="size-4" />
          )}
          Export CSV
          {approvedRows.length > 0 ? (
            <span className="badge badge-sm badge-success">
              {approvedRows.length}
            </span>
          ) : null}
        </button>
        <select
          className="select select-bordered select-sm"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
          aria-label="Filter by status"
        >
          {STATUS_FILTERS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <p className="text-xs text-base-content/50">
        Uses the latest completed Site Audit + GSC keywords ranking 4-20 + 1 LLM call
      </p>

      {listQuery.isLoading ? (
        <div className="flex justify-center py-12">
          <span className="loading loading-spinner loading-md" />
        </div>
      ) : suggestions.length === 0 ? (
        statusFilter === "all" ? (
          <EmptySuggestionsCard />
        ) : (
          <div className="card bg-base-100 border border-base-300">
            <div className="card-body items-center py-10 text-center">
              <p className="text-sm text-base-content/60">
                No suggestions with this status.
              </p>
            </div>
          </div>
        )
      ) : (
        <div className="space-y-3">
          {suggestions.map((row) => (
            <SuggestionRow
              key={row.id}
              suggestion={row}
              statusMutation={statusMutation}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function EmptySuggestionsCard() {
  return (
    <div className="card bg-base-100 border border-base-300">
      <div className="card-body items-center py-12 text-center">
        <Sparkles className="size-8 text-base-content/30" />
        <h3 className="mt-2 font-medium">No suggestions yet</h3>
        <p className="max-w-md text-sm text-base-content/60">
          Click "Generate suggestions" to create internal link opportunities. It
          matches quick-win keywords ranking 4-20 in Search Console against body
          text from your latest completed Site Audit, then drafts an anchor text
          and a ready-to-paste sentence for each pair.
        </p>
      </div>
    </div>
  );
}

function SuggestionRow({
  suggestion,
  statusMutation,
}: {
  suggestion: Suggestion;
  statusMutation: ReturnType<
    typeof useMutation<
      { ok: boolean },
      Error,
      { suggestionId: string; status: SuggestionStatus }
    >
  >;
}) {
  const isApproved = suggestion.status === "approved";
  const isRejected = suggestion.status === "rejected";
  const canModerate = suggestion.status === "pending" || isApproved;

  return (
    <div
      className={`card bg-base-100 border border-base-300 ${isRejected ? "opacity-60" : ""}`}
    >
      <div className="card-body gap-3 p-4">
        <div className="flex flex-wrap items-center gap-2">
          {suggestion.targetKeyword ? (
            <span className="badge badge-primary badge-sm badge-outline">
              {suggestion.targetKeyword}
            </span>
          ) : null}
          {suggestion.gscPosition ? (
            <span className="badge badge-sm badge-ghost">
              Pos {suggestion.gscPosition}
            </span>
          ) : null}
          <StatusBadge status={suggestion.status} />
        </div>

        <div className="flex flex-wrap items-center gap-1 text-sm">
          <a
            href={suggestion.sourceUrl}
            target="_blank"
            rel="noreferrer"
            className="link link-hover font-mono text-xs text-base-content/70"
            title={suggestion.sourceUrl}
          >
            {truncateMiddle(suggestion.sourceUrl)}
          </a>
          <span className="text-base-content/40">to</span>
          <a
            href={suggestion.targetUrl}
            target="_blank"
            rel="noreferrer"
            className="link link-hover font-mono text-xs text-primary"
            title={suggestion.targetUrl}
          >
            {truncateMiddle(suggestion.targetUrl)}
          </a>
        </div>

        <p className="text-sm">
          Anchor: <strong>{suggestion.anchorText}</strong>
        </p>

        <blockquote className="border-l-4 border-primary/40 bg-base-200/60 rounded-r-lg px-3 py-2 text-sm">
          <AnchorSentence sentence={suggestion.sentence} anchorText={suggestion.anchorText} />
        </blockquote>

        {suggestion.rationale ? (
          <p className="text-xs text-base-content/50">{suggestion.rationale}</p>
        ) : null}

        <div className="flex flex-wrap gap-2">
          {canModerate ? (
            <>
              <button
                type="button"
                className="btn btn-success btn-xs gap-1"
                disabled={statusMutation.isPending}
                onClick={() =>
                  statusMutation.mutate({
                    suggestionId: suggestion.id,
                    status: "approved",
                  })
                }
              >
                Approve
              </button>
              <button
                type="button"
                className="btn btn-ghost btn-xs"
                disabled={statusMutation.isPending}
                onClick={() =>
                  statusMutation.mutate({
                    suggestionId: suggestion.id,
                    status: "rejected",
                  })
                }
              >
                Reject
              </button>
            </>
          ) : null}
          {isApproved ? (
            <button
              type="button"
              className="btn btn-outline btn-xs gap-1"
              disabled={statusMutation.isPending}
              onClick={() =>
                statusMutation.mutate({
                  suggestionId: suggestion.id,
                  status: "applied",
                })
              }
            >
              Mark applied
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: SuggestionStatus }) {
  return (
    <span className={`badge badge-sm ${STATUS_BADGE[status]}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function AnchorSentence({
  sentence,
  anchorText,
}: {
  sentence: string;
  anchorText: string;
}) {
  if (!anchorText || !sentence.includes(anchorText)) {
    return <span>{sentence}</span>;
  }
  const parts = sentence.split(anchorText);
  return (
    <span>
      {parts.map((part, index) => (
        <Fragment key={index}>
          {part}
          {index < parts.length - 1 ? (
            <span className="bg-primary/20 rounded px-0.5 font-medium">
              {anchorText}
            </span>
          ) : null}
        </Fragment>
      ))}
    </span>
  );
}

function truncateMiddle(url: string, max = 64): string {
  if (url.length <= max) return url;
  const headSize = Math.ceil((max - 3) / 2);
  const tailSize = Math.floor((max - 3) / 2);
  return `${url.slice(0, headSize)}...${url.slice(url.length - tailSize)}`;
}

function csvEscape(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function downloadCsv(csv: string): void {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "internal-link-suggestions.csv";
  anchor.click();
  URL.revokeObjectURL(url);
}
