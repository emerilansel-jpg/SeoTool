import { AlertRepository } from "../repositories/AlertRepository";

/**
 * Dispatch alert workflows for all due alert rules. Called from the cron
 * `scheduled()` handler. Follows the same pattern as `runScheduledReports`:
 * query due items, loop, dispatch workflow, per-item try/catch.
 */
export async function runScheduledAlerts(env: Env) {
  const now = new Date();
  const dueRules = await AlertRepository.listDue(now);

  for (const rule of dueRules) {
    try {
      // Eagerly advance nextCheckAt to prevent retry storms if the workflow
      // fails (same pattern as runScheduledRankChecks).
      await AlertRepository.advanceNextCheck(rule.id, rule.frequency);

      await env.ALERT_WORKFLOW.create({
        id: `alert-${rule.id}-${Date.now()}`,
        params: {
          alertId: rule.id,
          projectId: rule.projectId,
        },
      });
    } catch (error) {
      console.error(`Failed to dispatch alert workflow for ${rule.id}:`, error);
    }
  }
}
