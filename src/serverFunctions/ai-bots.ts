import { createServerFn } from "@tanstack/react-start";
import { AiBotService } from "@/server/features/ai-bots/services/AiBotService";
import {
  aiBotConnectInputSchema,
  aiBotDashboardInputSchema,
  aiBotDisconnectInputSchema,
  aiBotImportLogInputSchema,
  aiBotRotateTokenInputSchema,
} from "@/types/schemas/ai-bots";
import { AiBotRepository } from "@/server/features/ai-bots/repositories/AiBotRepository";
import { requireProjectContext } from "@/serverFunctions/middleware";

export const getAiBotDashboard = createServerFn({ method: "POST" })
  .middleware([requireProjectContext])
  .validator(aiBotDashboardInputSchema)
  .handler(async ({ data, context }) => {
    return AiBotService.buildDashboard(context.projectId, data.windowDays);
  });

export const connectAiBotSite = createServerFn({ method: "POST" })
  .middleware([requireProjectContext])
  .validator(aiBotConnectInputSchema)
  .handler(async ({ data, context }) => {
    const site = await AiBotService.ensureSite({
      projectId: context.projectId,
      organizationId: context.organizationId,
      domain: data.domain,
    });
    return { domain: site.domain, ingestToken: site.ingestToken };
  });

export const disconnectAiBotSite = createServerFn({ method: "POST" })
  .middleware([requireProjectContext])
  .validator(aiBotDisconnectInputSchema)
  .handler(async ({ context }) => {
    await AiBotRepository.deleteSite(context.projectId);
    return { ok: true };
  });

export const rotateAiBotToken = createServerFn({ method: "POST" })
  .middleware([requireProjectContext])
  .validator(aiBotRotateTokenInputSchema)
  .handler(async ({ context }) => {
    const token = await AiBotService.rotateToken(context.projectId);
    return { ingestToken: token };
  });

export const importAiBotAccessLog = createServerFn({ method: "POST" })
  .middleware([requireProjectContext])
  .validator(aiBotImportLogInputSchema)
  .handler(async ({ data, context }) => {
    return AiBotService.importAccessLog({
      projectId: context.projectId,
      organizationId: context.organizationId,
      domain: data.domain,
      content: data.content,
    });
  });

export const runAiBotRobotsCheck = createServerFn({ method: "POST" })
  .middleware([requireProjectContext])
  .validator(aiBotDashboardInputSchema.pick({ projectId: true }))
  .handler(async ({ context }) => {
    return AiBotService.checkRobotsCompliance(context.projectId);
  });
