import { relations, sql } from "drizzle-orm";
import {
  text,
  integer,
  sqliteTable,
  index,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";
import { rankCheckRuns } from "@/db/app.schema";

/**
 * Full SERP composition snapshots — persisted during rank check runs.
 * Each row = one organic result position for a (run, keyword, device) tuple.
 * `rank_snapshots` stores only the tracked domain's position; this table
 * captures the full top-N SERP (competitors, URLs, titles) at zero additional
 * API cost — the data was already fetched and previously discarded.
 */
export const serpSnapshots = sqliteTable(
  "serp_snapshots",
  {
    id: text("id").primaryKey(),
    runId: text("run_id")
      .notNull()
      .references(() => rankCheckRuns.id, { onDelete: "cascade" }),
    trackingKeywordId: text("tracking_keyword_id").notNull(),
    keyword: text("keyword").notNull(),
    device: text("device").notNull(), // "desktop" | "mobile"
    rank: integer("rank").notNull(), // 1-based SERP position
    url: text("url"),
    title: text("title"),
    description: text("description"),
    domain: text("domain"), // extracted from URL for quick grouping
    isTrackedDomain: integer("is_tracked_domain", { mode: "boolean" })
      .notNull()
      .default(false),
    checkedAt: integer("checked_at", { mode: "timestamp" })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("serp_snapshots_run_kw_device_idx").on(
      table.runId,
      table.trackingKeywordId,
      table.device,
    ),
    index("serp_snapshots_kw_rank_idx").on(table.trackingKeywordId, table.rank),
    uniqueIndex("serp_snapshots_unique_idx").on(
      table.runId,
      table.trackingKeywordId,
      table.device,
      table.rank,
    ),
  ],
);

export const serpSnapshotsRelations = relations(serpSnapshots, ({ one }) => ({
  run: one(rankCheckRuns, {
    fields: [serpSnapshots.runId],
    references: [rankCheckRuns.id],
  }),
}));
