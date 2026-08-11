// oxlint-disable typescript-eslint/no-explicit-any,typescript-eslint/no-unsafe-call,typescript-eslint/no-unsafe-member-access,typescript-eslint/no-unsafe-type-assertion -- Cloudflare Env workflow binding
import { ReportsRepository } from "@/server/features/reports/repositories/ReportsRepository";

/**
 * Dispatch ReportGenerationWorkflow for every report whose nextRunAt is due.
 * Called from the Worker's scheduled() handler every 15 minutes.
 */
export async function runScheduledReports(env: Env): Promise<void> {
  const now = new Date().toISOString();
  const dueReports = await ReportsRepository.listDue(now);

  for (const report of dueReports) {
    try {
      await (env as any).REPORT_WORKFLOW.create({
        id: `report-gen-${report.id}-${Date.now()}`,
        params: {
          reportId: report.id,
          projectId: report.projectId,
          organizationId: report.organizationId,
        },
      });
    } catch (error) {
      console.error(
        `Failed to dispatch ReportGenerationWorkflow for report ${report.id}:`,
        error,
      );
    }
  }
}
