import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Bot, Play, Settings2 } from "lucide-react";
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
import { getStandardErrorMessage } from "@/client/lib/error-messages";
import type { SaveAiTrackingConfigInput } from "@/types/schemas/ai-tracking";

interface Props {
  projectId: string;
}

export function AiTrackingPage({ projectId }: Props) {
  const queryClient = useQueryClient();
  const [selectedPlatform, setSelectedPlatform] = useState<string>("all");
  const [showSetupModal, setShowSetupModal] = useState(false);

  const getDashboardFn = useServerFn(getAiTrackingDashboard);
  const saveConfigFn = useServerFn(saveAiTrackingConfig);
  const addPromptsFn = useServerFn(addAiTrackingPrompts);
  const togglePromptFn = useServerFn(toggleAiTrackingPrompt);
  const removePromptFn = useServerFn(removeAiTrackingPrompt);
  const runTrackingFn = useServerFn(runAiTracking);

  const { data, isLoading } = useQuery({
    queryKey: ["ai-tracking-dashboard", projectId, selectedPlatform],
    queryFn: () =>
      getDashboardFn({
        data: { projectId, platform: selectedPlatform, days: 30 },
      }),
  });

  const invalidate = () =>
    queryClient.invalidateQueries({
      queryKey: ["ai-tracking-dashboard", projectId],
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
    mutationFn: ({
      promptId,
      active,
    }: {
      promptId: string;
      active: boolean;
    }) => togglePromptFn({ data: { projectId, promptId, active } }),
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

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Bot className="size-6 text-primary" />
            <h1 className="text-xl font-bold tracking-tight text-base-content">
              AI Tracking
            </h1>
            <span className="badge badge-primary badge-sm font-semibold">
              Live Mentions
            </span>
          </div>
          <p className="mt-1 text-xs text-base-content/60">
            Monitor brand presence, ranking position, and sentiment across ChatGPT, Gemini, Perplexity, and Claude.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            className="btn btn-sm btn-outline gap-1.5"
            onClick={() => setShowSetupModal(true)}
          >
            <Settings2 className="size-4" />
            {isConfigured ? "Settings" : "Setup Tracking"}
          </button>
          {isConfigured && (
            <button
              type="button"
              className="btn btn-sm btn-primary gap-1.5"
              disabled={
                runTrackingMutation.isPending || data.prompts.length === 0
              }
              onClick={() => runTrackingMutation.mutate()}
            >
              <Play
                className={`size-4 ${runTrackingMutation.isPending ? "animate-spin" : ""}`}
              />
              {runTrackingMutation.isPending ? "Running Check…" : "Run Tracking"}
            </button>
          )}
        </div>
      </div>

      {!isConfigured || !config ? (
        <div className="rounded-xl border border-dashed border-base-300 p-12 text-center bg-base-100 shadow-sm">
          <Bot className="mx-auto size-12 text-base-content/30 mb-3" />
          <h2 className="text-base font-semibold text-base-content">
            AI Tracking is not configured yet
          </h2>
          <p className="mx-auto mt-1.5 max-w-md text-xs text-base-content/60">
            Define your brand name, domain, aliases, and prompts to start tracking visibility and rankings across leading AI assistants.
          </p>
          <div className="mt-5">
            <button
              type="button"
              className="btn btn-sm btn-primary gap-2"
              onClick={() => setShowSetupModal(true)}
            >
              <Settings2 className="size-4" />
              Configure AI Tracking
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* KPI Header Card */}
          <AiTrackingKpiCards
            kpi={data.kpi}
            selectedPlatform={selectedPlatform}
            onSelectPlatform={setSelectedPlatform}
            availablePlatforms={config.platforms}
          />

          {/* Average Position Rank & Competitor Leaderboard */}
          <AiTrackingPositionCard
            brandName={config.brandName}
            domain={config.domain}
            averagePosition={data.kpi.averagePosition}
            averagePositionDelta={data.kpi.averagePositionDelta}
            positionTrend={data.positionTrend}
            competitors={data.competitorRankings}
          />

          {/* Sentiment Breakdown */}
          <AiTrackingSentimentCard sentiment={data.sentiment} />

          {/* Tracked Prompts */}
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

          {/* Recent AI Observations */}
          <AiTrackingObservationsTable
            observations={data.recentObservations}
          />
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
