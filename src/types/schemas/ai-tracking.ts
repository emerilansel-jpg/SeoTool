import { z } from "zod";

export const AI_TRACKING_PLATFORMS = [
  "chat_gpt",
  "gemini",
  "perplexity",
  "claude",
] as const;

export type AiTrackingPlatform = (typeof AI_TRACKING_PLATFORMS)[number];

export const aiTrackingPlatformSchema = z.enum(AI_TRACKING_PLATFORMS);

export const aiTrackingScheduleSchema = z.enum(["manual", "daily", "weekly"]);
export type AiTrackingSchedule = z.infer<typeof aiTrackingScheduleSchema>;

export const aiTrackingScheduleStatusSchema = z.enum([
  "idle",
  "active",
  "paused",
]);
export type AiTrackingScheduleStatus = z.infer<
  typeof aiTrackingScheduleStatusSchema
>;

export const saveAiTrackingConfigSchema = z.object({
  projectId: z.string().min(1),
  brandName: z.string().trim().min(1, "Brand name is required"),
  domain: z
    .string()
    .trim()
    .min(1, "Domain is required")
    .transform((d) =>
      d
        .toLowerCase()
        .replace(/^https?:\/\//, "")
        .replace(/^www\./, "")
        .replace(/\/.*$/, ""),
    ),
  brandAliases: z.array(z.string().trim().min(1)).default([]),
  platforms: z
    .array(aiTrackingPlatformSchema)
    .min(1, "Select at least one platform"),
  schedule: aiTrackingScheduleSchema.default("manual"),
  scheduleStatus: aiTrackingScheduleStatusSchema.default("idle"),
});

export type SaveAiTrackingConfigInput = z.infer<
  typeof saveAiTrackingConfigSchema
>;

export const addAiTrackingPromptsSchema = z.object({
  projectId: z.string().min(1),
  prompts: z
    .array(z.string().trim().min(2, "Prompt too short"))
    .min(1, "Provide at least one prompt")
    .max(50, "Maximum 50 prompts per batch"),
});

export type AddAiTrackingPromptsInput = z.infer<
  typeof addAiTrackingPromptsSchema
>;

export const toggleAiTrackingPromptSchema = z.object({
  projectId: z.string().min(1),
  promptId: z.string().min(1),
  active: z.boolean(),
});

export const removeAiTrackingPromptSchema = z.object({
  projectId: z.string().min(1),
  promptId: z.string().min(1),
});

export const runAiTrackingSchema = z.object({
  projectId: z.string().min(1),
});

export const getAiTrackingDashboardSchema = z.object({
  projectId: z.string().min(1),
  platform: z.string().optional().default("all"),
  days: z.coerce.number().int().min(1).max(365).optional().default(30),
});

export type GetAiTrackingDashboardInput = z.infer<
  typeof getAiTrackingDashboardSchema
>;

export interface AiTrackingKpi {
  mentionCoveragePercent: number;
  positiveMentions: number;
  positiveMentionPercent: number;
  averageListPosition: number | null;
  listPositionSamples: number;
  totalResponses: number;
  brandMentions: number;
}

export type AiTrackingSentiment = "positive" | "mixed" | "neutral" | "negative";

export interface AiTrackingSentimentBreakdown {
  positive: number;
  mixed: number;
  neutral: number;
  negative: number;
  total: number;
  positivePercent: number;
  mixedPercent: number;
  neutralPercent: number;
  negativePercent: number;
  topInsights: Array<{
    text: string;
    count: number;
    sentiment: AiTrackingSentiment;
  }>;
}

export interface AiTrackingTrendPoint {
  date: string;
  position?: number | null;
  visibility?: number;
}

export interface AiTrackingCompetitorRanking {
  domain: string;
  brandName: string;
  isTargetBrand: boolean;
  avgPosition: number;
  mentionsCount: number;
  visibilityPct: number;
}

export interface AiTrackingPromptItem {
  id: string;
  prompt: string;
  active: boolean;
  createdAt: string;
  lastPosition: number | null;
  lastMentioned: boolean | null;
  lastSentiment: string | null;
  lastCheckedAt: string | null;
}

export interface AiTrackingObservationItem {
  id: string;
  prompt: string;
  platform: string;
  status: string;
  observedAt: string;
  brandMentioned: boolean;
  position: number | null;
  sentiment: string;
  evidence: string | null;
  responseText: string | null;
  citations: Array<{
    url: string;
    domain: string;
    title: string | null;
    isTargetBrand: boolean;
  }>;
}

export interface AiTrackingDashboardData {
  config: {
    id: string;
    projectId: string;
    brandName: string;
    domain: string;
    brandAliases: string[];
    platforms: AiTrackingPlatform[];
    schedule: AiTrackingSchedule;
    scheduleStatus: AiTrackingScheduleStatus;
    lastRunAt: string | null;
  } | null;
  prompts: AiTrackingPromptItem[];
  kpi: AiTrackingKpi;
  sentiment: AiTrackingSentimentBreakdown;
  positionTrend: AiTrackingTrendPoint[];
  visibilityTrend: AiTrackingTrendPoint[];
  competitorRankings: AiTrackingCompetitorRanking[];
  recentObservations: AiTrackingObservationItem[];
  lastRun: {
    id: string;
    status: string;
    trigger: string;
    promptsTotal: number;
    promptsCompleted: number;
    errorMessage: string | null;
    startedAt: string;
    completedAt: string | null;
  } | null;
  discoveryStats?: {
    totalDiscovered: number;
    totalMentioned: number;
    totalCited: number;
    totalSearchVolume: number;
    lastDiscoveryAt: string | null;
  };
}

export const discoverAiPromptsSchema = z.object({
  projectId: z.string().min(1),
});
export type DiscoverAiPromptsInput = z.infer<typeof discoverAiPromptsSchema>;

export const getDiscoveredPromptsSchema = z.object({
  projectId: z.string().min(1),
  platform: z.string().optional().default("all"),
  filter: z
    .enum(["all", "mentioned", "cited", "untracked"])
    .optional()
    .default("all"),
  search: z.string().optional().default(""),
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(5).max(100).optional().default(20),
});
export type GetDiscoveredPromptsInput = z.infer<
  typeof getDiscoveredPromptsSchema
>;

export const promoteDiscoveredPromptSchema = z.object({
  projectId: z.string().min(1),
  promptId: z.string().min(1),
});
export type PromoteDiscoveredPromptInput = z.infer<
  typeof promoteDiscoveredPromptSchema
>;

export const getAiCitationsSchema = z.object({
  projectId: z.string().min(1),
});
export type GetAiCitationsInput = z.infer<typeof getAiCitationsSchema>;

export const getAiPagesSchema = z.object({
  projectId: z.string().min(1),
});
export type GetAiPagesInput = z.infer<typeof getAiPagesSchema>;

export const getAiCompetitorsSchema = z.object({
  projectId: z.string().min(1),
});
export type GetAiCompetitorsInput = z.infer<typeof getAiCompetitorsSchema>;

export const getGscAiCorrelationSchema = z.object({
  projectId: z.string().min(1),
  dateRange: z.string().optional().default("last_28_days"),
});
export type GetGscAiCorrelationInput = z.infer<
  typeof getGscAiCorrelationSchema
>;

export interface DiscoveredPromptItem {
  id: string;
  prompt: string;
  platform: string;
  aiSearchVolume: number;
  hasMention: boolean;
  hasCitation: boolean;
  citationUrl: string | null;
  brandEntities: string[];
  sources: Array<{
    url?: string | null;
    title?: string | null;
    domain?: string | null;
  }>;
  isTracked: boolean;
  firstResponseAt: string | null;
  lastResponseAt: string | null;
  discoveredAt: string;
}

export interface AiTopPageItem {
  id: string;
  url: string;
  platform: string;
  mentions: number;
  aiSearchVolume: number;
  updatedAt: string;
}

export interface AiCitationSourceItem {
  domain: string;
  frequency: number;
  isTargetBrand: boolean;
  sampleUrls: string[];
  promptsCount: number;
}

export interface AiPromptGapItem {
  prompt: string;
  aiSearchVolume: number;
  ourMention: boolean;
  ourCitation: boolean;
  competitorsMentioned: string[];
}

export interface AiGscCorrelationItem {
  aiPrompt: string;
  aiPresence: boolean;
  aiCitation: boolean;
  gscQuery: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
  sourceBadge: "GSC" | "DataForSEO" | "Tracked" | "Calculated";
}
