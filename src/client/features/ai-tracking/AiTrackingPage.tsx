// oxlint-disable max-lines-per-function
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import {
  BarChart2,
  Bot,
  CheckCircle2,
  Compass,
  Globe,
  LayoutDashboard,
  Link2,
  Play,
  Settings2,
  Users,
  Sparkles,
} from "lucide-react";
import {
  addAiTrackingPrompts,
  getAiTrackingDashboard,
  removeAiTrackingPrompt,
  runAiTracking,
  saveAiTrackingConfig,
  toggleAiTrackingPrompt,
} from "@/serverFunctions/ai-tracking";
import { AiTrackingKpiCards } from "./components/AiTrackingKpiCards";
import { AiTrackingPositionCard } from "./components/AiTrackingPositionCard";
import { AiTrackingSentimentCard } from "./components/AiTrackingSentimentCard";
import { AiTrackingPromptsTable } from "./components/AiTrackingPromptsTable";
import { AiTrackingObservationsTable } from "./components/AiTrackingObservationsTable";
import { AiTrackingSetupModal } from "./components/AiTrackingSetupModal";
import { AiDiscoveredPromptsTab } from "./components/AiDiscoveredPromptsTab";
import { AiCitationsTab } from "./components/AiCitationsTab";
import { AiPagesTab } from "./components/AiPagesTab";
import { AiCompetitorsTab } from "./components/AiCompetitorsTab";
import { AiGscCorrelationTab } from "./components/AiGscCorrelationTab";
import { getStandardErrorMessage } from "@/client/lib/error-messages";
import type { SaveAiTrackingConfigInput } from "@/types/schemas/ai-tracking";

interface Props {
  projectId: string;
}

type TabType =
  | "overview"
  | "ai_prompts"
  | "tracked_prompts"
  | "citations"
  | "pages"
  | "competitors"
  | "gsc";

export function AiTrackingPage({ projectId }: Props) {
  const queryClient = useQueryClient();
  const [selectedPlatform, setSelectedPlatform] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [showSetupModal, setShowSetupModal] = useState(false);

  const getDashboardFn = useServerFn(getAiTrackingDashboard);
  const saveConfigFn = useServerFn(saveAiTrackingConfig);
  const addPromptsFn = useServerFn(addAiTrackingPrompts);
  const togglePromptFn = useServerFn(toggleAiTrackingPrompt);
  const removePromptFn = useServerFn(removeAiTrackingPrompt);
  const runTrackingFn = useServerFn(runAiTracking);

  const { data, isLoading } = useQuery({
    queryKey: ["ai-tracking", projectId, "dashboard", selectedPlatform],
    queryFn: () =>
      getDashboardFn({
        data: { projectId, platform: selectedPlatform, days: 30 },
      }),
  });

  const invalidate = () =>
    queryClient.invalidateQueries({
      queryKey: ["ai-tracking", projectId],
    });

  const saveConfigMutation = useMutation({
    mutationFn: (input: Omit<SaveAiTrackingConfigInput, "projectId">) =>
      saveConfigFn({ data: { ...input, projectId } }),
    onSuccess: () => {
      toast.success("AI Tracking configuration saved.");
      setShowSetupModal(false);
      void invalidate();
    },
    onError: (error) => {
      toast.error(getStandardErrorMessage(error, "Could not save settings."));
    },
  });

  const addPromptsMutation = useMutation({
    mutationFn: (prompts: string[]) =>
      addPromptsFn({ data: { projectId, prompts } }),
    onSuccess: () => {
      toast.success("Prompts added successfully.");
      void invalidate();
    },
    onError: (error) => {
      toast.error(getStandardErrorMessage(error, "Could not add prompts."));
    },
  });

  const togglePromptMutation = useMutation({
    mutationFn: ({ promptId, active }: { promptId: string; active: boolean }) =>
      togglePromptFn({ data: { projectId, promptId, active } }),
    onSuccess: () => {
      void invalidate();
    },
    onError: (error) => {
      toast.error(getStandardErrorMessage(error, "Could not toggle prompt."));
    },
  });

  const removePromptMutation = useMutation({
    mutationFn: (promptId: string) =>
      removePromptFn({ data: { projectId, promptId } }),
    onSuccess: () => {
      toast.success("Prompt removed.");
      void invalidate();
    },
    onError: (error) => {
      toast.error(getStandardErrorMessage(error, "Could not remove prompt."));
    },
  });

  const runTrackingMutation = useMutation({
    mutationFn: () => runTrackingFn({ data: { projectId } }),
    onSuccess: (res) => {
      toast.success(
        `AI Tracking check complete (${res.promptsCompleted} responses collected).`,
      );
      void invalidate();
    },
    onError: (error) => {
      toast.error(getStandardErrorMessage(error, "AI Tracking run failed."));
    },
  });

  if (isLoading || !data) {
    return (
      <div className="p-6 space-y-6" aria-busy="true">
        <div className="skeleton h-10 w-64 rounded-lg" />
        <div className="skeleton h-32 rounded-xl" />
        <div className="skeleton h-72 rounded-xl" />
      </div>
    );
  }

  const { config } = data;
  const isConfigured = Boolean(config);

  const TABS: Array<{
    id: TabType;
    label: string;
    icon: typeof Bot;
    badge?: string | number;
  }> = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    {
      id: "ai_prompts",
      label: "AI Prompts",
      icon: Compass,
      badge: data.discoveryStats?.totalDiscovered
        ? data.discoveryStats.totalDiscovered
        : undefined,
    },
    {
      id: "tracked_prompts",
      label: "Tracked Prompts",
      icon: CheckCircle2,
      badge: data.prompts.length > 0 ? data.prompts.length : undefined,
    },
    { id: "citations", label: "Citations", icon: Link2 },
    { id: "pages", label: "Pages", icon: Globe },
    { id: "competitors", label: "Competitors", icon: Users },
    { id: "gsc", label: "GSC AI Performance", icon: BarChart2 },
  ];

  return (
    <div className="p-3.5 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-3.5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Bot className="size-5 sm:size-6 text-primary shrink-0" />
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-base-content">
              AI Generatif
            </h1>
            <span className="badge badge-primary badge-sm font-semibold">
              AI Visibility &amp; Mention Tracking
            </span>
          </div>
          <p className="mt-1 text-xs text-base-content/60 leading-relaxed max-w-2xl">
            Monitor brand visibility, organic prompts, citations, competitor
            gaps, and Search Console correlation across AI search engines.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 w-full sm:w-auto sm:flex sm:items-center sm:gap-2.5">
          <button
            type="button"
            className="btn btn-sm btn-outline rounded-xl font-semibold border-base-300 gap-1.5 shadow-2xs w-full sm:w-auto justify-center"
            onClick={() => setShowSetupModal(true)}
          >
            <Settings2 className="size-4" />
            {isConfigured ? "Settings" : "Setup Tracking"}
          </button>
          {isConfigured && (
            <button
              type="button"
              className="btn btn-sm btn-primary rounded-xl font-semibold gap-1.5 shadow-xs w-full sm:w-auto justify-center"
              disabled={
                runTrackingMutation.isPending || data.prompts.length === 0
              }
              onClick={() => runTrackingMutation.mutate()}
            >
              <Play
                className={`size-4 ${runTrackingMutation.isPending ? "animate-spin" : ""}`}
              />
              {runTrackingMutation.isPending
                ? "Running Check…"
                : "Run Tracking"}
            </button>
          )}
        </div>
      </div>

      {!isConfigured || !config ? (
        <div className="rounded-2xl border border-dashed border-base-300/80 p-8 sm:p-12 text-center bg-base-100/60 shadow-2xs">
          <Bot className="mx-auto size-12 text-base-content/30 mb-3" />
          <h2 className="text-base font-bold text-base-content">
            AI Generatif is not configured yet
          </h2>
          <p className="mx-auto mt-1.5 max-w-md text-xs text-base-content/60 leading-relaxed">
            Define your brand name, domain, aliases, and target platforms to
            begin automatic prompt discovery and visibility tracking.
          </p>
          <div className="mt-5">
            <button
              type="button"
              className="btn btn-sm btn-primary rounded-xl font-semibold gap-2 shadow-xs"
              onClick={() => setShowSetupModal(true)}
            >
              <Settings2 className="size-4" />
              Configure AI Generatif
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Navigation Tabs (Smooth horizontal scroll on mobile) */}
          <div className="border-b border-base-300/80 -mx-3.5 px-3.5 sm:mx-0 sm:px-0 overflow-x-auto no-scrollbar">
            <div className="flex flex-nowrap gap-1 -mb-px min-w-max pb-0.5">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    className={`inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-2 sm:py-2.5 text-xs font-semibold border-b-2 transition-all shrink-0 whitespace-nowrap ${
                      active
                        ? "border-primary text-primary bg-primary/[0.04] rounded-t-lg"
                        : "border-transparent text-base-content/60 hover:text-base-content hover:border-base-300"
                    }`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    <Icon className="size-3.5" />
                    <span>{tab.label}</span>
                    {tab.badge != null && (
                      <span
                        className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                          active
                            ? "bg-primary/15 text-primary"
                            : "bg-base-200 text-base-content/60"
                        }`}
                      >
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <div className="space-y-4 sm:space-y-6">
              {/* Discovery Summary Card */}
              {data.discoveryStats && (
                <div className="rounded-xl border border-base-300 bg-gradient-to-r from-base-100 to-base-200/50 p-3.5 sm:p-4 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                  <div className="flex items-start gap-2.5 sm:gap-3 min-w-0">
                    <div className="rounded-lg bg-primary/10 p-2 text-primary shrink-0 mt-0.5 sm:mt-0">
                      <Sparkles className="size-4 sm:size-5" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-xs sm:text-sm font-semibold text-base-content truncate">
                        {data.discoveryStats.totalDiscovered} AI Prompts
                        Discovered for {config.domain}
                      </h3>
                      <p className="text-[11px] sm:text-xs text-base-content/60 mt-0.5 leading-relaxed">
                        DataForSEO discovery:{" "}
                        {data.discoveryStats.totalMentioned} mentioned •{" "}
                        {data.discoveryStats.totalCited} cited •{" "}
                        {data.discoveryStats.totalSearchVolume.toLocaleString()}{" "}
                        monthly AI search volume
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn btn-sm sm:btn-xs btn-outline btn-primary shrink-0 w-full sm:w-auto justify-center"
                    onClick={() => setActiveTab("ai_prompts")}
                  >
                    View All AI Prompts →
                  </button>
                </div>
              )}

              {/* KPI Header Card */}
              <AiTrackingKpiCards
                kpi={data.kpi}
                selectedPlatform={selectedPlatform}
                onSelectPlatform={setSelectedPlatform}
                availablePlatforms={config.platforms}
              />

              {/* List Position & Tracked Mention Leaderboard */}
              <AiTrackingPositionCard
                brandName={config.brandName}
                domain={config.domain}
                averageListPosition={data.kpi.averageListPosition}
                listPositionSamples={data.kpi.listPositionSamples}
                brandMentions={data.kpi.brandMentions}
                positionTrend={data.positionTrend}
                competitors={data.competitorRankings}
              />

              {/* Sentiment Breakdown */}
              <AiTrackingSentimentCard sentiment={data.sentiment} />
            </div>
          )}

          {/* TAB 2: AI ORGANIC PROMPTS (DISCOVERED) */}
          {activeTab === "ai_prompts" && (
            <AiDiscoveredPromptsTab
              projectId={projectId}
              domain={config.domain}
            />
          )}

          {/* TAB 3: TRACKED PROMPTS */}
          {activeTab === "tracked_prompts" && (
            <div className="space-y-6">
              <AiTrackingPromptsTable
                prompts={data.prompts}
                onAddPrompts={async (prompts) => {
                  await addPromptsMutation.mutateAsync(prompts);
                }}
                onTogglePrompt={async (promptId, active) => {
                  await togglePromptMutation.mutateAsync({ promptId, active });
                }}
                onRemovePrompt={async (promptId) => {
                  await removePromptMutation.mutateAsync(promptId);
                }}
                isAdding={addPromptsMutation.isPending}
              />

              <AiTrackingObservationsTable
                observations={data.recentObservations}
              />
            </div>
          )}

          {/* TAB 4: CITATIONS */}
          {activeTab === "citations" && (
            <AiCitationsTab projectId={projectId} domain={config.domain} />
          )}

          {/* TAB 5: PAGES */}
          {activeTab === "pages" && (
            <AiPagesTab projectId={projectId} domain={config.domain} />
          )}

          {/* TAB 6: COMPETITORS */}
          {activeTab === "competitors" && (
            <AiCompetitorsTab
              projectId={projectId}
              brandName={config.brandName}
              domain={config.domain}
            />
          )}

          {/* TAB 7: GSC AI PERFORMANCE */}
          {activeTab === "gsc" && <AiGscCorrelationTab projectId={projectId} />}
        </>
      )}

      {showSetupModal && (
        <AiTrackingSetupModal
          initialConfig={config}
          onSave={async (input) => {
            await saveConfigMutation.mutateAsync(input);
          }}
          onClose={() => setShowSetupModal(false)}
          isSaving={saveConfigMutation.isPending}
        />
      )}
    </div>
  );
}
