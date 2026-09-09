import { and, desc, eq, isNull } from "drizzle-orm";
import { db } from "@/db";
import { jetSessions } from "@/db/schema";

type CreateJetSessionInput = {
  projectId: string;
  userId: string;
};

async function createSession(input: CreateJetSessionInput) {
  const id = crypto.randomUUID();
  const [row] = await db
    .insert(jetSessions)
    .values({
      id,
      projectId: input.projectId,
      userId: input.userId,
    })
    .returning();
  return row;
}

// Callers must have already authorized the project (requireProjectContext).
// Scoped to userId so a project member only sees their own sessions.
async function listSessionsForProject(projectId: string, userId: string) {
  return db
    .select({
      id: jetSessions.id,
      title: jetSessions.title,
      createdAt: jetSessions.createdAt,
      updatedAt: jetSessions.updatedAt,
    })
    .from(jetSessions)
    .where(
      and(
        eq(jetSessions.projectId, projectId),
        eq(jetSessions.userId, userId),
        isNull(jetSessions.archivedAt),
      ),
    )
    .orderBy(desc(jetSessions.updatedAt), desc(jetSessions.id));
}

// Look up a session by id alone (no scoping). Only for the JetChatAgent
// Durable Object, whose connections are authorized in the Worker before they
// reach the DO; the DO derives its project/user (and, via the project, its
// org) from this row.
async function getSessionById(id: string) {
  const [row] = await db
    .select()
    .from(jetSessions)
    .where(eq(jetSessions.id, id))
    .limit(1);
  return row ?? null;
}

// Look up a caller's own active session by id, scoped to userId so one org
// member can't act on another's session.
async function getActiveSession(id: string, userId: string) {
  const [row] = await db
    .select()
    .from(jetSessions)
    .where(
      and(
        eq(jetSessions.id, id),
        eq(jetSessions.userId, userId),
        isNull(jetSessions.archivedAt),
      ),
    )
    .limit(1);
  return row ?? null;
}

// Set the title from the first user message and bump updatedAt so the session
// sorts to the top of the side-panel. Called by the DO on the first turn.
async function setTitle(id: string, title: string) {
  await db
    .update(jetSessions)
    .set({ title, updatedAt: new Date().toISOString() })
    .where(eq(jetSessions.id, id));
}

async function touch(id: string) {
  await db
    .update(jetSessions)
    .set({ updatedAt: new Date().toISOString() })
    .where(eq(jetSessions.id, id));
}

// Callers must have already authorized the session's project.
async function archiveSession(id: string) {
  await db
    .update(jetSessions)
    .set({ archivedAt: new Date().toISOString() })
    .where(eq(jetSessions.id, id));
}

export const JetSessionRepository = {
  createSession,
  listSessionsForProject,
  getSessionById,
  getActiveSession,
  setTitle,
  touch,
  archiveSession,
} as const;

export const SamSessionRepository = JetSessionRepository;
