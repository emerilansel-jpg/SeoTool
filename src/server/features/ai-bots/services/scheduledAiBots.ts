import { AiBotRepository } from "../repositories/AiBotRepository";

// Cron body for the Worker `scheduled` handler: roll up yesterday's raw AI-bot
// hits into ai_bot_daily_stats so the dashboard reads aggregates instead of
// scanning the raw table. The 15-minute cron calls this; the day guard keeps
// it to one effective run per UTC day.
export async function runScheduledAiBots(env: Env) {
  const now = new Date();
  // Roll up the previous UTC day (today's data is still landing).
  now.setUTCDate(now.getUTCDate() - 1);
  const day = now.toISOString().slice(0, 10);

  try {
    const targets = await AiBotRepository.projectsWithHitsOnDay(day);
    if (targets.length === 0) return;

    let rolledUp = 0;
    for (const target of targets) {
      try {
        rolledUp += await AiBotRepository.rollupDay(target);
      } catch (error) {
        console.error(
          `[cron] AI bot rollup failed for project ${target.projectId}:`,
          error,
        );
      }
    }
    console.log(
      `[cron] AI bot rollup for ${day}: ${targets.length} projects, ${rolledUp} bot groups`,
    );
  } catch (error) {
    console.error("[cron] AI bot rollup failed:", error);
  }
  void env;
}
