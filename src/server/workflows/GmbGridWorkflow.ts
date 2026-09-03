import {
  WorkflowEntrypoint,
  type WorkflowEvent,
  type WorkflowStep,
} from "cloudflare:workers";
import { withPgClient } from "@/db";
import type { BillingCustomerContext } from "@/server/billing/subscription";
import { GmbGridRepository } from "@/server/features/gmb-grid/repositories/GmbGridRepository";
import { calculateGmbMetrics } from "@/server/features/gmb-grid/gmb-grid";
import {
  createDataforseoClient,
  fetchMapsTaskResult,
  type PostedMapsTask,
} from "@/server/lib/dataforseo";
import { pgStep } from "./pgStep";

const SINGLE_ATTEMPT = {
  retries: { limit: 0, delay: "1 second" as const },
  timeout: "2 minutes" as const,
};
const COLLECT_CONFIG = {
  retries: { limit: 1, delay: "5 seconds" as const },
  timeout: "2 minutes" as const,
};
const POLL_INTERVALS = [
  "30 seconds",
  "1 minute",
  "2 minutes",
  "3 minutes",
  "5 minutes",
] as const;
const TASK_GETS_PER_STEP = 25;

export interface GmbGridWorkflowParams {
  runId: string;
  configId: string;
  projectId: string;
  billingCustomer: BillingCustomerContext;
  trigger: "manual" | "scheduled";
}

async function collectTasks(input: {
  tasks: PostedMapsTask[];
  placeId: string;
  businessName: string;
}) {
  const checkedAt = new Date().toISOString();
  const outcomes = await Promise.all(
    input.tasks.map(async (task) => {
      try {
        return {
          task,
          outcome: await fetchMapsTaskResult({
            taskId: task.taskId,
            placeId: input.placeId,
            businessName: input.businessName,
          }),
        };
      } catch (error) {
        return {
          task,
          outcome: {
            status: "failed" as const,
            code: "TASK_GET_FAILED",
            message:
              error instanceof Error ? error.message : "Task collection failed",
          },
        };
      }
    }),
  );

  const stillPending: PostedMapsTask[] = [];
  const updates: Array<{
    id: string;
    data: {
      status: "completed" | "failed";
      rank?: number | null;
      errorCode?: string | null;
      errorMessage?: string | null;
      itemsJson?: string | null;
      checkedAt: string;
    };
  }> = [];
  for (const { task, outcome } of outcomes) {
    if (outcome.status === "pending") {
      stillPending.push(task);
    } else if (outcome.status === "completed") {
      updates.push({
        id: task.snapshotId,
        data: {
          status: "completed",
          rank: outcome.rank,
          errorCode: null,
          errorMessage: null,
          itemsJson: outcome.items ? JSON.stringify(outcome.items) : null,
          checkedAt,
        },
      });
    } else {
      updates.push({
        id: task.snapshotId,
        data: {
          status: "failed",
          errorCode: outcome.code,
          errorMessage: outcome.message.slice(0, 500),
          checkedAt,
        },
      });
    }
  }
  await GmbGridRepository.updateSnapshots(updates);
  return { stillPending, settled: updates.length };
}

async function finalizeRun(runId: string) {
  const snapshots = await GmbGridRepository.getSnapshotsForRun(runId);
  const metrics = calculateGmbMetrics(snapshots);
  const status =
    metrics.completedPoints === 0
      ? ("failed" as const)
      : metrics.failedPoints > 0
        ? ("partial" as const)
        : ("completed" as const);
  await GmbGridRepository.updateRun(runId, {
    ...metrics,
    status,
    completedAt: new Date().toISOString(),
    ...(status === "failed"
      ? {
          errorCode: "NO_POINTS_COMPLETED",
          errorMessage: "No grid points could be collected",
        }
      : {}),
  });
}

export class GmbGridWorkflow extends WorkflowEntrypoint<
  Env,
  GmbGridWorkflowParams
> {
  async run(event: WorkflowEvent<GmbGridWorkflowParams>, step: WorkflowStep) {
    return withPgClient(() => this.runScoped(event, step));
  }

  private async runScoped(
    event: WorkflowEvent<GmbGridWorkflowParams>,
    step: WorkflowStep,
  ) {
    const { runId, configId, projectId, billingCustomer } = event.payload;
    try {
      const prepared = await pgStep(
        step,
        "prepare",
        SINGLE_ATTEMPT,
        async () => {
          const config = await GmbGridRepository.getConfigById(
            configId,
            projectId,
          );
          const run = await GmbGridRepository.getRunById(runId);
          if (!config || !run || !config.isActive) {
            throw new Error("Grid configuration or run is no longer active");
          }
          await GmbGridRepository.updateRun(runId, { status: "running" });
          const snapshots = await GmbGridRepository.getSnapshotsForRun(runId);
          return { config, snapshots };
        },
      );

      const client = createDataforseoClient(billingCustomer);
      const postedResult = await pgStep(
        step,
        "post-maps-tasks",
        SINGLE_ATTEMPT,
        async () => {
          const result = await client.serp.mapsTaskPost({
            tasks: prepared.snapshots.map((snapshot) => ({
              snapshotId: snapshot.id,
              keyword: prepared.config.keyword,
              lat: snapshot.lat,
              lng: snapshot.lng,
            })),
            languageCode: prepared.config.languageCode,
            device: prepared.config.device,
            zoom: prepared.config.mapZoom,
            depth: 20,
            quotaUnits: prepared.snapshots.length,
          });
          const acceptedIds = new Set(
            result.tasks.map((task) => task.snapshotId),
          );
          await GmbGridRepository.updateSnapshots([
            ...result.tasks.map((task) => ({
              id: task.snapshotId,
              data: { taskId: task.taskId },
            })),
            ...prepared.snapshots
              .filter((snapshot) => !acceptedIds.has(snapshot.id))
              .map((snapshot) => ({
                id: snapshot.id,
                data: {
                  status: "failed" as const,
                  errorCode: "TASK_REJECTED",
                  errorMessage: "Provider did not accept this grid point",
                  checkedAt: new Date().toISOString(),
                },
              })),
          ]);
          await GmbGridRepository.updateRun(runId, { costUsd: result.costUsd });
          return result.tasks;
        },
      );

      let pending = postedResult;
      for (
        let round = 0;
        round < POLL_INTERVALS.length && pending.length > 0;
        round++
      ) {
        await step.sleep(`wait-${round}`, POLL_INTERVALS[round]);
        const batch = pending.slice(0, TASK_GETS_PER_STEP);
        const overflow = pending.slice(TASK_GETS_PER_STEP);
        const result = await pgStep(
          step,
          `collect-${round}`,
          COLLECT_CONFIG,
          () =>
            collectTasks({
              tasks: batch,
              placeId: prepared.config.placeId,
              businessName: prepared.config.businessName,
            }),
        );
        pending = [...overflow, ...result.stillPending];
      }

      if (pending.length > 0) {
        await pgStep(step, "mark-timeouts", SINGLE_ATTEMPT, async () => {
          const checkedAt = new Date().toISOString();
          await GmbGridRepository.updateSnapshots(
            pending.map((task) => ({
              id: task.snapshotId,
              data: {
                status: "failed" as const,
                errorCode: "PROVIDER_TIMEOUT",
                errorMessage:
                  "Provider task did not finish within the polling window",
                checkedAt,
              },
            })),
          );
        });
      }

      await pgStep(step, "finalize", SINGLE_ATTEMPT, () => finalizeRun(runId));
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown grid scan error";
      await pgStep(step, "mark-failed", SINGLE_ATTEMPT, async () => {
        const run = await GmbGridRepository.getRunById(runId);
        if (run?.status === "pending" || run?.status === "running") {
          await GmbGridRepository.updateRun(runId, {
            status: "failed",
            errorCode: "GRID_SCAN_FAILED",
            errorMessage: message.slice(0, 500),
            completedAt: new Date().toISOString(),
          });
        }
      });
      throw error;
    }
  }
}
