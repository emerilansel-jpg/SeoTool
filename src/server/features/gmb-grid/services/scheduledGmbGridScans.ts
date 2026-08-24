import { customerHasPaidPlan } from "@/server/billing/subscription";
import { GmbGridRepository } from "../repositories/GmbGridRepository";
import { GmbGridService } from "./GmbGridService";
import { generateGridNodes } from "@/server/utils/geo-grid";
import { isHostedServerAuthMode } from "@/server/lib/runtime-env";

export async function runScheduledGmbGridScans(env: Env) {
  const due = await GmbGridRepository.getDueConfigsWithOrganization(
    new Date().toISOString(),
  );
  const isHosted = await isHostedServerAuthMode();

  for (const { config, organizationId } of due) {
    let createdRunId: string | null = null;
    try {
      if (config.scheduleInterval === "manual") continue;
      if (isHosted && !(await customerHasPaidPlan(organizationId))) continue;

      await GmbGridRepository.updateConfig(config.id, {
        nextCheckAt: GmbGridService.computeNextCheckAt(config.scheduleInterval),
        updatedAt: new Date().toISOString(),
      });

      const runId = crypto.randomUUID();
      const inserted = await GmbGridRepository.tryCreateRun({
        id: runId,
        configId: config.id,
        status: "pending",
        trigger: "scheduled",
        totalPoints: config.gridSize * config.gridSize,
      });
      if (!inserted) continue;
      createdRunId = runId;

      await GmbGridRepository.insertSnapshots(
        generateGridNodes(
          config.centerLat,
          config.centerLng,
          config.gridSize,
          config.radiusMeters,
        ).map((node) => ({
          id: crypto.randomUUID(),
          runId,
          lat: node.lat,
          lng: node.lng,
          gridRow: node.gridRow,
          gridCol: node.gridCol,
          status: "pending" as const,
        })),
      );

      await env.GMB_GRID_WORKFLOW.create({
        id: runId,
        params: {
          runId,
          configId: config.id,
          projectId: config.projectId,
          billingCustomer: {
            userId: "system",
            userEmail: "system@seotool.im",
            organizationId,
            projectId: config.projectId,
          },
          trigger: "scheduled",
        },
      });
    } catch (error) {
      if (createdRunId) {
        await GmbGridRepository.updateRun(createdRunId, {
          status: "failed",
          errorCode: "SCHEDULED_START_FAILED",
          errorMessage:
            error instanceof Error
              ? error.message.slice(0, 500)
              : "Failed to start scheduled scan",
          completedAt: new Date().toISOString(),
        });
      }
      console.error(`[gmb-grid] scheduled config ${config.id} failed`, error);
    }
  }
}
