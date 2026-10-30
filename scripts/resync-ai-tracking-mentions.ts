/**
 * Re-evaluates and cleans up false-positive mentions in ai_tracking_mentions
 * using the hardened extraction logic (anti-disclaimer, anti-preamble echo).
 *
 * Usage:
 *   npx tsx scripts/resync-ai-tracking-mentions.ts --dry-run
 *   npx tsx scripts/resync-ai-tracking-mentions.ts --apply
 */

import process from "node:process";
import crypto from "node:crypto";
import { eq, inArray } from "drizzle-orm";
import { drizzle as drizzlePg } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { loadLocalEnv } from "./cli-utils";
import * as pgSchema from "../src/db/pg/schema";
import {
  aiTrackingConfigs,
  aiTrackingObservations,
  aiTrackingMentions,
  aiTrackingCitations,
  projectCompetitors,
} from "../src/db/pg/schema";
import {
  extractMentions,
  type TrackingEntity,
} from "../src/server/features/ai-tracking/extraction";

loadLocalEnv();

const connectionString =
  process.env.POSTGRES_DATABASE_URL ||
  process.env.DATABASE_URL ||
  "postgres://postgres:postgres@127.0.0.1:5432/openseo";

const isApply = process.argv.includes("--apply");

async function main() {
  console.log("=== RESYNC AI TRACKING MENTIONS ===");
  console.log(`Mode: ${isApply ? "APPLY" : "DRY-RUN"}\n`);

  const sqlClient = postgres(connectionString, { max: 1 });
  const db = drizzlePg(sqlClient, { schema: pgSchema });

  try {
    const configs = await db.select().from(aiTrackingConfigs);
    console.log(`Found ${configs.length} configs.`);

    for (const config of configs) {
      console.log(`\nProcessing config: ${config.brandName} (${config.domain})`);

      const brandAliases =
        typeof config.brandAliases === "string"
          ? (JSON.parse(config.brandAliases || "[]") as string[])
          : (config.brandAliases as string[]) || [];

      const rawComps = await db
        .select()
        .from(projectCompetitors)
        .where(eq(projectCompetitors.projectId, config.projectId));

      const entities: TrackingEntity[] = [
        {
          name: config.brandName,
          domain: config.domain,
          aliases: brandAliases,
          isTargetBrand: true,
        },
        ...rawComps.map((c) => ({
          name: c.domain.replace(/\.[^.]+$/, ""),
          domain: c.domain,
          aliases: [],
          isTargetBrand: false,
        })),
      ];

      const obsList = await db
        .select()
        .from(aiTrackingObservations)
        .where(eq(aiTrackingObservations.configId, config.id));

      console.log(`  Observations: ${obsList.length}`);
      if (obsList.length === 0) continue;

      const obsIds = obsList.map((o) => o.id);
      const allCitations = await db
        .select()
        .from(aiTrackingCitations)
        .where(inArray(aiTrackingCitations.observationId, obsIds));

      const citationsByObs = new Map<string, typeof allCitations>();
      for (const c of allCitations) {
        const list = citationsByObs.get(c.observationId) ?? [];
        list.push(c);
        citationsByObs.set(c.observationId, list);
      }

      let removedTargetFalsePositives = 0;
      let newlyExtractedCount = 0;

      for (const obs of obsList) {
        if (!obs.responseText) continue;

        const obsCitations = citationsByObs.get(obs.id) ?? [];
        const newMentions = extractMentions(
          obs.responseText,
          obsCitations,
          entities,
          obs.prompt,
        );

        const oldMentions = await db
          .select()
          .from(aiTrackingMentions)
          .where(eq(aiTrackingMentions.observationId, obs.id));

        const oldTarget = oldMentions.filter((m) => m.isTargetBrand).length;
        const newTarget = newMentions.filter((m) => m.isTargetBrand).length;

        if (oldTarget > 0 && newTarget === 0) {
          removedTargetFalsePositives += oldTarget;
        }
        newlyExtractedCount += newMentions.length;

        if (isApply) {
          await db
            .delete(aiTrackingMentions)
            .where(eq(aiTrackingMentions.observationId, obs.id));

          if (newMentions.length > 0) {
            await db.insert(aiTrackingMentions).values(
              newMentions.map((m) => ({
                id: crypto.randomUUID(),
                observationId: obs.id,
                runId: obs.runId,
                configId: config.id,
                brandName: m.brandName,
                domain: m.domain,
                isTargetBrand: m.isTargetBrand,
                position: m.position,
                sentiment: m.sentiment,
                evidence: m.evidence,
                createdAt: obs.observedAt,
              })),
            );
          }
        }
      }

      console.log(
        `  Target false positives removed: ${removedTargetFalsePositives}`,
      );
      console.log(`  Accurate mentions remaining/saved: ${newlyExtractedCount}`);
    }

    console.log("\nDone!");
  } finally {
    await sqlClient.end();
  }
}

main().catch((err) => {
  console.error("Resync failed:", err);
  process.exit(1);
});
