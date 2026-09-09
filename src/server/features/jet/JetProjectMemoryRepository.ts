import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { jetProjectMemory } from "@/db/schema";

// Backing store for Jet's writable context blocks ("memory", "research_log").
// One row per (project, label); every chat session DO in a project reads and
// writes the same rows.

async function getBlock(
  projectId: string,
  label: string,
): Promise<string | null> {
  const [row] = await db
    .select({ content: jetProjectMemory.content })
    .from(jetProjectMemory)
    .where(
      and(
        eq(jetProjectMemory.projectId, projectId),
        eq(jetProjectMemory.label, label),
      ),
    )
    .limit(1);
  return row?.content ?? null;
}

async function setBlock(
  projectId: string,
  label: string,
  content: string,
): Promise<void> {
  await db
    .insert(jetProjectMemory)
    .values({ projectId, label, content })
    .onConflictDoUpdate({
      target: [jetProjectMemory.projectId, jetProjectMemory.label],
      set: { content, updatedAt: new Date().toISOString() },
    });
}

export const JetProjectMemoryRepository = {
  getBlock,
  setBlock,
} as const;

export const SamProjectMemoryRepository = JetProjectMemoryRepository;
