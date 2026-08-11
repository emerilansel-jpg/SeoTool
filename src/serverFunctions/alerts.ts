import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
  requireProjectContext,
  requireProjectRole,
} from "@/serverFunctions/middleware";
import { AlertService } from "@/server/features/alerts/services/AlertService";
import {
  createAlertRuleSchema,
  updateAlertRuleSchema,
  projectBoundAlertIdSchema,
} from "@/types/schemas/alerts";

export const listAlertRules = createServerFn({ method: "GET" })
  .middleware([requireProjectContext])
  .validator(z.object({ projectId: z.string() }))
  .handler(async ({ data: { projectId } }) => {
    return AlertService.listForProject(projectId);
  });

export const createAlertRule = createServerFn({ method: "POST" })
  .middleware([requireProjectContext, requireProjectRole("member")])
  .validator(createAlertRuleSchema)
  .handler(async ({ data }) => {
    return AlertService.create(data);
  });

export const updateAlertRule = createServerFn({ method: "POST" })
  .middleware([requireProjectContext, requireProjectRole("member")])
  .validator(
    z.object({
      id: z.string(),
      projectId: z.string(),
      data: updateAlertRuleSchema,
    }),
  )
  .handler(async ({ data: { id, projectId, data } }) => {
    return AlertService.update(id, projectId, data);
  });

export const deleteAlertRule = createServerFn({ method: "POST" })
  .middleware([requireProjectContext, requireProjectRole("manager")])
  .validator(projectBoundAlertIdSchema)
  .handler(async ({ data: { id, projectId } }) => {
    await AlertService.delete(id, projectId);
    return { success: true };
  });
