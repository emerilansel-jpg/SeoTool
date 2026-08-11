import { sql } from "drizzle-orm";
import {
  index,
  integer,
  pgTable,
  text,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { audits, auditPages } from "./audit.schema";

// See src/db/pg/app.schema.ts for why timestamps are ISO-8601 UTC text.
const isoNow = sql`to_char(now() AT TIME ZONE 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')`;

// See src/db/content-intelligence.schema.ts for full notes; Postgres mirror
// kept structurally identical so the provider-aware barrel works on both
// backends (enforced by schema-parity.test.ts).
export const contentScores = pgTable(
  "content_scores",
  {
    id: text("id").primaryKey(),
    auditId: text("audit_id")
      .notNull()
      .references(() => audits.id, { onDelete: "cascade" }),
    pageId: text("page_id")
      .notNull()
      .references(() => auditPages.id, { onDelete: "cascade" }),
    url: text("url").notNull(),
    score: integer("score").notNull(),
    depthScore: integer("depth_score").notNull(),
    headingsScore: integer("headings_score").notNull(),
    metadataScore: integer("metadata_score").notNull(),
    mediaScore: integer("media_score").notNull(),
    linkingScore: integer("linking_score").notNull(),
    technicalScore: integer("technical_score").notNull(),
    flagsJson: text("flags_json").notNull().default("[]"),
    wordCount: integer("word_count").notNull().default(0),
    computedAt: text("computed_at").notNull().default(isoNow),
  },
  (table) => [
    uniqueIndex("content_scores_page_id_idx").on(table.pageId),
    index("content_scores_audit_id_idx").on(table.auditId),
  ],
);

// Per-page entity/topic extraction via LLM (OpenRouter). See
// src/db/content-intelligence.schema.ts for full notes; Postgres mirror kept
// structurally identical so the provider-aware barrel works on both backends.
export const pageEntities = pgTable(
  "page_entities",
  {
    id: text("id").primaryKey(),
    auditId: text("audit_id")
      .notNull()
      .references(() => audits.id, { onDelete: "cascade" }),
    pageId: text("page_id")
      .notNull()
      .references(() => auditPages.id, { onDelete: "cascade" }),
    url: text("url").notNull(),
    entitiesJson: text("entities_json").notNull().default("[]"),
    topicsJson: text("topics_json").notNull().default("[]"),
    extractedAt: text("extracted_at").notNull().default(isoNow),
  },
  (table) => [
    uniqueIndex("page_entities_page_id_idx").on(table.pageId),
    index("page_entities_audit_id_idx").on(table.auditId),
  ],
);
