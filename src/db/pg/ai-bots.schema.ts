import { sql } from "drizzle-orm";
import {
  index,
  integer,
  pgTable,
  text,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { organization } from "./better-auth-schema";
import { projects } from "./app.schema";

// See src/db/pg/app.schema.ts for why timestamps are ISO-8601 UTC text.
const isoNow = sql`to_char(now() AT TIME ZONE 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')`;

// AI Bot Monitor (AEO) tables: ingest-token config per project, raw crawler
// hits (from the on-site beacon or access-log upload), and a daily rollup the
// dashboard reads instead of scanning raw hits.
export const aiBotSites = pgTable(
  "ai_bot_sites",
  {
    id: text("id").primaryKey(),
    projectId: text("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    // Site domain the beacon/log data belongs to, e.g. "example.com".
    domain: text("domain").notNull(),
    // Bearer token the on-site snippet uses to POST hits to the ingest API.
    ingestToken: text("ingest_token").notNull(),
    // Serialized robots.txt compliance result: JSON of
    // { checkedAt, groups: [{ bot, directive: "allowed"|"disallowed"|"not_mentioned" }] }.
    robotsCompliance: text("robots_compliance"),
    robotsCheckedAt: text("robots_checked_at"),
    lastHitAt: text("last_hit_at"),
    createdAt: text("created_at").notNull().default(isoNow),
    updatedAt: text("updated_at").notNull().default(isoNow),
  },
  (table) => [
    uniqueIndex("ai_bot_sites_project_idx").on(table.projectId),
    uniqueIndex("ai_bot_sites_token_idx").on(table.ingestToken),
    index("ai_bot_sites_organization_idx").on(table.organizationId),
  ],
);

export const aiBotHits = pgTable(
  "ai_bot_hits",
  {
    id: text("id").primaryKey(),
    projectId: text("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    // Canonical bot key from src/shared/ai-bots.ts, or "other" for unmatched.
    bot: text("bot").notNull(),
    url: text("url").notNull(),
    userAgent: text("user_agent"),
    statusCode: integer("status_code"),
    // SHA-256 prefix (first 16 hex chars) of the client IP — never raw IPs.
    ipHash: text("ip_hash"),
    // "ingest" (on-site beacon) or "log_upload" (parsed access log).
    source: text("source").notNull(),
    // Timestamp reported by the source site (ISO 8601), not ingest time.
    hitAt: text("hit_at").notNull(),
    createdAt: text("created_at").notNull().default(isoNow),
  },
  (table) => [
    index("ai_bot_hits_project_hit_idx").on(table.projectId, table.hitAt),
    index("ai_bot_hits_project_bot_idx").on(
      table.projectId,
      table.bot,
      table.hitAt,
    ),
    index("ai_bot_hits_project_url_idx").on(table.projectId, table.url),
  ],
);

export const aiBotDailyStats = pgTable(
  "ai_bot_daily_stats",
  {
    id: text("id").primaryKey(),
    projectId: text("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    // UTC date, "YYYY-MM-DD".
    day: text("day").notNull(),
    bot: text("bot").notNull(),
    hits: integer("hits").notNull().default(0),
    uniqueUrls: integer("unique_urls").notNull().default(0),
    updatedAt: text("updated_at").notNull().default(isoNow),
  },
  (table) => [
    uniqueIndex("ai_bot_daily_stats_project_day_bot_idx").on(
      table.projectId,
      table.day,
      table.bot,
    ),
    index("ai_bot_daily_stats_project_day_idx").on(table.projectId, table.day),
  ],
);
