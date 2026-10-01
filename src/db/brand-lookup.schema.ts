import { sql } from "drizzle-orm";
import {
  index,
  integer,
  real,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";
import { projects } from "./app.schema";

export const brandLookupSnapshots = sqliteTable(
  "brand_lookup_snapshots",
  {
    id: text("id").primaryKey(),
    projectId: text("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    snapshotDate: text("snapshot_date").notNull(),
    query: text("query").notNull(),
    targetType: text("target_type", { enum: ["domain", "keyword"] }).notNull(),
    targetValue: text("target_value").notNull(),
    locationCode: integer("location_code").notNull(),
    languageCode: text("language_code").notNull(),
    fetchedAt: text("fetched_at").notNull(),
    hasData: integer("has_data", { mode: "boolean" }).notNull(),
    totalMentions: integer("total_mentions"),
    totalAiSearchVolume: integer("total_ai_search_volume"),
    createdAt: text("created_at")
      .notNull()
      .default(sql`(current_timestamp)`),
    updatedAt: text("updated_at")
      .notNull()
      .default(sql`(current_timestamp)`),
  },
  (table) => [
    uniqueIndex("brand_lookup_snapshots_daily_uniq").on(
      table.projectId,
      table.snapshotDate,
      table.targetType,
      table.targetValue,
      table.locationCode,
      table.languageCode,
    ),
    index("brand_lookup_snapshots_project_date_idx").on(
      table.projectId,
      table.snapshotDate,
    ),
  ],
);

export const brandLookupPlatformSnapshots = sqliteTable(
  "brand_lookup_platform_snapshots",
  {
    id: text("id").primaryKey(),
    snapshotId: text("snapshot_id")
      .notNull()
      .references(() => brandLookupSnapshots.id, { onDelete: "cascade" }),
    platform: text("platform", { enum: ["chat_gpt", "google"] }).notNull(),
    status: text("status", { enum: ["success", "error"] }).notNull(),
    mentions: integer("mentions"),
    aiSearchVolume: integer("ai_search_volume"),
  },
  (table) => [
    uniqueIndex("brand_lookup_platform_snapshot_uniq").on(
      table.snapshotId,
      table.platform,
    ),
    index("brand_lookup_platform_snapshot_idx").on(table.snapshotId),
  ],
);

export const brandLookupSovEntries = sqliteTable(
  "brand_lookup_sov_entries",
  {
    id: text("id").primaryKey(),
    snapshotId: text("snapshot_id")
      .notNull()
      .references(() => brandLookupSnapshots.id, { onDelete: "cascade" }),
    label: text("label").notNull(),
    isTarget: integer("is_target", { mode: "boolean" }).notNull(),
    mentions: integer("mentions"),
    sharePct: real("share_pct"),
    sortOrder: integer("sort_order").notNull(),
  },
  (table) => [
    uniqueIndex("brand_lookup_sov_snapshot_label_uniq").on(
      table.snapshotId,
      table.label,
    ),
    index("brand_lookup_sov_snapshot_idx").on(table.snapshotId),
  ],
);
