import { eq } from "drizzle-orm";
import { db } from "@/db";
import { pageEntities } from "@/db/schema";

type PageEntity = typeof pageEntities.$inferSelect;

export type InsertPageEntity = {
  id: string;
  auditId: string;
  pageId: string;
  url: string;
  entitiesJson: string;
  topicsJson: string;
};

/** Replace all page entities for an audit. Called by the audit workflow's
 *  entity-extraction phase; delete-then-insert keeps re-runs/replays idempotent
 *  (mirrors ContentScoreRepository.replaceForAudit). */
async function replaceForAudit(
  auditId: string,
  rows: InsertPageEntity[],
): Promise<void> {
  await db.delete(pageEntities).where(eq(pageEntities.auditId, auditId));
  if (rows.length === 0) return;
  await db.insert(pageEntities).values(rows);
}

/** List entities for an audit, all pages. */
async function listForAudit(auditId: string): Promise<PageEntity[]> {
  return db
    .select()
    .from(pageEntities)
    .where(eq(pageEntities.auditId, auditId));
}

async function getForPage(pageId: string): Promise<PageEntity | null> {
  const rows = await db
    .select()
    .from(pageEntities)
    .where(eq(pageEntities.pageId, pageId))
    .limit(1);
  return rows[0] ?? null;
}

async function clearForAudit(auditId: string): Promise<void> {
  await db.delete(pageEntities).where(eq(pageEntities.auditId, auditId));
}

export const PageEntityRepository = {
  replaceForAudit,
  listForAudit,
  getForPage,
  clearForAudit,
};
