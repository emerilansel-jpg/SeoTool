import { eq, and } from "drizzle-orm";
import { db } from "@/db";
import { projectCompetitors } from "@/db/schema";

export const ProjectCompetitorRepository = {
  async listForProject(projectId: string) {
    return db
      .select()
      .from(projectCompetitors)
      .where(eq(projectCompetitors.projectId, projectId))
      .orderBy(projectCompetitors.createdAt);
  },

  async add(projectId: string, domain: string) {
    const normalized = domain
      .trim()
      .toLowerCase()
      .replace(/^www\./, "");
    if (!normalized) return;
    await db
      .insert(projectCompetitors)
      .values({
        id: crypto.randomUUID(),
        projectId,
        domain: normalized,
      })
      .onConflictDoNothing();
  },

  async remove(projectId: string, domain: string) {
    await db
      .delete(projectCompetitors)
      .where(
        and(
          eq(projectCompetitors.projectId, projectId),
          eq(projectCompetitors.domain, domain),
        ),
      );
  },
};
