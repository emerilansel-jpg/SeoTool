import { sql } from "drizzle-orm";
import {
  index,
  integer,
  real,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";
import { organization } from "./better-auth-schema";
import { projects } from "./app.schema";

// GSC Rank Tracker: free position tracking derived from Search Console
// performance data instead of paid SERP API credits. Keywords are
// auto-discovered from searchAnalytics queries (impressions > 0) by a daily
// sync, with one history row per keyword per day.
export const gscTrackedKeywords = sqliteTable(
  "gsc_tracked_keywords",
  {
    id: text("id").primaryKey(),
    projectId: text("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    keyword: text("keyword").notNull(),
    // Latest synced day's metrics (denormalized for list views).
    lastPosition: real("last_position"),
    lastImpressions: integer("last_impressions").notNull().default(0),
    lastClicks: integer("last_clicks").notNull().default(0),
    lastUrl: text("last_url"),
    lastDay: text("last_day"),
    // "ignored" keywords are kept for history but excluded from sync and UI.
    status: text("status", { enum: ["active", "ignored"] })
      .notNull()
      .default("active"),
    firstSeenAt: text("first_seen_at")
      .notNull()
      .default(sql`(current_timestamp)`),
    lastSyncedAt: text("last_synced_at"),
    createdAt: text("created_at")
      .notNull()
      .default(sql`(current_timestamp)`),
  },
  (table) => [
    uniqueIndex("gsc_tracked_keywords_project_keyword_idx").on(
      table.projectId,
      table.keyword,
    ),
    index("gsc_tracked_keywords_project_idx").on(table.projectId),
    index("gsc_tracked_keywords_organization_idx").on(table.organizationId),
  ],
);

export const gscRankHistory = sqliteTable(
  "gsc_rank_history",
  {
    id: text("id").primaryKey(),
    projectId: text("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    keywordId: text("keyword_id")
      .notNull()
      .references(() => gscTrackedKeywords.id, { onDelete: "cascade" }),
    // UTC date, "YYYY-MM-DD".
    day: text("day").notNull(),
    // GSC average position for the day (fractional); null when the keyword
    // had impressions data but no position reported.
    position: real("position"),
    impressions: integer("impressions").notNull().default(0),
    clicks: integer("clicks").notNull().default(0),
    // Top ranking URL for the keyword that day (cannibalization detection).
    url: text("url"),
    updatedAt: text("updated_at")
      .notNull()
      .default(sql`(current_timestamp)`),
  },
  (table) => [
    uniqueIndex("gsc_rank_history_keyword_day_idx").on(
      table.keywordId,
      table.day,
    ),
    index("gsc_rank_history_project_day_idx").on(table.projectId, table.day),
  ],
);
