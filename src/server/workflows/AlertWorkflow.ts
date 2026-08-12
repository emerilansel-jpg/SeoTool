import {
  WorkflowEntrypoint,
  type WorkflowEvent,
  type WorkflowStep,
} from "cloudflare:workers";
import { NonRetryableError } from "cloudflare:workflows";
import { withPgClient } from "@/db";
import { pgStep } from "@/server/workflows/pgStep";
import { db } from "@/db";
import { alertRules } from "@/db/schema";
import { eq } from "drizzle-orm";
import {
  evaluateRankDrop,
  evaluateAuditCritical,
  type AlertCondition,
  type AlertTrigger,
  type RankSnapshotInput,
} from "@/server/features/alerts/alertEvaluator";
import { AlertRepository } from "@/server/features/alerts/repositories/AlertRepository";
import { RankTrackingRepository } from "@/server/features/rank-tracking/repositories/RankTrackingRepository";
import { AuditRepository } from "@/server/features/audit/repositories/AuditRepository";
import { sendAlertNotificationEmail } from "@/server/email/alert-notification";

interface AlertParams {
  alertId: string;
  projectId: string;
}

export class AlertWorkflow extends WorkflowEntrypoint<
  Cloudflare.Env,
  AlertParams
> {
  async run(event: WorkflowEvent<AlertParams>, step: WorkflowStep) {
    return withPgClient(async () => {
      const { alertId, projectId } = event.payload;

      // Step 1: Load the alert rule
      const rule = await pgStep(step, "load-rule", undefined, async () => {
        const rows = await db
          .select()
          .from(alertRules)
          .where(eq(alertRules.id, alertId))
          .limit(1);
        return rows[0] ?? null;
      });

      if (!rule) {
        throw new NonRetryableError(`Alert rule ${alertId} not found`);
      }

      // oxlint-disable-next-line typescript-eslint/no-unsafe-assignment -- JSON.parse is validated by AlertCondition type
      const condition: AlertCondition = JSON.parse(rule.conditionJson);

      // Step 2: Evaluate the condition
      const trigger = await pgStep<AlertTrigger | null>(
        step,
        "evaluate-condition",
        undefined,
        async () => evaluateCondition(rule.metricType, condition, projectId),
      );

      // Step 3: Send email if triggered + mark
      if (trigger) {
        await pgStep(step, "send-notification", undefined, async () => {
          await sendAlertNotificationEmail({
            alertName: rule.name,
            recipients: rule.recipients,
            summary: trigger.summary,
            details: trigger.details,
            dashboardUrl: `https://seotool.im/p/${projectId}`,
          });
          await AlertRepository.markTriggered(alertId);
        });
      }

      // Step 4: Advance nextCheckAt
      await pgStep(step, "advance-schedule", undefined, async () => {
        await AlertRepository.advanceNextCheck(alertId, rule.frequency);
      });
    });
  }
}

async function evaluateCondition(
  metricType: string,
  condition: AlertCondition,
  projectId: string,
): Promise<AlertTrigger | null> {
  if (metricType === "rank_drop") {
    return evaluateRankDropCondition(condition, projectId);
  }
  if (metricType === "audit_critical") {
    return evaluateAuditCriticalCondition(condition, projectId);
  }
  return null;
}

async function evaluateRankDropCondition(
  condition: AlertCondition,
  projectId: string,
): Promise<AlertTrigger | null> {
  const configs = await RankTrackingRepository.getConfigsForProject(projectId);
  if (configs.length === 0) return null;

  // Use the first config (most projects have one active config)
  const config = configs[0];

  // Get current snapshots
  const currentSnapshots =
    await RankTrackingRepository.getLatestSnapshotsForKeywords(config.id);

  // Get previous snapshots (1 day before the latest run)
  const latestRun = await RankTrackingRepository.getLatestRunForConfig(
    config.id,
  );
  if (!latestRun) return null;

  const beforeDate = new Date(latestRun.startedAt);
  beforeDate.setDate(beforeDate.getDate() - 1);

  const previousSnapshots = await RankTrackingRepository.getSnapshotsBeforeDate(
    config.id,
    beforeDate.toISOString(),
  );

  // Map to the evaluator input shape
  const current: RankSnapshotInput[] = currentSnapshots.map((s) => ({
    keyword: s.keyword,
    device: s.device,
    position: s.position,
    url: s.url,
  }));

  const previous: RankSnapshotInput[] = previousSnapshots.map((s) => ({
    keyword: s.keyword,
    device: s.device,
    position: s.position,
    url: s.url,
  }));

  return evaluateRankDrop(condition, current, previous);
}

async function evaluateAuditCriticalCondition(
  condition: AlertCondition,
  projectId: string,
): Promise<AlertTrigger | null> {
  const latestAudit =
    await AuditRepository.getLatestCompletedAuditForProject(projectId);
  if (!latestAudit) return null;

  const issues = await AuditRepository.getIssuesForAudit(latestAudit.id, {
    severity: "critical",
  });

  const rawCompleted = latestAudit.completedAt as unknown;
  const completedAt: Date | null =
    rawCompleted instanceof Date
      ? rawCompleted
      : typeof rawCompleted === "string" && rawCompleted
        ? new Date(rawCompleted)
        : null;

  return evaluateAuditCritical(condition, issues.length, completedAt);
}
