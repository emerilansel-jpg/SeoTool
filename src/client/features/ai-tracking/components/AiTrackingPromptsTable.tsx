// oxlint-disable max-lines-per-function
import { useMemo, useState } from "react";
import {
  CheckCircle2,
  Copy,
  Link2,
  Plus,
  Search,
  Sparkles,
  Swords,
  Trash2,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import type {
  AiTrackingPromptItem,
  ProfoundPromptDiagnostic,
} from "@/types/schemas/ai-tracking";

interface Props {
  prompts: AiTrackingPromptItem[];
  promptDiagnostics?: {
    winning: ProfoundPromptDiagnostic[];
    gaps: ProfoundPromptDiagnostic[];
  };
  onAddPrompts: (prompts: string[]) => Promise<void>;
  onTogglePrompt: (promptId: string, active: boolean) => Promise<void>;
  onRemovePrompt: (promptId: string) => Promise<void>;
  isAdding: boolean;
}

export function AiTrackingPromptsTable({
  prompts,
  promptDiagnostics,
  onAddPrompts,
  onTogglePrompt,
  onRemovePrompt,
  isAdding,
}: Props) {
  const [newPromptsText, setNewPromptsText] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<
    "all" | "winning" | "gaps" | "needs_citation"
  >("all");

  const diagMap = useMemo(() => {
    const map = new Map<string, ProfoundPromptDiagnostic>();
    if (promptDiagnostics) {
      for (const w of promptDiagnostics.winning) map.set(w.id, w);
      for (const g of promptDiagnostics.gaps) map.set(g.id, g);
    }
    return map;
  }, [promptDiagnostics]);

  const winningIds = useMemo(
    () => new Set(promptDiagnostics?.winning.map((p) => p.id) ?? []),
    [promptDiagnostics],
  );
  const gapIds = useMemo(
    () => new Set(promptDiagnostics?.gaps.map((p) => p.id) ?? []),
    [promptDiagnostics],
  );
  const needsCitationCount = useMemo(
    () =>
      promptDiagnostics?.winning.filter((p) => !p.hasDomainCitation).length ??
      0,
    [promptDiagnostics],
  );

  const filteredPrompts = useMemo(() => {
    let list = prompts;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((p) => p.prompt.toLowerCase().includes(q));
    }
    if (activeFilter === "winning") {
      list = list.filter((p) => winningIds.has(p.id));
    } else if (activeFilter === "gaps") {
      list = list.filter((p) => gapIds.has(p.id));
    } else if (activeFilter === "needs_citation") {
      list = list.filter((p) => {
        const diag = diagMap.get(p.id);
        return winningIds.has(p.id) && diag && !diag.hasDomainCitation;
      });
    }
    return list;
  }, [prompts, searchQuery, activeFilter, winningIds, gapIds, diagMap]);

  const handleCopyPrompts = () => {
    if (filteredPrompts.length === 0) return;
    const text = filteredPrompts.map((p) => p.prompt).join("\n");
    void navigator.clipboard.writeText(text);
    toast.success(`Copied ${filteredPrompts.length} prompts to clipboard`);
  };

  const handleAdd = async () => {
    const lines = newPromptsText
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length >= 2);
    if (lines.length === 0) return;
    await onAddPrompts(lines);
    setNewPromptsText("");
    setShowAddForm(false);
  };

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-base-300 bg-base-100 p-4 sm:p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="font-semibold text-base text-base-content flex items-center gap-2">
            Tracked AI Prompts
            <span className="badge badge-sm badge-outline text-[11px] font-medium text-base-content/60">
              Trackings.ai Diagnostics
            </span>
          </h3>
          <p className="text-xs text-base-content/60">
            Prompts monitored across AI assistants to track brand
            recommendations and competitor gaps.
          </p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {filteredPrompts.length > 0 && (
            <button
              type="button"
              className="btn btn-sm btn-ghost gap-1.5"
              onClick={handleCopyPrompts}
              title="Copy visible prompts to clipboard"
            >
              <Copy className="size-3.5" />
              Copy
            </button>
          )}
          <button
            type="button"
            className="btn btn-sm btn-outline gap-1.5 w-full sm:w-auto justify-center"
            onClick={() => setShowAddForm(!showAddForm)}
          >
            <Plus className="size-4" />
            Add Prompts
          </button>
        </div>
      </div>

      {/* Filter Tabs & Instant Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-1 border-t border-base-200">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            className={`btn btn-xs rounded-lg gap-1 ${
              activeFilter === "all" ? "btn-neutral" : "btn-ghost"
            }`}
            onClick={() => setActiveFilter("all")}
          >
            All Prompts
            <span className="badge badge-xs bg-base-100/30">
              {prompts.length}
            </span>
          </button>
          {promptDiagnostics && (
            <>
              <button
                type="button"
                className={`btn btn-xs rounded-lg gap-1 ${
                  activeFilter === "winning"
                    ? "btn-success btn-soft font-bold"
                    : "btn-ghost text-success"
                }`}
                onClick={() => setActiveFilter("winning")}
              >
                <Sparkles className="size-3" />
                Winning (Surfaced)
                <span className="badge badge-xs badge-success">
                  {promptDiagnostics.winning.length}
                </span>
              </button>
              <button
                type="button"
                className={`btn btn-xs rounded-lg gap-1 ${
                  activeFilter === "gaps"
                    ? "btn-warning btn-soft font-bold"
                    : "btn-ghost text-warning"
                }`}
                onClick={() => setActiveFilter("gaps")}
              >
                <Swords className="size-3" />
                Competitor Gaps
                <span className="badge badge-xs badge-warning">
                  {promptDiagnostics.gaps.length}
                </span>
              </button>
              <button
                type="button"
                className={`btn btn-xs rounded-lg gap-1 ${
                  activeFilter === "needs_citation"
                    ? "btn-info btn-soft font-bold"
                    : "btn-ghost text-info"
                }`}
                onClick={() => setActiveFilter("needs_citation")}
              >
                <Link2 className="size-3" />
                Needs Citations
                <span className="badge badge-xs badge-info">
                  {needsCitationCount}
                </span>
              </button>
            </>
          )}
        </div>

        <div className="relative w-full sm:w-60">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-base-content/40" />
          <input
            type="text"
            placeholder="Search prompts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input input-xs input-bordered w-full pl-8 text-xs"
          />
        </div>
      </div>

      {showAddForm && (
        <div className="rounded-lg border border-base-300 bg-base-200/50 p-4 space-y-3">
          <p className="text-xs font-medium text-base-content">
            Enter prompts to track (one prompt per line):
          </p>
          <textarea
            className="textarea textarea-bordered w-full text-xs font-mono"
            rows={4}
            placeholder={`Best CRM software for startups
Top project management tools
Zoho alternatives for small business`}
            value={newPromptsText}
            onChange={(e) => setNewPromptsText(e.target.value)}
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              className="btn btn-xs btn-ghost"
              onClick={() => setShowAddForm(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-xs btn-primary"
              disabled={isAdding || !newPromptsText.trim()}
              onClick={handleAdd}
            >
              {isAdding ? "Saving…" : "Save Prompts"}
            </button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="table table-sm w-full">
          <thead>
            <tr className="bg-base-200/50 text-base-content/60">
              <th>Active</th>
              <th className="min-w-[280px]">Prompt</th>
              <th>List Position</th>
              <th>Mentioned</th>
              <th>Sentiment</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPrompts.map((p) => {
              const diag = diagMap.get(p.id);

              return (
                <tr key={p.id} className="hover:bg-base-200/30">
                  <td className="align-top py-3">
                    <input
                      type="checkbox"
                      className="toggle toggle-xs toggle-primary"
                      checked={p.active}
                      onChange={(e) => onTogglePrompt(p.id, e.target.checked)}
                    />
                  </td>
                  <td className="font-medium text-xs text-base-content whitespace-normal break-words leading-relaxed py-3 min-w-[280px] select-text">
                    <div>{p.prompt}</div>
                    {/* Prompt Context / Competitors */}
                    {diag && diag.competitorsCited.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1 mt-1.5">
                        <span className="text-[10px] text-base-content/50 uppercase font-semibold">
                          Competitors:
                        </span>
                        {diag.competitorsCited.slice(0, 4).map((c) => (
                          <span
                            key={c}
                            className="badge badge-warning badge-soft badge-2xs font-mono text-[10px]"
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                    )}
                    {diag && diag.modelsSurfaced.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1 mt-1">
                        <span className="text-[10px] text-base-content/50 uppercase font-semibold">
                          Engines:
                        </span>
                        {diag.modelsSurfaced.map((m) => (
                          <span
                            key={m}
                            className="badge badge-neutral badge-soft badge-2xs font-mono text-[10px]"
                          >
                            {m.replace("_", "")}
                          </span>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="align-top py-3">
                    {p.lastPosition != null ? (
                      <span className="badge badge-sm badge-outline font-semibold">
                        #{p.lastPosition}
                      </span>
                    ) : (
                      <span className="text-xs text-base-content/40">—</span>
                    )}
                  </td>
                  <td className="align-top py-3">
                    {p.lastMentioned === true && (
                      <span className="inline-flex items-center gap-1 text-xs text-success font-medium">
                        <CheckCircle2 className="size-3.5" />
                        Yes
                      </span>
                    )}
                    {p.lastMentioned === false && (
                      <span className="inline-flex items-center gap-1 text-xs text-base-content/40 font-medium">
                        <XCircle className="size-3.5" />
                        No
                      </span>
                    )}
                    {p.lastMentioned == null && (
                      <span className="text-xs text-base-content/40">
                        Not checked
                      </span>
                    )}
                  </td>
                  <td className="align-top py-3">
                    {p.lastSentiment ? (
                      <span
                        className={`badge badge-xs ${
                          p.lastSentiment === "positive"
                            ? "badge-success"
                            : p.lastSentiment === "negative"
                              ? "badge-error"
                              : "badge-ghost"
                        }`}
                      >
                        {p.lastSentiment}
                      </span>
                    ) : (
                      <span className="text-xs text-base-content/40">—</span>
                    )}
                  </td>
                  <td className="text-right align-top py-3">
                    <button
                      type="button"
                      className="btn btn-ghost btn-xs text-error hover:bg-error/10"
                      title="Remove prompt"
                      onClick={() => onRemovePrompt(p.id)}
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </td>
                </tr>
              );
            })}
            {filteredPrompts.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="py-8 text-center text-sm text-base-content/50"
                >
                  {activeFilter === "winning"
                    ? "No winning prompts yet. Optimize content or run tracking to capture AI mentions."
                    : activeFilter === "gaps"
                      ? "No competitor gaps detected. You are winning on all checked queries!"
                      : activeFilter === "needs_citation"
                        ? "All winning prompts already have direct URL citations."
                        : "No prompts match the current search or filter."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
