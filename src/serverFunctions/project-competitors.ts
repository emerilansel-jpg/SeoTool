import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
  requireProjectContext,
  requireProjectRole,
} from "@/serverFunctions/middleware";
import { ProjectCompetitorRepository } from "@/server/features/projects/repositories/ProjectCompetitorRepository";

export const listProjectCompetitors = createServerFn({ method: "GET" })
  .middleware([requireProjectContext])
  .validator(z.object({ projectId: z.string() }))
  .handler(async ({ data: { projectId } }) => {
    const rows = await ProjectCompetitorRepository.listForProject(projectId);
    return rows.map((r) => r.domain);
  });

export const addProjectCompetitor = createServerFn({ method: "POST" })
  .middleware([requireProjectContext, requireProjectRole("member")])
  .validator(
    z.object({
      projectId: z.string(),
      domain: z.string().min(1).max(253),
    }),
  )
  .handler(async ({ data }) => {
    await ProjectCompetitorRepository.add(data.projectId, data.domain);
    return { ok: true };
  });
