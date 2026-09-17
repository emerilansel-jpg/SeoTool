import { relations, sql } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  pgTable,
  text,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { projects } from "@/db/pg/app.schema";

const isoNow = sql`to_char(now() AT TIME ZONE 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')`;
const timestampColumn = (name: string) => text(name);

export const aiTrackingConfigs = pgTable(
  "ai_tracking_configs",
  {
    id: text("id").primaryKey(),
    projectId: text("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    brandName: text("brand_name").notNull(),
    domain: text("domain").notNull(),
    brandAliases: text("brand_aliases").notNull().default("[]"),
    platforms: text("platforms")
      .notNull()
      .default('["chat_gpt","gemini","perplexity"]'),
    schedule: text("schedule", {
      enum: ["manual", "daily", "weekly"],
    })
      .notNull()
      .default("manual"),
    scheduleStatus: text("schedule_status", {
      enum: ["idle", "active", "paused"],
    })
      .notNull()
      .default("idle"),
    locationCode: integer("location_code").notNull().default(2840),
    languageCode: text("language_code").notNull().default("en"),
    lastDiscoveryAt: timestampColumn("last_discovery_at"),
    nextRunAt: timestampColumn("next_run_at"),
    lastRunAt: timestampColumn("last_run_at"),
    createdAt: timestampColumn("created_at").notNull().default(isoNow),
    updatedAt: timestampColumn("updated_at").notNull().default(isoNow),
  },
  (table) => [
    uniqueIndex("ai_tracking_configs_project_id_uniq").on(table.projectId),
    uniqueIndex("ai_tracking_configs_id_project_id_uniq").on(
      table.id,
      table.projectId,
    ),
  ],
);

export const aiTrackingPrompts = pgTable(
  "ai_tracking_prompts",
  {
    id: text("id").primaryKey(),
    configId: text("config_id")
      .notNull()
      .references(() => aiTrackingConfigs.id, { onDelete: "cascade" }),
    prompt: text("prompt").notNull(),
    active: boolean("active").notNull().default(true),
    createdAt: timestampColumn("created_at").notNull().default(isoNow),
  },
  (table) => [
    index("ai_tracking_prompts_config_id_idx").on(table.configId),
    uniqueIndex("ai_tracking_prompts_config_prompt_uniq").on(
      table.configId,
      table.prompt,
    ),
  ],
);

export const aiTrackingRuns = pgTable(
  "ai_tracking_runs",
  {
    id: text("id").primaryKey(),
    configId: text("config_id")
      .notNull()
      .references(() => aiTrackingConfigs.id, { onDelete: "cascade" }),
    projectId: text("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    trigger: text("trigger", { enum: ["manual", "scheduled"] })
      .notNull()
      .default("manual"),
    status: text("status", {
      enum: ["pending", "running", "completed", "failed"],
    })
      .notNull()
      .default("pending"),
    promptsTotal: integer("prompts_total").notNull().default(0),
    promptsCompleted: integer("prompts_completed").notNull().default(0),
    errorMessage: text("error_message"),
    startedAt: timestampColumn("started_at").notNull().default(isoNow),
    completedAt: timestampColumn("completed_at"),
  },
  (table) => [
    index("ai_tracking_runs_config_idx").on(table.configId, table.startedAt),
    index("ai_tracking_runs_project_idx").on(table.projectId, table.startedAt),
    uniqueIndex("ai_tracking_runs_id_config_id_uniq").on(
      table.id,
      table.configId,
    ),
    uniqueIndex("ai_tracking_runs_one_active_per_config_idx")
      .on(table.configId)
      .where(sql`${table.status} IN ('pending', 'running')`),
  ],
);

export const aiTrackingObservations = pgTable(
  "ai_tracking_observations",
  {
    id: text("id").primaryKey(),
    runId: text("run_id")
      .notNull()
      .references(() => aiTrackingRuns.id, { onDelete: "cascade" }),
    configId: text("config_id")
      .notNull()
      .references(() => aiTrackingConfigs.id, { onDelete: "cascade" }),
    promptId: text("prompt_id").notNull(),
    prompt: text("prompt").notNull(),
    platform: text("platform", {
      enum: ["chat_gpt", "gemini", "perplexity", "claude"],
    }).notNull(),
    status: text("status", { enum: ["success", "failed"] }).notNull(),
    responseText: text("response_text"),
    errorMessage: text("error_message"),
    observedAt: timestampColumn("observed_at").notNull().default(isoNow),
  },
  (table) => [
    index("ai_tracking_obs_run_idx").on(table.runId),
    index("ai_tracking_obs_config_date_idx").on(
      table.configId,
      table.observedAt,
    ),
    uniqueIndex("ai_tracking_obs_id_run_uniq").on(table.id, table.runId),
    uniqueIndex("ai_tracking_obs_id_run_config_uniq").on(
      table.id,
      table.runId,
      table.configId,
    ),
    uniqueIndex("ai_tracking_obs_run_prompt_platform_uniq").on(
      table.runId,
      table.promptId,
      table.platform,
    ),
  ],
);

export const aiTrackingMentions = pgTable(
  "ai_tracking_mentions",
  {
    id: text("id").primaryKey(),
    observationId: text("observation_id")
      .notNull()
      .references(() => aiTrackingObservations.id, { onDelete: "cascade" }),
    runId: text("run_id")
      .notNull()
      .references(() => aiTrackingRuns.id, { onDelete: "cascade" }),
    configId: text("config_id")
      .notNull()
      .references(() => aiTrackingConfigs.id, { onDelete: "cascade" }),
    brandName: text("brand_name").notNull(),
    domain: text("domain").notNull(),
    isTargetBrand: boolean("is_target_brand").notNull().default(false),
    position: integer("position"),
    sentiment: text("sentiment", {
      enum: ["positive", "mixed", "neutral", "negative"],
    })
      .notNull()
      .default("neutral"),
    evidence: text("evidence"),
    createdAt: timestampColumn("created_at").notNull().default(isoNow),
  },
  (table) => [
    index("ai_tracking_mentions_obs_idx").on(table.observationId),
    index("ai_tracking_mentions_config_brand_idx").on(
      table.configId,
      table.domain,
    ),
  ],
);

export const aiTrackingCitations = pgTable(
  "ai_tracking_citations",
  {
    id: text("id").primaryKey(),
    observationId: text("observation_id")
      .notNull()
      .references(() => aiTrackingObservations.id, { onDelete: "cascade" }),
    runId: text("run_id")
      .notNull()
      .references(() => aiTrackingRuns.id, { onDelete: "cascade" }),
    url: text("url").notNull(),
    domain: text("domain").notNull(),
    title: text("title"),
    isTargetBrand: boolean("is_target_brand").notNull().default(false),
    createdAt: timestampColumn("created_at").notNull().default(isoNow),
  },
  (table) => [index("ai_tracking_citations_obs_idx").on(table.observationId)],
);

export const aiDiscoveredPrompts = pgTable(
  "ai_discovered_prompts",
  {
    id: text("id").primaryKey(),
    configId: text("config_id")
      .notNull()
      .references(() => aiTrackingConfigs.id, { onDelete: "cascade" }),
    prompt: text("prompt").notNull(),
    platform: text("platform").notNull().default("all"),
    aiSearchVolume: integer("ai_search_volume").notNull().default(0),
    hasMention: boolean("has_mention").notNull().default(false),
    hasCitation: boolean("has_citation").notNull().default(false),
    citationUrl: text("citation_url"),
    brandEntities: text("brand_entities").notNull().default("[]"),
    sources: text("sources").notNull().default("[]"),
    isTracked: boolean("is_tracked").notNull().default(false),
    firstResponseAt: timestampColumn("first_response_at"),
    lastResponseAt: timestampColumn("last_response_at"),
    discoveredAt: timestampColumn("discovered_at").notNull().default(isoNow),
  },
  (table) => [
    index("ai_discovered_prompts_config_idx").on(table.configId),
    uniqueIndex("ai_discovered_prompts_config_prompt_uniq").on(
      table.configId,
      table.prompt,
    ),
    index("ai_discovered_prompts_volume_idx").on(
      table.configId,
      table.aiSearchVolume,
    ),
  ],
);

export const aiTopPages = pgTable(
  "ai_top_pages",
  {
    id: text("id").primaryKey(),
    configId: text("config_id")
      .notNull()
      .references(() => aiTrackingConfigs.id, { onDelete: "cascade" }),
    url: text("url").notNull(),
    platform: text("platform").notNull().default("all"),
    mentions: integer("mentions").notNull().default(0),
    aiSearchVolume: integer("ai_search_volume").notNull().default(0),
    updatedAt: timestampColumn("updated_at").notNull().default(isoNow),
  },
  (table) => [
    index("ai_top_pages_config_idx").on(table.configId),
    uniqueIndex("ai_top_pages_config_url_platform_uniq").on(
      table.configId,
      table.url,
      table.platform,
    ),
  ],
);

export const aiVisibilitySnapshots = pgTable(
  "ai_visibility_snapshots",
  {
    id: text("id").primaryKey(),
    configId: text("config_id")
      .notNull()
      .references(() => aiTrackingConfigs.id, { onDelete: "cascade" }),
    snapshotDate: text("snapshot_date").notNull(),
    platform: text("platform").notNull().default("all"),
    visibilityScore: integer("visibility_score").notNull().default(0),
    mentionRate: integer("mention_rate").notNull().default(0),
    citationRate: integer("citation_rate").notNull().default(0),
    shareOfVoice: integer("share_of_voice").notNull().default(0),
    promptsTracked: integer("prompts_tracked").notNull().default(0),
    promptsMentioned: integer("prompts_mentioned").notNull().default(0),
    promptsCited: integer("prompts_cited").notNull().default(0),
    createdAt: timestampColumn("created_at").notNull().default(isoNow),
  },
  (table) => [
    index("ai_visibility_snapshots_config_idx").on(table.configId),
    uniqueIndex("ai_visibility_snapshots_config_date_plat_uniq").on(
      table.configId,
      table.snapshotDate,
      table.platform,
    ),
  ],
);

export const aiTrackingConfigsRelations = relations(
  aiTrackingConfigs,
  ({ one, many }) => ({
    project: one(projects, {
      fields: [aiTrackingConfigs.projectId],
      references: [projects.id],
    }),
    prompts: many(aiTrackingPrompts),
    runs: many(aiTrackingRuns),
    discoveredPrompts: many(aiDiscoveredPrompts),
    topPages: many(aiTopPages),
    visibilitySnapshots: many(aiVisibilitySnapshots),
  }),
);

export const aiDiscoveredPromptsRelations = relations(
  aiDiscoveredPrompts,
  ({ one }) => ({
    config: one(aiTrackingConfigs, {
      fields: [aiDiscoveredPrompts.configId],
      references: [aiTrackingConfigs.id],
    }),
  }),
);

export const aiTopPagesRelations = relations(aiTopPages, ({ one }) => ({
  config: one(aiTrackingConfigs, {
    fields: [aiTopPages.configId],
    references: [aiTrackingConfigs.id],
  }),
}));

export const aiVisibilitySnapshotsRelations = relations(
  aiVisibilitySnapshots,
  ({ one }) => ({
    config: one(aiTrackingConfigs, {
      fields: [aiVisibilitySnapshots.configId],
      references: [aiTrackingConfigs.id],
    }),
  }),
);

export const aiTrackingPromptsRelations = relations(
  aiTrackingPrompts,
  ({ one }) => ({
    config: one(aiTrackingConfigs, {
      fields: [aiTrackingPrompts.configId],
      references: [aiTrackingConfigs.id],
    }),
  }),
);

export const aiTrackingRunsRelations = relations(
  aiTrackingRuns,
  ({ one, many }) => ({
    config: one(aiTrackingConfigs, {
      fields: [aiTrackingRuns.configId],
      references: [aiTrackingConfigs.id],
    }),
    observations: many(aiTrackingObservations),
  }),
);

export const aiTrackingObservationsRelations = relations(
  aiTrackingObservations,
  ({ one, many }) => ({
    run: one(aiTrackingRuns, {
      fields: [aiTrackingObservations.runId],
      references: [aiTrackingRuns.id],
    }),
    mentions: many(aiTrackingMentions),
    citations: many(aiTrackingCitations),
  }),
);
