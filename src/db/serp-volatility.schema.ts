import { sql } from "drizzle-orm";
import {
  index,
  integer,
  real,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";
import { projects } from "@/db/app.schema";

export const serpVolatilitySnapshots = sqliteTable(
  "serp_volatility_snapshots",
  {
    id: text("id").primaryKey(),
    projectId: text("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    date: text("date").notNull(), // YYYY-MM-DD
    volatilityScore: real("volatility_score").notNull(), // 0-100
    keywordsSampled: integer("keywords_sampled").notNull(),
    avgPositionChange: real("avg_position_change").notNull(),
    topMoversJson: text("top_movers_json"), // JSON array of top 5 movers
    createdAt: text("created_at")
      .notNull()
      .default(sql`(current_timestamp)`),
  },
  (table) => [
    index("serp_volatility_project_date_idx").on(table.projectId, table.date),
  ],
);
