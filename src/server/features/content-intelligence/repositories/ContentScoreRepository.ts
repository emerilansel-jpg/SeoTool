import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { contentScores } from "@/db/schema";

type ContentScore = typeof contentScores.$inferSelect;

export type InsertContentScore = {
  id: string;
  auditId: string;
  pageId: string;
  url: string;
  score: number;
  depthScore: number;
  headingsScore: number;
  metadataScore: number;
  mediaScore: number;
  linkingScore: number;
  technicalScore: number;
  flagsJson: string;
  wordCount: number;
};

/** Replace all content scores for an audit. Called by the audit workflow's
 *  content-scoring phase; delete-then-insert keeps re-runs/replays idempotent
 *  (mirrors ReportsRepository.replaceSections). */
async function replaceForAudit(
  auditId: string,
  rows: InsertContentScore[],
): Promise<void> {
  await db.delete(contentScores).where(eq(contentScores.auditId, auditId));
  if (rows.length === 0) return;
  await db.insert(contentScores).values(rows);
}

/** List scores for an audit, worst-first (most actionable ordering). */
async function listForAudit(auditId: string): Promise<ContentScore[]> {
  return db
    .select()
    .from(contentScores)
    .where(eq(contentScores.auditId, auditId))
    .orderBy(asc(contentScores.score));
}

/** Lightweight rows (no flagsJson) for summary aggregation: avg score,
 *  distribution buckets, and the worst pages. Worst-first ordering means the
 *  first N rows are the worst pages. */
async function listScoreRowsForAudit(
  auditId: string,
): Promise<Array<{ url: string; score: number; wordCount: number }>> {
  return db
    .select({
      url: contentScores.url,
      score: contentScores.score,
      wordCount: contentScores.wordCount,
    })
    .from(contentScores)
    .where(eq(contentScores.auditId, auditId))
    .orderBy(asc(contentScores.score));
}

async function getForPage(pageId: string): Promise<ContentScore | null> {
  const rows = await db
    .select()
    .from(contentScores)
    .where(eq(contentScores.pageId, pageId))
    .limit(1);
  return rows[0] ?? null;
}

async function clearForAudit(auditId: string): Promise<void> {
  await db.delete(contentScores).where(eq(contentScores.auditId, auditId));
}

export const ContentScoreRepository = {
  replaceForAudit,
  listForAudit,
  listScoreRowsForAudit,
  getForPage,
  clearForAudit,
};
