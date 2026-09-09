import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
  requireAuthenticatedContext,
  requireProjectContext,
} from "@/serverFunctions/middleware";
import { AppError } from "@/server/lib/errors";
import { JetSessionRepository } from "@/server/features/jet/JetSessionRepository";
import { ProjectRepository } from "@/server/features/projects/repositories/ProjectRepository";

const projectScopedSchema = z.object({ projectId: z.string().min(1) });

// Lists the Jet chat sessions for a project (newest first) for the side-panel.
export const listJetSessions = createServerFn({ method: "GET" })
  .middleware([requireProjectContext])
  .validator(projectScopedSchema)
  .handler(async ({ context }) => {
    return JetSessionRepository.listSessionsForProject(
      context.projectId,
      context.userId,
    );
  });

// Creates a new Jet chat session and returns its id; the client then opens a DO
// connection keyed by that id.
export const createJetSession = createServerFn({ method: "POST" })
  .middleware([requireProjectContext])
  .validator(projectScopedSchema)
  .handler(async ({ context }) => {
    const session = await JetSessionRepository.createSession({
      projectId: context.projectId,
      userId: context.userId,
    });
    if (!session) {
      throw new AppError("INTERNAL_ERROR", "Failed to create chat session");
    }
    return { id: session.id };
  });

const archiveSchema = z.object({ sessionId: z.string().min(1) });

// Archives a Jet chat session: it disappears from the list and can no longer
// be opened, but the registry row and the DO's transcript are kept.
export const archiveJetSession = createServerFn({ method: "POST" })
  .middleware([requireAuthenticatedContext])
  .validator(archiveSchema)
  .handler(async ({ data, context }) => {
    const session = await JetSessionRepository.getActiveSession(
      data.sessionId,
      context.userId,
    );
    const project = session
      ? await ProjectRepository.getProjectForOrganization(
          session.projectId,
          context.organizationId,
        )
      : null;
    if (!session || !project) {
      throw new AppError("NOT_FOUND", "Chat session not found");
    }
    await JetSessionRepository.archiveSession(data.sessionId);
    return { ok: true };
  });

// Backward-compatibility aliases
export const listSamSessions = listJetSessions;
export const createSamSession = createJetSession;
export const archiveSamSession = archiveJetSession;
