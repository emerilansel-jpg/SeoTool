import { useState } from "react";
import {
  CheckCircle2,
  Plus,
  Sparkles,
  Swords,
  Trash2,
  XCircle,
} from "lucide-react";
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
  const [activeFilter, setActiveFilter] = useState<"all" | "winning" | "gaps">(
    "all",
  );

  const winningIds = new Set(promptDiagnostics?.winning.map((p) => p.id) ?? []);
  const gapIds = new Set(promptDiagnostics?.gaps.map((p) => p.id) ?? []);

  const filteredPrompts = prompts.filter((p) => {
    if (activeFilter === "winning") return winningIds.has(p.id);
    if (activeFilter === "gaps") return gapIds.has(p.id);
    return true;
  });

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
              Profound Diagnostics
            </span>
          </h3>
          <p className="text-xs text-base-content/60">
            Prompts monitored across AI assistants to track brand
            recommendations and competitor gaps.
          </p>
        </div>
        <button
          type="button"
          className="btn btn-sm btn-outline gap-1.5 w-full sm:w-auto justify-center"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          <Plus className="size-4" />
          Add Prompts
        </button>
      </div>

      {/* Profound Pillar 2: Win vs Gap Prompt Filter */}
      {promptDiagnostics && (
        <div className="flex flex-wrap items-center gap-1.5 border-b border-base-200 pb-2">
          <button
            type="button"
            className={`btn btn-xs rounded-lg gap-1 ${
              activeFilter === "all" ? "btn-primary" : "btn-ghost"
            }`}
            onClick={() => setActiveFilter("all")}
          >
            All Prompts
            <span className="badge badge-xs bg-base-100/30">
              {prompts.length}
            </span>
          </button>
          <button
            type="button"
            className={`btn btn-xs rounded-lg gap-1 ${
              activeFilter === "winning"
                ? "btn-success text-success-content"
                : "btn-ghost text-success"
            }`}
            onClick={() => setActiveFilter("winning")}
          >
            <Sparkles className="size-3" />
            Winning Prompts (Surfaced)
            <span className="badge badge-xs badge-success">
              {promptDiagnostics.winning.length}
            </span>
          </button>
          <button
            type="button"
            className={`btn btn-xs rounded-lg gap-1 ${
              activeFilter === "gaps"
                ? "btn-warning text-warning-content"
                : "btn-ghost text-warning"
            }`}
            onClick={() => setActiveFilter("gaps")}
          >
            <Swords className="size-3" />
            Gap Prompts (Failing to Surface)
            <span className="badge badge-xs badge-warning">
              {promptDiagnostics.gaps.length}
            </span>
          </button>
        </div>
      )}

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
              <th>Prompt</th>
              <th>List Position</th>
              <th>Mentioned</th>
              <th>Sentiment</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPrompts.map((p) => (
              <tr key={p.id} className="hover:bg-base-200/30">
                <td>
                  <input
                    type="checkbox"
                    className="toggle toggle-xs toggle-primary"
                    checked={p.active}
                    onChange={(e) => onTogglePrompt(p.id, e.target.checked)}
                  />
                </td>
                <td className="font-medium text-xs max-w-md truncate text-base-content">
                  {p.prompt}
                </td>
                <td>
                  {p.lastPosition != null ? (
                    <span className="badge badge-sm badge-outline font-semibold">
                      #{p.lastPosition}
                    </span>
                  ) : (
                    <span className="text-xs text-base-content/40">—</span>
                  )}
                </td>
                <td>
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
                <td>
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
                <td className="text-right">
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
            ))}
            {filteredPrompts.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="py-8 text-center text-sm text-base-content/50"
                >
                  {activeFilter === "winning"
                    ? "No winning prompts yet. Optimize content or run tracking to capture AI mentions."
                    : activeFilter === "gaps"
                      ? "No gap prompts! Your brand surfaces across all tracked prompts."
                      : 'No prompts configured yet. Click "Add Prompts" above to start tracking.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
