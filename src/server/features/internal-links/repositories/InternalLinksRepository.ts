import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { internalLinkSuggestions } from "@/db/schema";

export type InternalLinkSuggestion =
  typeof internalLinkSuggestions.$inferSelect;

async function insertSuggestions(
  rows: Array<Omit<InternalLinkSuggestion, "id" | "createdAt" | "status">>,
): Promise<number> {
  if (rows.length === 0) return 0;
  // Skip pairs already suggested (any status) so re-runs don't duplicate.
  const existing = await db
    .select({
      sourceUrl: internalLinkSuggestions.sourceUrl,
      targetUrl: internalLinkSuggestions.targetUrl,
      targetKeyword: internalLinkSuggestions.targetKeyword,
    })
    .from(internalLinkSuggestions)
    .where(eq(internalLinkSuggestions.projectId, rows[0].projectId));
  const seen = new Set(
    existing.map(
      (row) => `${row.sourceUrl}\n${row.targetUrl}\n${row.targetKeyword}`,
    ),
  );

  const fresh = rows.filter(
    (row) =>
      !seen.has(`${row.sourceUrl}\n${row.targetUrl}\n${row.targetKeyword}`),
  );
  if (fresh.length === 0) return 0;

  await db.insert(internalLinkSuggestions).values(
    fresh.map((row) => ({
      id: crypto.randomUUID(),
      status: "pending" as const,
      ...row,
    })),
  );
  return fresh.length;
}

async function listSuggestions(
  projectId: string,
  status?: InternalLinkSuggestion["status"],
): Promise<InternalLinkSuggestion[]> {
  const conditions = [eq(internalLinkSuggestions.projectId, projectId)];
  if (status) conditions.push(eq(internalLinkSuggestions.status, status));
  return db
    .select()
    .from(internalLinkSuggestions)
    .where(and(...conditions))
    .orderBy(desc(internalLinkSuggestions.createdAt))
    .limit(300);
}

async function setStatus(
  projectId: string,
  suggestionId: string,
  status: InternalLinkSuggestion["status"],
): Promise<void> {
  await db
    .update(internalLinkSuggestions)
    .set({ status })
    .where(
      and(
        eq(internalLinkSuggestions.projectId, projectId),
        eq(internalLinkSuggestions.id, suggestionId),
      ),
    );
}

export const InternalLinksRepository = {
  insertSuggestions,
  listSuggestions,
  setStatus,
};
