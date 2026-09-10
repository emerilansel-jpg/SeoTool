import { createServerFn } from "@tanstack/react-start";
import { customerHasPaidPlan } from "@/server/billing/subscription";
import { AppError } from "@/server/lib/errors";
import { isHostedServerAuthMode } from "@/server/lib/runtime-env";
import { requireProjectContext } from "@/serverFunctions/middleware";
import { AiTrackingService } from "@/server/features/ai-tracking/services/AiTrackingService";
import { AiDiscoveryService } from "@/server/features/ai-tracking/services/AiDiscoveryService";
import {
  addAiTrackingPromptsSchema,
  discoverAiPromptsSchema,
  getAiCitationsSchema,
  getAiCompetitorsSchema,
  getAiPagesSchema,
  getAiTrackingDashboardSchema,
  getDiscoveredPromptsSchema,
  getGscAiCorrelationSchema,
  promoteDiscoveredPromptSchema,
  removeAiTrackingPromptSchema,
  runAiTrackingSchema,
  saveAiTrackingConfigSchema,
  toggleAiTrackingPromptSchema,
} from "@/types/schemas/ai-tracking";

async function assertPaidPlan(organizationId: string) {
  if (!(await isHostedServerAuthMode())) return;
  if (await customerHasPaidPlan(organizationId)) return;
  throw new AppError(
    "PAYMENT_REQUIRED",
    "Upgrade to the paid plan to use AI Tracking",
  );
}

export const getAiTrackingDashboard = createServerFn({ method: "GET" })
  .middleware([requireProjectContext])
  .validator(getAiTrackingDashboardSchema)
  .handler(async ({ data, context }) => {
    return AiTrackingService.getDashboard(context.projectId, data);
  });

export const saveAiTrackingConfig = createServerFn({ method: "POST" })
  .middleware([requireProjectContext])
  .validator(saveAiTrackingConfigSchema)
  .handler(async ({ data, context }) => {
    await assertPaidPlan(context.organizationId);
    return AiTrackingService.saveConfig(context.projectId, data);
  });

export const addAiTrackingPrompts = createServerFn({ method: "POST" })
  .middleware([requireProjectContext])
  .validator(addAiTrackingPromptsSchema)
  .handler(async ({ data, context }) => {
    await assertPaidPlan(context.organizationId);
    await AiTrackingService.addPrompts(context.projectId, data.prompts);
    return { ok: true };
  });

export const toggleAiTrackingPrompt = createServerFn({ method: "POST" })
  .middleware([requireProjectContext])
  .validator(toggleAiTrackingPromptSchema)
  .handler(async ({ data, context }) => {
    await AiTrackingService.togglePrompt(
      context.projectId,
      data.promptId,
      data.active,
    );
    return { ok: true };
  });

export const removeAiTrackingPrompt = createServerFn({ method: "POST" })
  .middleware([requireProjectContext])
  .validator(removeAiTrackingPromptSchema)
  .handler(async ({ data, context }) => {
    await AiTrackingService.removePrompt(context.projectId, data.promptId);
    return { ok: true };
  });

export const runAiTracking = createServerFn({ method: "POST" })
  .middleware([requireProjectContext])
  .validator(runAiTrackingSchema)
  .handler(async ({ context }) => {
    await assertPaidPlan(context.organizationId);
    return AiTrackingService.runTracking(context.projectId, context, "manual");
  });

export const discoverAiPrompts = createServerFn({ method: "POST" })
  .middleware([requireProjectContext])
  .validator(discoverAiPromptsSchema)
  .handler(async ({ context }) => {
    await assertPaidPlan(context.organizationId);
    return AiDiscoveryService.discoverPrompts(context.projectId, context);
  });

export const getDiscoveredPrompts = createServerFn({ method: "POST" })
  .middleware([requireProjectContext])
  .validator(getDiscoveredPromptsSchema)
  .handler(async ({ data, context }) => {
    return AiTrackingService.listDiscoveredPrompts(context.projectId, data);
  });

export const promoteDiscoveredPrompt = createServerFn({ method: "POST" })
  .middleware([requireProjectContext])
  .validator(promoteDiscoveredPromptSchema)
  .handler(async ({ data, context }) => {
    await assertPaidPlan(context.organizationId);
    return AiTrackingService.promoteDiscoveredPrompt(
      context.projectId,
      data.promptId,
    );
  });

export const getAiCitations = createServerFn({ method: "POST" })
  .middleware([requireProjectContext])
  .validator(getAiCitationsSchema)
  .handler(async ({ context }) => {
    return AiTrackingService.getCitations(context.projectId);
  });

export const getAiPages = createServerFn({ method: "POST" })
  .middleware([requireProjectContext])
  .validator(getAiPagesSchema)
  .handler(async ({ context }) => {
    return AiTrackingService.getPages(context.projectId);
  });

export const getAiCompetitors = createServerFn({ method: "POST" })
  .middleware([requireProjectContext])
  .validator(getAiCompetitorsSchema)
  .handler(async ({ context }) => {
    return AiTrackingService.getCompetitors(context.projectId);
  });

export const getGscAiCorrelation = createServerFn({ method: "POST" })
  .middleware([requireProjectContext])
  .validator(getGscAiCorrelationSchema)
  .handler(async ({ data, context }) => {
    return AiTrackingService.getGscCorrelation(context.projectId, data);
  });
