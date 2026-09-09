import { createServerFn } from "@tanstack/react-start";
import { customerHasPaidPlan } from "@/server/billing/subscription";
import { AppError } from "@/server/lib/errors";
import { isHostedServerAuthMode } from "@/server/lib/runtime-env";
import { requireProjectContext } from "@/serverFunctions/middleware";
import { AiTrackingService } from "@/server/features/ai-tracking/services/AiTrackingService";
import {
  addAiTrackingPromptsSchema,
  getAiTrackingDashboardSchema,
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
