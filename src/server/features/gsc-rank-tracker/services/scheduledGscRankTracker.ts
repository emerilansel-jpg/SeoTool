import { db } from "@/db";
import { gscConnections } from "@/db/schema";
import { GscRankTrackerService } from "./GscRankTrackerService";

// Cron body for the Worker `scheduled` handler: incremental GSC sync for every
// connected project. Failures are per-project and logged, never fatal — GSC
// grants may be revoked independently.
export async function runScheduledGscRankTracker(env: Env) {
  try {
    const connections = await db
      .select({
        projectId: gscConnections.projectId,
      })
      .from(gscConnections);

    let synced = 0;
    for (const connection of connections) {
      try {
        const result = await GscRankTrackerService.syncProject(
          connection.projectId,
        );
        if (result.synced) {
          synced += 1;
        }
      } catch (error) {
        console.error(
          `[cron] GSC rank tracker sync failed for project ${connection.projectId}:`,
          error,
        );
      }
    }
    if (connections.length > 0) {
      console.log(
        `[cron] GSC rank tracker: ${synced}/${connections.length} projects synced`,
      );
    }
  } catch (error) {
    console.error("[cron] GSC rank tracker sync failed:", error);
  }
  void env;
}
