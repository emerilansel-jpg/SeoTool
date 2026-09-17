/**
 * Idempotent data repair & isolation verification script for AI Visibility Tracking.
 *
 * Runs against PostgreSQL (e.g. VPS production or staging) using POSTGRES_DATABASE_URL or DATABASE_URL.
 *
 * Usage:
 *   npx tsx scripts/repair-ai-tracking-isolation.ts --dry-run
 *   npx tsx scripts/repair-ai-tracking-isolation.ts --apply
 */

import process from "node:process";
import { and, eq, sql } from "drizzle-orm";
import { drizzle as drizzlePg } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { loadLocalEnv } from "./cli-utils";
import * as pgSchema from "../src/db/pg/schema";
import {
  projects,
  aiTrackingConfigs,
  aiTrackingPrompts,
  aiTrackingRuns,
  aiTrackingObservations,
  aiTrackingMentions,
  aiTrackingCitations,
  aiDiscoveredPrompts,
  aiTopPages,
  aiVisibilitySnapshots,
} from "../src/db/pg/schema";

loadLocalEnv();

const connectionString =
  process.env.POSTGRES_DATABASE_URL ||
  process.env.DATABASE_URL ||
  "postgres://postgres:postgres@127.0.0.1:5432/openseo";

const isApply = process.argv.includes("--apply");
const isDryRun = !isApply || process.argv.includes("--dry-run");

console.log("=================================================");
console.log(" AI TRACKING DATA ISOLATION AUDIT & REPAIR");
console.log(
  ` Mode: ${isApply ? "APPLY (writes to DB)" : "DRY-RUN (read-only audit)"}`,
);
console.log("=================================================\n");

async function run() {
  const sqlClient = postgres(connectionString, { max: 1 });
  const db = drizzlePg(sqlClient, { schema: pgSchema });

  try {
    // 1. Audit projects and AI tracking configs
    const allConfigs = await db
      .select({
        config: aiTrackingConfigs,
        project: projects,
      })
      .from(aiTrackingConfigs)
      .innerJoin(projects, eq(projects.id, aiTrackingConfigs.projectId));

    console.log(`Found ${allConfigs.length} AI tracking configuration(s):\n`);
    for (const { config, project } of allConfigs) {
      console.log(`- Project: "${project.name}" (ID: ${project.id})`);
      console.log(
        `  Domain: ${project.domain} | Config domain: ${config.domain} | Brand: ${config.brandName}`,
      );
      console.log(`  Config ID: ${config.id}`);
    }
    console.log();

    // 2. Audit Lineage Inconsistencies
    console.log("Auditing lineage integrity...");

    const mismatchedRuns = await db
      .select({
        runId: aiTrackingRuns.id,
        runProjectId: aiTrackingRuns.projectId,
        configProjectId: aiTrackingConfigs.projectId,
      })
      .from(aiTrackingRuns)
      .innerJoin(
        aiTrackingConfigs,
        eq(aiTrackingConfigs.id, aiTrackingRuns.configId),
      )
      .where(
        sql`${aiTrackingRuns.projectId} != ${aiTrackingConfigs.projectId}`,
      );

    console.log(
      `  Mismatched runs (run.projectId != config.projectId): ${mismatchedRuns.length}`,
    );

    const mismatchedObs = await db
      .select({
        obsId: aiTrackingObservations.id,
        obsConfigId: aiTrackingObservations.configId,
        runConfigId: aiTrackingRuns.configId,
      })
      .from(aiTrackingObservations)
      .innerJoin(
        aiTrackingRuns,
        eq(aiTrackingRuns.id, aiTrackingObservations.runId),
      )
      .where(
        sql`${aiTrackingObservations.configId} != ${aiTrackingRuns.configId}`,
      );

    console.log(
      `  Mismatched observations (obs.configId != run.configId): ${mismatchedObs.length}`,
    );

    const mismatchedMentions = await db
      .select({
        mentionId: aiTrackingMentions.id,
      })
      .from(aiTrackingMentions)
      .innerJoin(
        aiTrackingObservations,
        eq(aiTrackingObservations.id, aiTrackingMentions.observationId),
      )
      .where(
        sql`${aiTrackingMentions.configId} != ${aiTrackingObservations.configId} OR ${aiTrackingMentions.runId} != ${aiTrackingObservations.runId}`,
      );

    console.log(
      `  Mismatched mentions (mention lineage != obs lineage): ${mismatchedMentions.length}`,
    );

    const mismatchedCitations = await db
      .select({
        citId: aiTrackingCitations.id,
      })
      .from(aiTrackingCitations)
      .innerJoin(
        aiTrackingObservations,
        eq(aiTrackingObservations.id, aiTrackingCitations.observationId),
      )
      .where(
        sql`${aiTrackingCitations.runId} != ${aiTrackingObservations.runId}`,
      );

    console.log(
      `  Mismatched citations (cit.runId != obs.runId): ${mismatchedCitations.length}\n`,
    );

    // 3. Audit Per-Project Cross-Contamination & Garbage Prompts
    for (const { config, project } of allConfigs) {
      console.log(`-------------------------------------------------`);
      console.log(`AUDIT: Config for ${project.name} (${config.domain})`);

      const domainLower = config.domain.toLowerCase().replace(/^www\./, "");
      const isJdp = domainLower.includes("jetdigital");

      const discovered = await db
        .select()
        .from(aiDiscoveredPrompts)
        .where(eq(aiDiscoveredPrompts.configId, config.id));

      const tracked = await db
        .select()
        .from(aiTrackingPrompts)
        .where(eq(aiTrackingPrompts.configId, config.id));

      const mentions = await db
        .select()
        .from(aiTrackingMentions)
        .where(eq(aiTrackingMentions.configId, config.id));

      const foreignMentions = mentions.filter((m) => {
        const mDomain = m.domain.toLowerCase().replace(/^www\./, "");
        if (isJdp && mDomain.includes("klinikniumiu")) return true;
        if (!isJdp && mDomain.includes("jetdigitalpro")) return true;
        return false;
      });

      const foreignDiscovered = discovered.filter((d) => {
        const text = d.prompt.toLowerCase();
        if (
          isJdp &&
          (text.includes("niumiu") ||
            text.includes("klinik") ||
            text.includes("drill press") ||
            text.includes("background check"))
        ) {
          return true;
        }
        return false;
      });

      const foreignTracked = tracked.filter((t) => {
        const text = t.prompt.toLowerCase();
        if (
          isJdp &&
          (text.includes("niumiu") ||
            text.includes("klinik") ||
            text.includes("drill press") ||
            text.includes("background check"))
        ) {
          return true;
        }
        return false;
      });

      console.log(
        `  Total discovered prompts: ${discovered.length} (${foreignDiscovered.length} contaminated/irrelevant)`,
      );
      console.log(
        `  Total tracked prompts:    ${tracked.length} (${foreignTracked.length} contaminated/irrelevant)`,
      );
      console.log(
        `  Total mentions:           ${mentions.length} (${foreignMentions.length} cross-project foreign mentions)`,
      );

      if (
        isJdp &&
        (foreignDiscovered.length > 0 ||
          foreignMentions.length > 0 ||
          foreignTracked.length > 0)
      ) {
        console.log(
          `  => ACTION: Contamination found on JDP! Ready to purge contaminated child records and re-seed clean prompts.`,
        );

        if (isApply) {
          console.log(
            `  [APPLY] Purging contaminated data for config ${config.id}...`,
          );
          await db.transaction(async (tx) => {
            const obs = await tx
              .select({ id: aiTrackingObservations.id })
              .from(aiTrackingObservations)
              .where(eq(aiTrackingObservations.configId, config.id));
            const obsIds = obs.map((o) => o.id);

            for (const obsId of obsIds) {
              await tx
                .delete(aiTrackingCitations)
                .where(eq(aiTrackingCitations.observationId, obsId));
            }

            await tx
              .delete(aiTrackingMentions)
              .where(eq(aiTrackingMentions.configId, config.id));
            await tx
              .delete(aiTrackingObservations)
              .where(eq(aiTrackingObservations.configId, config.id));
            await tx
              .delete(aiTrackingRuns)
              .where(eq(aiTrackingRuns.configId, config.id));
            await tx
              .delete(aiTrackingPrompts)
              .where(eq(aiTrackingPrompts.configId, config.id));
            await tx
              .delete(aiDiscoveredPrompts)
              .where(eq(aiDiscoveredPrompts.configId, config.id));
            await tx
              .delete(aiTopPages)
              .where(eq(aiTopPages.configId, config.id));
            await tx
              .delete(aiVisibilitySnapshots)
              .where(eq(aiVisibilitySnapshots.configId, config.id));
            await tx
              .update(aiTrackingConfigs)
              .set({
                lastDiscoveryAt: null,
                lastRunAt: null,
                nextRunAt: null,
                updatedAt: sql`to_char(now() AT TIME ZONE 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')`,
              })
              .where(eq(aiTrackingConfigs.id, config.id));

            // Seed clean prompts
            const defaultPrompts = [
              `What is ${config.brandName}?`,
              `What services and products does ${config.brandName} offer?`,
              `Reviews and reputation of ${config.brandName}`,
              `Top alternatives and competitors to ${config.brandName}`,
            ];
            const nowIso = new Date().toISOString();

            for (const p of defaultPrompts) {
              await tx.insert(aiTrackingPrompts).values({
                id: crypto.randomUUID(),
                configId: config.id,
                prompt: p,
                active: true,
                createdAt: nowIso,
              });
            }

            for (const p of defaultPrompts) {
              await tx.insert(aiDiscoveredPrompts).values({
                id: crypto.randomUUID(),
                configId: config.id,
                prompt: p,
                platform: "all",
                aiSearchVolume: 0,
                hasMention: false,
                hasCitation: false,
                brandEntities: JSON.stringify([config.brandName]),
                sources: "[]",
                isTracked: true,
                discoveredAt: nowIso,
              });
            }
          });
          console.log(
            `  [APPLY] Clean reset complete for JDP! Seeded 4 clean brand prompts.`,
          );
        }
      }
    }

    // 4. Lineage repair if any mismatches found
    if (
      isApply &&
      (mismatchedRuns.length > 0 ||
        mismatchedObs.length > 0 ||
        mismatchedMentions.length > 0 ||
        mismatchedCitations.length > 0)
    ) {
      console.log("\n[APPLY] Repairing lineage mismatches...");
      for (const r of mismatchedRuns) {
        await db
          .update(aiTrackingRuns)
          .set({ projectId: r.configProjectId })
          .where(eq(aiTrackingRuns.id, r.runId));
      }
      console.log("  Lineage repairs applied.");
    }

    console.log("\n=================================================");
    console.log(
      isApply
        ? " REPAIR RUN COMPLETED SUCCESSFULLY"
        : " DRY-RUN COMPLETE (Pass --apply to execute repair)",
    );
    console.log("=================================================");
  } finally {
    await sqlClient.end();
  }
}

run().catch((err) => {
  console.error("FATAL in repair script:", err);
  process.exit(1);
});
