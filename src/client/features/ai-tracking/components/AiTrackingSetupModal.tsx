import { useState } from "react";
import { Modal } from "@/client/components/Modal";
import type {
  AiTrackingPlatform,
  SaveAiTrackingConfigInput,
} from "@/types/schemas/ai-tracking";

interface Props {
  initialConfig: {
    brandName: string;
    domain: string;
    brandAliases: string[];
    platforms: AiTrackingPlatform[];
    schedule: "manual" | "daily" | "weekly";
    scheduleStatus: "idle" | "active" | "paused";
  } | null;
  onSave: (
    input: Omit<SaveAiTrackingConfigInput, "projectId">,
  ) => Promise<void>;
  onClose: () => void;
  isSaving: boolean;
}

const ALL_PLATFORMS: Array<{ id: AiTrackingPlatform; label: string }> = [
  { id: "chat_gpt", label: "ChatGPT" },
  { id: "gemini", label: "Gemini" },
  { id: "perplexity", label: "Perplexity" },
  { id: "claude", label: "Claude" },
];

export function AiTrackingSetupModal({
  initialConfig,
  onSave,
  onClose,
  isSaving,
}: Props) {
  const [brandName, setBrandName] = useState(initialConfig?.brandName ?? "");
  const [domain, setDomain] = useState(initialConfig?.domain ?? "");
  const [aliases, setAliases] = useState(
    initialConfig?.brandAliases?.join(", ") ?? "",
  );
  const [platforms, setPlatforms] = useState<AiTrackingPlatform[]>(
    initialConfig?.platforms?.length
      ? initialConfig.platforms
      : ["chat_gpt", "gemini", "perplexity"],
  );
  const [schedule, setSchedule] = useState<"manual" | "daily" | "weekly">(
    initialConfig?.schedule ?? "manual",
  );

  const togglePlatform = (p: AiTrackingPlatform) => {
    if (platforms.includes(p)) {
      if (platforms.length > 1) {
        setPlatforms(platforms.filter((x) => x !== p));
      }
    } else {
      setPlatforms([...platforms, p]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanAliases = aliases
      .split(",")
      .map((a) => a.trim())
      .filter(Boolean);

    await onSave({
      brandName: brandName.trim(),
      domain: domain.trim(),
      brandAliases: cleanAliases,
      platforms,
      schedule,
      scheduleStatus: schedule === "manual" ? "idle" : "active",
    });
  };

  return (
    <Modal maxWidth="max-w-lg" onClose={onClose} labelledBy="setup-title">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <h3 id="setup-title" className="text-xl font-bold tracking-tight text-base-content">
            {initialConfig ? "Edit AI Tracking Settings" : "Setup AI Tracking"}
          </h3>
          <p className="mt-1 text-xs text-base-content/60">
            Configure the brand and platforms you want to monitor in AI models.
          </p>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-base-content/80">Brand Name</label>
          <input
            type="text"
            className="input input-bordered input-sm rounded-xl w-full"
            placeholder="e.g. Zoho"
            value={brandName}
            onChange={(e) => setBrandName(e.target.value)}
            required
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-base-content/80">Domain</label>
          <input
            type="text"
            className="input input-bordered input-sm rounded-xl w-full"
            placeholder="e.g. zoho.com"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            required
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-base-content/80">
            Brand Aliases (comma separated)
          </label>
          <input
            type="text"
            className="input input-bordered input-sm rounded-xl w-full"
            placeholder="e.g. Zoho CRM, Zoho Suite"
            value={aliases}
            onChange={(e) => setAliases(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-base-content/80">
            Monitored Platforms
          </label>
          <div className="grid grid-cols-2 gap-2.5">
            {ALL_PLATFORMS.map((p) => {
              const checked = platforms.includes(p.id);
              return (
                <label
                  key={p.id}
                  className={`flex items-center gap-2.5 rounded-xl border p-2.5 text-xs cursor-pointer transition-all ${
                    checked
                      ? "border-primary/40 bg-primary/5 text-primary"
                      : "border-base-300/80 bg-base-100 hover:bg-base-200/50 text-base-content"
                  }`}
                >
                  <input
                    type="checkbox"
                    className="checkbox checkbox-xs checkbox-primary rounded"
                    checked={checked}
                    onChange={() => togglePlatform(p.id)}
                  />
                  <span className="font-semibold">{p.label}</span>
                </label>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-base-content/80">Check Schedule</label>
          <select
            className="select select-bordered select-sm rounded-xl text-xs w-full"
            value={schedule}
            onChange={(e) =>
              setSchedule(
                // oxlint-disable-next-line typescript/no-unsafe-type-assertion
                e.target.value as "manual" | "daily" | "weekly",
              )
            }
          >
            <option value="manual">Manual (On-demand only)</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
          </select>
        </div>

        <div className="modal-action pt-2">
          <button
            type="button"
            className="btn btn-sm btn-ghost rounded-xl"
            onClick={onClose}
            disabled={isSaving}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-sm btn-primary rounded-xl font-semibold shadow-xs"
            disabled={isSaving || !brandName.trim() || !domain.trim()}
          >
            {isSaving ? "Saving…" : "Save Configuration"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
