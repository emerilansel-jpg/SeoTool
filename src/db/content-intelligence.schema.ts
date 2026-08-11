import {
  sqliteTable,
  text,
  integer,
  uniqueIndex,
  index,
} from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import { audits, auditPages } from "./audit.schema";

// One content-quality score per audited page. Computed deterministically
// from already-crawled audit_pages signals (no external API, no cost). See
// src/server/features/content-intelligence/contentScore.ts for the engine.
export const contentScores = sqliteTable(
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
    // Overall score 0-100.
    score: integer("score").notNull(),
    // Explainable sub-scores 0-100.
    depthScore: integer("depth_score").notNull(),
    headingsScore: integer("headings_score").notNull(),
    metadataScore: integer("metadata_score").notNull(),
    mediaScore: integer("media_score").notNull(),
    linkingScore: integer("linking_score").notNull(),
    technicalScore: integer("technical_score").notNull(),
    // JSON array of { severity, code, message }.
    flagsJson: text("flags_json").notNull().default("[]"),
    wordCount: integer("word_count").notNull().default(0),
    computedAt: text("computed_at")
      .notNull()
      .default(sql`(current_timestamp)`),
  },
  (table) => [
    uniqueIndex("content_scores_page_id_idx").on(table.pageId),
    index("content_scores_audit_id_idx").on(table.auditId),
  ],
);

// Per-page entity/topic extraction via LLM (OpenRouter). Populated by the
// entity-extraction workflow phase after the crawl; reads body_text from
// audit_pages. Best-effort — failures skip the page without aborting the audit.
export const pageEntities = sqliteTable(
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
    // JSON array of { name, type, relevance }.
    entitiesJson: text("entities_json").notNull().default("[]"),
    // JSON array of { topic, confidence }.
    topicsJson: text("topics_json").notNull().default("[]"),
    extractedAt: text("extracted_at")
      .notNull()
      .default(sql`(current_timestamp)`),
  },
  (table) => [
    uniqueIndex("page_entities_page_id_idx").on(table.pageId),
    index("page_entities_audit_id_idx").on(table.auditId),
  ],
);
