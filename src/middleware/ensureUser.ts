import { createMiddleware } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { resolveUserContextFromHeaders } from "@/middleware/ensure-user/resolve";
import { E2E_ORG_ID } from "@/middleware/ensure-user/hosted";
import type {
  EnsuredProject,
  EnsuredUserContext,
} from "@/middleware/ensure-user/types";
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

// Files whose server functions may run without a session: published CMS
// content (legal pages, blog) is rendered anonymously through SSR loaders.
// Scoped by filename so a colliding function name elsewhere stays gated.
const ANONYMOUS_ALLOWED_FILES = new Set([
  "src/serverFunctions/cms-public.ts",
  "src/serverFunctions/public-cohorts.ts",
]);

export const ensureUserMiddleware = createMiddleware({
  type: "function",
}).server(async ({ next, data, serverFnMeta }) => {
  if (serverFnMeta && ANONYMOUS_ALLOWED_FILES.has(serverFnMeta.filename)) {
    // Published content stays readable with a valid session, a stale
    // session cookie, or no session at all; an authenticated caller still
    // gets its real context downstream. The cms-public handlers never read
    // user fields, so the anonymous shape is safe to assert.
    let resolved: EnsuredUserContext | undefined;
    try {
      resolved = await resolveUserContextFromHeaders(getRequest().headers);
    } catch {
      // Anonymous or expired-session reader: fall through with no user.
    }
    return next({
      // oxlint-disable-next-line typescript-eslint(no-unsafe-type-assertion) -- anonymous readers intentionally carry a partial context; cms-public handlers never read user fields
      context: { ...resolved, project: undefined } as EnsuredUserContext,
    });
  }

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

  const enriched: EnsuredUserContext = { ...context, project };
  return next({ context: enriched });
});
