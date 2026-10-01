import { sql } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  pgTable,
  real,
  text,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { projects } from "./app.schema";

const isoNow = sql`to_char(now() AT TIME ZONE 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')`;

export const brandLookupSnapshots = pgTable(
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
    hasData: boolean("has_data").notNull(),
    totalMentions: integer("total_mentions"),
    totalAiSearchVolume: integer("total_ai_search_volume"),
    createdAt: text("created_at").notNull().default(isoNow),
    updatedAt: text("updated_at").notNull().default(isoNow),
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

export const brandLookupPlatformSnapshots = pgTable(
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

export const brandLookupSovEntries = pgTable(
  "brand_lookup_sov_entries",
  {
    id: text("id").primaryKey(),
    snapshotId: text("snapshot_id")
      .notNull()
      .references(() => brandLookupSnapshots.id, { onDelete: "cascade" }),
    label: text("label").notNull(),
    isTarget: boolean("is_target").notNull(),
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
