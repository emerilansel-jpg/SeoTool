import { relations } from "drizzle-orm";
import {
  text,
  integer,
  boolean,
  timestamp,
  varchar,
  pgTable,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { rankCheckRuns } from "@/db/pg/app.schema";

export const serpSnapshots = pgTable(
  "serp_snapshots",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    runId: varchar("run_id", { length: 36 })
      .notNull()
      .references(() => rankCheckRuns.id, { onDelete: "cascade" }),
    trackingKeywordId: text("tracking_keyword_id").notNull(),
    keyword: text("keyword").notNull(),
    device: varchar("device", { length: 20 }).notNull(),
    rank: integer("rank").notNull(),
    url: text("url"),
    title: text("title"),
    description: text("description"),
    domain: text("domain"),
    isTrackedDomain: boolean("is_tracked_domain").notNull().default(false),
    checkedAt: timestamp("checked_at", { mode: "date" }).notNull().defaultNow(),
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
