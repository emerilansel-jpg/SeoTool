import { and, eq, lte, or, isNull } from "drizzle-orm";
import { db } from "@/db";
import { aiTrackingConfigs, projects } from "@/db/schema";
import { AiTrackingService } from "./AiTrackingService";
import { customerHasPaidPlan } from "@/server/billing/subscription";
import { isHostedServerAuthMode } from "@/server/lib/runtime-env";

export async function runScheduledAiTracking(_env: Env) {
  const nowIso = new Date().toISOString();
  const isHosted = await isHostedServerAuthMode();

  // Find configs that are active and due for scheduled run
  const dueConfigs = await db
    .select({
      id: aiTrackingConfigs.id,
      projectId: aiTrackingConfigs.projectId,
      organizationId: projects.organizationId,
      schedule: aiTrackingConfigs.schedule,
      nextRunAt: aiTrackingConfigs.nextRunAt,
    })
    .from(aiTrackingConfigs)
    .innerJoin(projects, eq(aiTrackingConfigs.projectId, projects.id))
    .where(
      and(
        eq(aiTrackingConfigs.scheduleStatus, "active"),
        or(
          eq(aiTrackingConfigs.schedule, "daily"),
          eq(aiTrackingConfigs.schedule, "weekly"),
        ),
        or(
          isNull(aiTrackingConfigs.nextRunAt),
          lte(aiTrackingConfigs.nextRunAt, nowIso),
        ),
      ),
    )
    .limit(5);

  for (const config of dueConfigs) {
    try {
      if (isHosted && !(await customerHasPaidPlan(config.organizationId))) {
        continue;
      }

      // Execute tracking run
      await AiTrackingService.runTracking(
        config.projectId,
        {
          organizationId: config.organizationId,
          userId: "system",
          userEmail: "system@cron.local",
          projectId: config.projectId,
        },
        "scheduled",
      );

      // Compute nextRunAt
      const daysToAdd = config.schedule === "weekly" ? 7 : 1;
      const nextDate = new Date(
        Date.now() + daysToAdd * 86400000,
      ).toISOString();

      await db
        .update(aiTrackingConfigs)
        .set({
          nextRunAt: nextDate,
          lastRunAt: nowIso,
          updatedAt: nowIso,
        })
        .where(eq(aiTrackingConfigs.id, config.id));
    } catch (err) {
      console.error(`[cron] AI Tracking failed for config ${config.id}:`, err);
    }
  }
}
