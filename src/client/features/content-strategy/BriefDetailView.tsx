import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, Sparkles, ExternalLink, Link2 } from "lucide-react";
import {
  getContentBrief,
  generateBriefAi,
  updateContentBrief,
} from "@/serverFunctions/content-strategy";
import type { GeneratedBriefOutline } from "@/types/schemas/content-strategy";

interface BriefDataWithLinks extends GeneratedBriefOutline {
  suggestedInternalLinks?: string[];
}

export function BriefDetailView({
  projectId,
  briefId,
}: {
  projectId: string;
  briefId: string;
}) {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);

  const { data: brief, isLoading } = useQuery({
    queryKey: ["content_brief", briefId],
    queryFn: () => getContentBrief({ data: { id: briefId, projectId } }),
  });

  const generateMutation = useMutation({
    mutationFn: () => generateBriefAi({ data: { id: briefId, projectId } }),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["content_brief", briefId],
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (updates: Record<string, unknown>) =>
      updateContentBrief({
        data: { id: briefId, projectId, data: updates },
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["content_brief", briefId],
      });
      setIsEditing(false);
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <span className="loading loading-spinner loading-lg" />
      </div>
    );
  }

  if (!brief) {
    return (
      <div className="p-8 text-center">
        <p className="text-error">Brief not found.</p>
        <Link
          to="/p/$projectId/strategy"
          params={{ projectId }}
          className="link link-primary mt-4 inline-block"
        >
          Back to Strategy
        </Link>
      </div>
    );
  }

  // Parse the generated JSON
  let briefData: BriefDataWithLinks | null = null;
  if (brief.briefDataJson) {
    try {
      // oxlint-disable-next-line typescript-eslint/no-unsafe-type-assertion -- JSON.parse validated by BriefDataWithLinks
      briefData = JSON.parse(brief.briefDataJson) as BriefDataWithLinks;
    } catch {
      briefData = null;
    }
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <Link
          to="/p/$projectId/strategy"
          params={{ projectId }}
          className="btn btn-ghost btn-sm"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Strategy
        </Link>

        <div className="flex items-center gap-2">
          <button
            className="btn btn-primary btn-sm"
            onClick={() => generateMutation.mutate()}
            disabled={generateMutation.isPending}
          >
            <Sparkles className="w-4 h-4 mr-2" />
            {generateMutation.isPending
              ? "Generating..."
              : briefData
                ? "Regenerate Outline"
                : "Generate Outline via AI"}
          </button>
        </div>
      </div>

      {/* Mutation error display */}
      {generateMutation.isError && (
        <div className="alert alert-error mb-4 text-sm">
          <span>
            Failed to generate brief outline. Please check your AI quota or try
            again.
          </span>
        </div>
      )}

      {/* Brief metadata */}
      <div className="card bg-base-100 shadow mb-6">
        <div className="card-body">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              {isEditing ? (
                <BriefEditForm
                  brief={brief}
                  onSave={(data) => updateMutation.mutate(data)}
                  onCancel={() => setIsEditing(false)}
                  isSaving={updateMutation.isPending}
                />
              ) : (
                <>
                  <div className="badge badge-primary badge-outline mb-2">
                    {brief.status}
                  </div>
                  <h1 className="text-2xl font-bold">
                    {brief.title || brief.targetKeyword}
                  </h1>
                  <p className="text-base-content/60 mt-1">
                    Target Keyword:{" "}
                    <span className="font-mono">{brief.targetKeyword}</span>
                  </p>
                  {brief.targetUrl && (
                    <a
                      href={brief.targetUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="link link-primary text-sm mt-2 inline-flex items-center gap-1"
                    >
                      <ExternalLink className="w-3 h-3" /> {brief.targetUrl}
                    </a>
                  )}
                  <button
                    className="btn btn-ghost btn-xs mt-3"
                    onClick={() => setIsEditing(true)}
                  >
                    Edit Details
                  </button>
                </>
              )}
            </div>

            {brief.priorityScore !== null && (
              <div className="text-center shrink-0">
                <div className="text-3xl font-bold">{brief.priorityScore}</div>
                <div className="text-xs text-base-content/60">Priority</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Generated Outline */}
      {!briefData ? (
        <div className="card bg-base-200 border-2 border-dashed border-base-300">
          <div className="card-body items-center text-center py-12">
            <Sparkles className="w-10 h-10 text-base-content/30 mb-3" />
            <h3 className="font-semibold">No Outline Yet</h3>
            <p className="text-base-content/60 max-w-md">
              Click "Generate Outline via AI" to create a structured content
              brief including headings, meta tags, and internal linking
              suggestions.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Outline */}
          <div className="lg:col-span-2 card bg-base-100 shadow">
            <div className="card-body">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Content Outline</h2>
                {briefData.searchIntent && (
                  <span className="badge badge-info">
                    {briefData.searchIntent}
                  </span>
                )}
              </div>

              {briefData.metaDescription && (
                <div className="mb-4 p-3 bg-base-200 rounded text-sm">
                  <strong className="block mb-1">
                    Suggested Meta Description:
                  </strong>
                  {briefData.metaDescription}
                </div>
              )}

              {briefData.secondaryKeywords &&
                briefData.secondaryKeywords.length > 0 && (
                  <div className="mb-4">
                    <strong className="text-sm block mb-2">
                      Secondary Keywords:
                    </strong>
                    <div className="flex flex-wrap gap-1">
                      {briefData.secondaryKeywords.map((kw, i) => (
                        <span key={i} className="badge badge-outline badge-sm">
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

              <div className="divider my-2" />

              <div className="space-y-3">
                {briefData.outline?.map((section, i) => (
                  <div
                    key={i}
                    className={
                      section.level === "h3"
                        ? "ml-6 pl-3 border-l-2 border-base-300"
                        : ""
                    }
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono badge badge-ghost">
                        {section.level.toUpperCase()}
                      </span>
                      <span className="font-medium">{section.heading}</span>
                    </div>
                    {section.keyPoints && section.keyPoints.length > 0 && (
                      <ul className="mt-1 ml-8 list-disc text-sm text-base-content/70">
                        {section.keyPoints.map((pt, j) => (
                          <li key={j}>{pt}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar: Internal Links */}
          <div className="card bg-base-100 shadow">
            <div className="card-body">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Link2 className="w-5 h-5" /> Internal Links
              </h2>
              <p className="text-xs text-base-content/60 mb-4">
                Suggested pages from your existing site that are topically
                related.
              </p>

              {!briefData.suggestedInternalLinks ||
              briefData.suggestedInternalLinks.length === 0 ? (
                <p className="text-sm text-base-content/50 italic">
                  No matches found. Run a site audit with entity extraction
                  enabled to discover linking opportunities.
                </p>
              ) : (
                <div className="space-y-2">
                  {briefData.suggestedInternalLinks.map((url, i) => (
                    <a
                      key={i}
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-start gap-2 text-sm p-2 rounded hover:bg-base-200"
                    >
                      <ExternalLink className="w-3 h-3 mt-1 shrink-0 text-base-content/50" />
                      <span className="break-all">{url}</span>
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface BriefRow {
  targetKeyword: string;
  title: string | null;
  targetUrl: string | null;
  priorityScore: number | null;
}

function BriefEditForm({
  brief,
  onSave,
  onCancel,
  isSaving,
}: {
  brief: BriefRow;
  onSave: (data: Record<string, unknown>) => void;
  onCancel: () => void;
  isSaving: boolean;
}) {
  const [targetKeyword, setTargetKeyword] = useState(brief.targetKeyword);
  const [title, setTitle] = useState(brief.title ?? "");
  const [targetUrl, setTargetUrl] = useState(brief.targetUrl ?? "");
  const [priorityScore, setPriorityScore] = useState(
    brief.priorityScore?.toString() ?? "",
  );

  return (
    <div className="space-y-3">
      <label className="form-control">
        <span className="label-text mb-1">Target Keyword</span>
        <input
          className="input input-bordered input-sm"
          value={targetKeyword}
          onChange={(e) => setTargetKeyword(e.target.value)}
        />
      </label>
      <label className="form-control">
        <span className="label-text mb-1">Title</span>
        <input
          className="input input-bordered input-sm"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </label>
      <label className="form-control">
        <span className="label-text mb-1">Target URL</span>
        <input
          className="input input-bordered input-sm"
          value={targetUrl}
          onChange={(e) => setTargetUrl(e.target.value)}
          placeholder="https://..."
        />
      </label>
      <label className="form-control">
        <span className="label-text mb-1">Priority Score (0-100)</span>
        <input
          type="number"
          min={0}
          max={100}
          className="input input-bordered input-sm w-24"
          value={priorityScore}
          onChange={(e) => setPriorityScore(e.target.value)}
        />
      </label>
      <div className="flex gap-2">
        <button
          className="btn btn-primary btn-sm"
          disabled={isSaving}
          onClick={() =>
            onSave({
              targetKeyword,
              title: title || null,
              targetUrl: targetUrl || null,
              priorityScore: priorityScore ? parseInt(priorityScore) : null,
            })
          }
        >
          {isSaving ? "Saving..." : "Save"}
        </button>
        <button className="btn btn-ghost btn-sm" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
}
