import { sql } from "drizzle-orm";
import {
  index,
  integer,
  pgTable,
  real,
  text,
  varchar,
} from "drizzle-orm/pg-core";
import { projects } from "@/db/pg/app.schema";

const isoNow = sql`to_char(now() AT TIME ZONE 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')`;

export const serpVolatilitySnapshots = pgTable(
  "serp_volatility_snapshots",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    projectId: text("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    date: text("date").notNull(),
    volatilityScore: real("volatility_score").notNull(),
    keywordsSampled: integer("keywords_sampled").notNull(),
    avgPositionChange: real("avg_position_change").notNull(),
    topMoversJson: text("top_movers_json"),
    createdAt: text("created_at").notNull().default(isoNow),
  },
  (table) => [
    index("serp_volatility_project_date_idx").on(table.projectId, table.date),
  ],
);
