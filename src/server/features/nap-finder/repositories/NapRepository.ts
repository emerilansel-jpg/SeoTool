import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { napAudits, napResults } from "@/db/schema";

export type NapAudit = typeof napAudits.$inferSelect;
export type NapResult = typeof napResults.$inferSelect;

export type NewNapResult = Omit<NapResult, "id" | "auditId"> & {
  auditId?: string;
};

async function createAudit(input: {
  projectId: string;
  organizationId: string;
  businessName: string;
  city: string;
  phone: string | null;
  address: string | null;
  locationCode: number;
  languageCode: string;
  consistencyScore: number;
}): Promise<NapAudit> {
  const [row] = await db
    .insert(napAudits)
    .values({ id: crypto.randomUUID(), ...input })
    .returning();
  if (!row) throw new Error("Failed to insert nap_audits");
  return row;
}

async function insertResults(
  auditId: string,
  results: Array<Omit<NapResult, "id" | "auditId">>,
): Promise<void> {
  if (results.length === 0) return;
  await db.insert(napResults).values(
    results.map((result) => ({
      id: crypto.randomUUID(),
      auditId,
      ...result,
    })),
  );
}

async function listAudits(projectId: string, limit = 20): Promise<NapAudit[]> {
  return db
    .select()
    .from(napAudits)
    .where(eq(napAudits.projectId, projectId))
    .orderBy(desc(napAudits.createdAt))
    .limit(limit);
}

async function getResultsForAudit(auditId: string): Promise<NapResult[]> {
  return db.select().from(napResults).where(eq(napResults.auditId, auditId));
}

export const NapRepository = {
  createAudit,
  insertResults,
  listAudits,
  getResultsForAudit,
};
