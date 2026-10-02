import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bot, CheckCircle2, Database, KeyRound, Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  getByokSettings,
  updateAiByok,
  updateDataForSeoByok,
} from "@/serverFunctions/byok";

const AI_PRESETS = [
  {
    id: "pesatrouter",
    name: "PesatRouter (OpenAI Compatible)",
    baseUrl: "https://api.pesatrouter.com/v1",
    defaultModel: "pesat-pro",
  },
  {
    id: "openai",
    name: "OpenAI Direct",
    baseUrl: "https://api.openai.com/v1",
    defaultModel: "gpt-4o-mini",
  },
  {
    id: "custom",
    name: "Claude / Custom Gateway",
    baseUrl: "",
    defaultModel: "claude-3-5-sonnet-20241022",
  },
] as const;

export function ByokSection() {
  const queryClient = useQueryClient();
  const { data: settings, isLoading } = useQuery({
    queryKey: ["byok-settings"],
    queryFn: () => getByokSettings(),
  });

  // DataForSEO state
  const [dfsKey, setDfsKey] = useState("");
  const [isEditingDfs, setIsEditingDfs] = useState(false);

  // AI Provider state
  const [aiProvider, setAiProvider] = useState<string>("pesatrouter");
  const [aiBaseUrl, setAiBaseUrl] = useState("");
  const [aiApiKey, setAiApiKey] = useState("");
  const [aiModel, setAiModel] = useState("");
  const [isEditingAi, setIsEditingAi] = useState(false);

  useEffect(() => {
    if (settings) {
      if (!isEditingAi) {
        setAiProvider(settings.aiProvider || "pesatrouter");
        setAiBaseUrl(settings.aiBaseUrl || "");
        setAiModel(settings.aiModel || "");
      }
    }
  }, [settings, isEditingAi]);

  const dfsMutation = useMutation({
    mutationFn: (apiKey: string | null) =>
      updateDataForSeoByok({ data: { apiKey } }),
    onSuccess: (updated) => {
      queryClient.setQueryData(["byok-settings"], updated);
      toast.success(
        updated.dataforseoConfigured
          ? "DataForSEO API key saved successfully."
          : "DataForSEO API key removed.",
      );
      setDfsKey("");
      setIsEditingDfs(false);
    },
    onError: () => toast.error("Failed to update DataForSEO key."),
  });

  const aiMutation = useMutation({
    mutationFn: (data: {
      provider: string;
      baseUrl?: string | null;
      apiKey: string | null;
      model?: string | null;
    }) => updateAiByok({ data }),
    onSuccess: (updated) => {
      queryClient.setQueryData(["byok-settings"], updated);
      toast.success(
        updated.aiConfigured
          ? "AI Provider configuration saved successfully."
          : "AI Provider configuration cleared.",
      );
      setAiApiKey("");
      setIsEditingAi(false);
    },
    onError: () => toast.error("Failed to update AI Provider configuration."),
  });

  function handlePresetChange(presetId: string) {
    setAiProvider(presetId);
    const preset = AI_PRESETS.find((p) => p.id === presetId);
    if (preset) {
      setAiBaseUrl(preset.baseUrl);
      setAiModel(preset.defaultModel);
    }
  }

  return (
    <section className="space-y-6 rounded-xl border border-base-300 bg-base-100 p-5 shadow-sm">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <KeyRound className="size-5 text-primary" />
          <h2 className="text-base font-semibold">BYOK Integrations (Bring Your Own Keys)</h2>
        </div>
        <p className="text-xs text-base-content/60">
          Store your own API keys once to unlock wholesale DataForSEO rates across all SEO tools
          and power Jet Agent with your own OpenAI or Claude compatible provider.
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-6">
          <span className="loading loading-spinner loading-md text-primary" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* DATAFORSEO CARD */}
          <div className="rounded-lg border border-base-300 p-4 space-y-3 bg-base-200/40">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="size-4 text-info" />
                <span className="text-sm font-medium">DataForSEO (Keywords, SERP, Backlinks, Audits)</span>
              </div>
              {settings?.dataforseoConfigured ? (
                <span className="badge badge-success badge-sm gap-1">
                  <CheckCircle2 className="size-3" /> Connected ({settings.dataforseoPrefix})
                </span>
              ) : (
                <span className="badge badge-ghost badge-sm text-base-content/60">Not Connected</span>
              )}
            </div>

            <p className="text-xs text-base-content/60">
              When connected, Keyword Research, KGR, Deep SERP, and Backlinks automatically use your
              DataForSEO account directly with zero platform markup.
            </p>

            {settings?.dataforseoConfigured && !isEditingDfs ? (
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-base-content/70">
                  Active Key: <code className="font-mono">{settings.dataforseoPrefix}</code>
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="btn btn-xs btn-outline"
                    onClick={() => setIsEditingDfs(true)}
                  >
                    Change Key
                  </button>
                  <button
                    type="button"
                    className="btn btn-xs btn-error btn-outline gap-1"
                    disabled={dfsMutation.isPending}
                    onClick={() => dfsMutation.mutate(null)}
                  >
                    <Trash2 className="size-3" /> Remove
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2 pt-1">
                <div className="flex gap-2">
                  <input
                    type="password"
                    autoComplete="off"
                    className="input input-bordered input-sm flex-1 font-mono text-xs"
                    value={dfsKey}
                    onChange={(e) => setDfsKey(e.target.value)}
                    placeholder="Enter DataForSEO login:password or Base64 string"
                  />
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    disabled={dfsMutation.isPending || dfsKey.trim().length < 8}
                    onClick={() => dfsMutation.mutate(dfsKey.trim())}
                  >
                    {dfsMutation.isPending ? "Saving…" : "Save Key"}
                  </button>
                  {isEditingDfs ? (
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={() => {
                        setIsEditingDfs(false);
                        setDfsKey("");
                      }}
                    >
                      Cancel
                    </button>
                  ) : null}
                </div>
                <p className="text-[11px] text-base-content/50">
                  You can find your API credentials in your DataForSEO dashboard under API Access.
                </p>
              </div>
            )}
          </div>

          {/* AI PROVIDER CARD (JET AGENT) */}
          <div className="rounded-lg border border-base-300 p-4 space-y-3 bg-base-200/40">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot className="size-4 text-primary" />
                <span className="text-sm font-medium">AI Provider (Jet Agent & SEO Intelligence)</span>
              </div>
              {settings?.aiConfigured ? (
                <span className="badge badge-success badge-sm gap-1">
                  <Sparkles className="size-3" /> Connected ({settings.aiModel || "Default Model"})
                </span>
              ) : (
                <span className="badge badge-ghost badge-sm text-base-content/60">Using System Default</span>
              )}
            </div>

            <p className="text-xs text-base-content/60">
              Configure your own LLM endpoint for Jet Agent. Fully compatible with OpenAI endpoints,
              Claude proxies, and gateways like <strong>PesatRouter</strong>.
            </p>

            {settings?.aiConfigured && !isEditingAi ? (
              <div className="space-y-2 pt-1 text-xs text-base-content/70">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-base-content/50">Provider:</span>{" "}
                    <strong className="capitalize">{settings.aiProvider}</strong>
                  </div>
                  <div>
                    <span className="text-base-content/50">Model:</span>{" "}
                    <code className="font-mono">{settings.aiModel || "Auto"}</code>
                  </div>
                  {settings.aiBaseUrl ? (
                    <div className="col-span-2 truncate">
                      <span className="text-base-content/50">Base URL:</span>{" "}
                      <code className="font-mono">{settings.aiBaseUrl}</code>
                    </div>
                  ) : null}
                  <div className="col-span-2">
                    <span className="text-base-content/50">API Key:</span>{" "}
                    <code className="font-mono">{settings.aiPrefix}</code>
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2 border-t border-base-300">
                  <button
                    type="button"
                    className="btn btn-xs btn-outline"
                    onClick={() => {
                      setIsEditingAi(true);
                      setAiApiKey("");
                    }}
                  >
                    Edit Configuration
                  </button>
                  <button
                    type="button"
                    className="btn btn-xs btn-error btn-outline gap-1"
                    disabled={aiMutation.isPending}
                    onClick={() =>
                      aiMutation.mutate({
                        provider: "pesatrouter",
                        baseUrl: null,
                        apiKey: null,
                        model: null,
                      })
                    }
                  >
                    <Trash2 className="size-3" /> Clear & Use System Default
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3 pt-1">
                {/* PRESET SELECTOR */}
                <div className="form-control">
                  <label className="label py-1">
                    <span className="label-text text-xs font-medium">Provider Type</span>
                  </label>
                  <select
                    className="select select-bordered select-sm w-full text-xs"
                    value={aiProvider}
                    onChange={(e) => handlePresetChange(e.target.value)}
                  >
                    {AI_PRESETS.map((preset) => (
                      <option key={preset.id} value={preset.id}>
                        {preset.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="form-control sm:col-span-2">
                    <label className="label py-1">
                      <span className="label-text text-xs font-medium">Base URL (OpenAI / Claude Compatible)</span>
                    </label>
                    <input
                      type="text"
                      className="input input-bordered input-sm font-mono text-xs"
                      value={aiBaseUrl}
                      onChange={(e) => setAiBaseUrl(e.target.value)}
                      placeholder="https://api.pesatrouter.com/v1"
                    />
                  </div>

                  <div className="form-control">
                    <label className="label py-1">
                      <span className="label-text text-xs font-medium">API Key</span>
                    </label>
                    <input
                      type="password"
                      autoComplete="off"
                      className="input input-bordered input-sm font-mono text-xs"
                      value={aiApiKey}
                      onChange={(e) => setAiApiKey(e.target.value)}
                      placeholder={settings?.aiConfigured ? "Keep existing key or enter new" : "sk-..."}
                    />
                  </div>

                  <div className="form-control">
                    <label className="label py-1">
                      <span className="label-text text-xs font-medium">Model ID</span>
                    </label>
                    <input
                      type="text"
                      className="input input-bordered input-sm font-mono text-xs"
                      value={aiModel}
                      onChange={(e) => setAiModel(e.target.value)}
                      placeholder="pesat-pro, gpt-4o-mini, claude-3-5-sonnet"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  {isEditingAi ? (
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={() => setIsEditingAi(false)}
                    >
                      Cancel
                    </button>
                  ) : null}
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    disabled={
                      aiMutation.isPending ||
                      (!settings?.aiConfigured && !aiApiKey.trim())
                    }
                    onClick={() =>
                      aiMutation.mutate({
                        provider: aiProvider,
                        baseUrl: aiBaseUrl.trim() || null,
                        apiKey: aiApiKey.trim() || null,
                        model: aiModel.trim() || null,
                      })
                    }
                  >
                    {aiMutation.isPending ? "Saving…" : "Save AI Provider"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
