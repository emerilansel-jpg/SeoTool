import { and, desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { indexNowKeys, indexNowSubmissions } from "@/db/schema";

export type IndexNowKey = typeof indexNowKeys.$inferSelect;
export type IndexNowSubmission = typeof indexNowSubmissions.$inferSelect;

async function getByProjectId(projectId: string): Promise<IndexNowKey | null> {
  const rows = await db
    .select()
    .from(indexNowKeys)
    .where(eq(indexNowKeys.projectId, projectId))
    .limit(1);
  return rows[0] ?? null;
}

async function upsertKey(input: {
  projectId: string;
  organizationId: string;
  host: string;
  key: string;
}): Promise<IndexNowKey> {
  const [row] = await db
    .insert(indexNowKeys)
    .values({ id: crypto.randomUUID(), ...input })
    .onConflictDoUpdate({
      target: indexNowKeys.projectId,
      set: {
        host: input.host,
        organizationId: input.organizationId,
        updatedAt: sql`(current_timestamp)`,
      },
    })
    .returning();
  if (!row) throw new Error("Failed to upsert indexnow_keys");
  return row;
}

async function markVerified(
  projectId: string,
  verified: boolean,
  lastError: string | null,
): Promise<void> {
  await db
    .update(indexNowKeys)
    .set({
      status: verified ? "verified" : "pending",
      verifiedAt: verified ? new Date().toISOString() : null,
      lastError,
      updatedAt: sql`(current_timestamp)`,
    })
    .where(eq(indexNowKeys.projectId, projectId));
}

async function setAutoSubmit(
  projectId: string,
  autoSubmit: boolean,
): Promise<void> {
  await db
    .update(indexNowKeys)
    .set({ autoSubmit, updatedAt: sql`(current_timestamp)` })
    .where(eq(indexNowKeys.projectId, projectId));
}

async function touchAutoSubmittedAt(projectId: string): Promise<void> {
  await db
    .update(indexNowKeys)
    .set({
      autoSubmittedAt: new Date().toISOString(),
      updatedAt: sql`(current_timestamp)`,
    })
    .where(eq(indexNowKeys.projectId, projectId));
}

async function deleteKey(projectId: string): Promise<void> {
  await db.delete(indexNowKeys).where(eq(indexNowKeys.projectId, projectId));
}

async function recordSubmission(input: {
  projectId: string;
  organizationId: string;
  host: string;
  urls: string[];
  trigger: "manual" | "auto_audit";
  status: "success" | "partial" | "failed" | "skipped";
  responseStatus: number | null;
  responseSummary: string | null;
}): Promise<IndexNowSubmission> {
  const [row] = await db
    .insert(indexNowSubmissions)
    .values({
      id: crypto.randomUUID(),
      projectId: input.projectId,
      organizationId: input.organizationId,
      host: input.host,
      urls: JSON.stringify(input.urls),
      urlCount: input.urls.length,
      trigger: input.trigger,
      status: input.status,
      responseStatus: input.responseStatus,
      responseSummary: input.responseSummary,
    })
    .returning();
  if (!row) throw new Error("Failed to record indexnow_submissions");
  return row;
}

async function listSubmissions(
  projectId: string,
  limit = 25,
): Promise<IndexNowSubmission[]> {
  return db
    .select()
    .from(indexNowSubmissions)
    .where(eq(indexNowSubmissions.projectId, projectId))
    .orderBy(desc(indexNowSubmissions.createdAt))
    .limit(limit);
}

/** Hosts with a verified key + autoSubmit — the audit-completion hook's work list. */
async function getAutoSubmitProjects(): Promise<
  Array<{ projectId: string; host: string; key: string }>
> {
  const rows = await db
    .select({
      projectId: indexNowKeys.projectId,
      host: indexNowKeys.host,
      key: indexNowKeys.key,
    })
    .from(indexNowKeys)
    .where(
      and(
        eq(indexNowKeys.autoSubmit, true),
        eq(indexNowKeys.status, "verified"),
      ),
    );
  return rows;
}

export const IndexNowRepository = {
  getByProjectId,
  upsertKey,
  markVerified,
  setAutoSubmit,
  touchAutoSubmittedAt,
  deleteKey,
  recordSubmission,
  listSubmissions,
  getAutoSubmitProjects,
};
