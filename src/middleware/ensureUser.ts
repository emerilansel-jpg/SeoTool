import { createMiddleware } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { resolveUserContextFromHeaders } from "@/middleware/ensure-user/resolve";
import { E2E_ORG_ID } from "@/middleware/ensure-user/hosted";
import type { EnsuredProject } from "@/middleware/ensure-user/types";
import { AppError } from "@/server/lib/errors";
import { ProjectRepository } from "@/server/features/projects/repositories/ProjectRepository";

function extractProjectId(data: unknown) {
  if (!data || typeof data !== "object" || !("projectId" in data)) {
    return null;
  }

  const projectId = (data as { projectId?: unknown }).projectId;
  return typeof projectId === "string" && projectId.length > 0
    ? projectId
    : null;
}

/** Mock project returned during E2E bypass to avoid DB queries for the
 *  fake org. All downstream server functions receive this context. */
function getE2eMockProject(projectId: string): EnsuredProject {
  return {
    id: projectId,
    organizationId: E2E_ORG_ID,
    name: "E2E Test Project",
    domain: null,
    locationCode: 2840,
    languageCode: "en",
    createdAt: new Date().toISOString(),
    archivedAt: null,
  };
}

export const ensureUserMiddleware = createMiddleware({
  type: "function",
}).server(async ({ next, data }) => {
  const context = await resolveUserContextFromHeaders(getRequest().headers);

  const projectId = extractProjectId(data);

  let project: EnsuredProject | undefined;

  if (projectId) {
    // E2E bypass: return a mock project to avoid DB lookups for the fake org.
    if (context.organizationId === E2E_ORG_ID) {
      project = getE2eMockProject(projectId);
    } else {
      // ADR 0001 intentionally keeps project authorization here so every
      // project-scoped server function gets the same request-scoped org+project
      // check before handlers run. Function-level middleware narrows the type.
      project = await ProjectRepository.getProjectForOrganization(
        projectId,
        context.organizationId,
      );

      if (!project) {
        throw new AppError("NOT_FOUND");
      }
    }
  }

  return next({
    context: {
      ...context,
      project,
    },
  });
});
