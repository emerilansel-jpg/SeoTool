import { and, desc, eq, gte, inArray, lte } from "drizzle-orm";
import { db } from "@/db";
import { runBatch } from "@/db/runBatch";
import {
  brandLookupPlatformSnapshots,
  brandLookupSnapshots,
  brandLookupSovEntries,
} from "@/db/schema";
import type {
  BrandLookupInput,
  BrandLookupResult,
} from "@/types/schemas/ai-search";

export type PersistedBrandLookupSnapshot =
  typeof brandLookupSnapshots.$inferSelect;
export type PersistedPlatformSnapshot =
  typeof brandLookupPlatformSnapshots.$inferSelect;
export type PersistedSovEntry = typeof brandLookupSovEntries.$inferSelect;

export type BrandLookupSnapshotWithRelations = PersistedBrandLookupSnapshot & {
  platforms: PersistedPlatformSnapshot[];
  sovEntries: PersistedSovEntry[];
};

export const BrandLookupRepository = {
  async persistSnapshot(
    projectId: string,
    input: Pick<BrandLookupInput, "locationCode" | "languageCode">,
    result: BrandLookupResult,
  ): Promise<string> {
    const snapshotDate = result.fetchedAt.slice(0, 10);
    const targetType = result.detectedTargetType;
    const targetValue = result.resolvedTarget.toLowerCase().trim();
    const locationCode = input.locationCode;
    const languageCode = input.languageCode.toLowerCase().trim();
    const now = new Date().toISOString();

    const existing = await db
      .select({ id: brandLookupSnapshots.id })
      .from(brandLookupSnapshots)
      .where(
        and(
          eq(brandLookupSnapshots.projectId, projectId),
          eq(brandLookupSnapshots.snapshotDate, snapshotDate),
          eq(brandLookupSnapshots.targetType, targetType),
          eq(brandLookupSnapshots.targetValue, targetValue),
          eq(brandLookupSnapshots.locationCode, locationCode),
          eq(brandLookupSnapshots.languageCode, languageCode),
        ),
      )
      .limit(1);

    const snapshotId = existing[0]?.id ?? crypto.randomUUID();

    const platformRows = result.perPlatform.map((p) => ({
      id: crypto.randomUUID(),
      snapshotId,
      platform: p.platform,
      status: p.status,
      mentions: p.mentions,
      aiSearchVolume: p.aiSearchVolume,
    }));

    const sovRows = (result.shareOfVoice?.entries ?? []).map(
      (entry, index) => ({
        id: crypto.randomUUID(),
        snapshotId,
        label: entry.label,
        isTarget: entry.isTarget,
        mentions: entry.mentions,
        sharePct: entry.sharePct,
        sortOrder: index,
      }),
    );

    await runBatch((tx) => [
      tx
        .insert(brandLookupSnapshots)
        .values({
          id: snapshotId,
          projectId,
          snapshotDate,
          query: result.query,
          targetType,
          targetValue,
          locationCode,
          languageCode,
          fetchedAt: result.fetchedAt,
          hasData: result.hasData,
          totalMentions: result.totalMentions,
          totalAiSearchVolume: result.totalAiSearchVolume,
          createdAt: now,
          updatedAt: now,
        })
        .onConflictDoUpdate({
          target: [
            brandLookupSnapshots.projectId,
            brandLookupSnapshots.snapshotDate,
            brandLookupSnapshots.targetType,
            brandLookupSnapshots.targetValue,
            brandLookupSnapshots.locationCode,
            brandLookupSnapshots.languageCode,
          ],
          set: {
            query: result.query,
            fetchedAt: result.fetchedAt,
            hasData: result.hasData,
            totalMentions: result.totalMentions,
            totalAiSearchVolume: result.totalAiSearchVolume,
            updatedAt: now,
          },
        }),
      tx
        .delete(brandLookupPlatformSnapshots)
        .where(eq(brandLookupPlatformSnapshots.snapshotId, snapshotId)),
      tx
        .delete(brandLookupSovEntries)
        .where(eq(brandLookupSovEntries.snapshotId, snapshotId)),
      ...platformRows.map((row) =>
        tx.insert(brandLookupPlatformSnapshots).values(row),
      ),
      ...sovRows.map((row) => tx.insert(brandLookupSovEntries).values(row)),
    ]);

    return snapshotId;
  },

  async getLatestSnapshot(
    projectId: string,
    targetValue?: string,
  ): Promise<BrandLookupSnapshotWithRelations | null> {
    const conditions = [eq(brandLookupSnapshots.projectId, projectId)];
    if (targetValue) {
      conditions.push(
        eq(brandLookupSnapshots.targetValue, targetValue.toLowerCase().trim()),
      );
    }

    const rows = await db
      .select()
      .from(brandLookupSnapshots)
      .where(and(...conditions))
      .orderBy(desc(brandLookupSnapshots.snapshotDate))
      .limit(1);

    const snapshot = rows[0];
    if (!snapshot) return null;

    const [platforms, sovEntries] = await Promise.all([
      db
        .select()
        .from(brandLookupPlatformSnapshots)
        .where(eq(brandLookupPlatformSnapshots.snapshotId, snapshot.id)),
      db
        .select()
        .from(brandLookupSovEntries)
        .where(eq(brandLookupSovEntries.snapshotId, snapshot.id))
        .orderBy(brandLookupSovEntries.sortOrder),
    ]);

    return {
      ...snapshot,
      platforms,
      sovEntries,
    };
  },

  async listSnapshotsForDateRange(
    projectId: string,
    startDate: string,
    endDate: string,
    targetValue?: string,
  ): Promise<BrandLookupSnapshotWithRelations[]> {
    const conditions = [
      eq(brandLookupSnapshots.projectId, projectId),
      gte(brandLookupSnapshots.snapshotDate, startDate),
      lte(brandLookupSnapshots.snapshotDate, endDate),
    ];
    if (targetValue) {
      conditions.push(
        eq(brandLookupSnapshots.targetValue, targetValue.toLowerCase().trim()),
      );
    }

    const snapshots = await db
      .select()
      .from(brandLookupSnapshots)
      .where(and(...conditions))
      .orderBy(desc(brandLookupSnapshots.snapshotDate));

    if (snapshots.length === 0) return [];

    const snapshotIds = snapshots.map((s) => s.id);
    const [platforms, sovEntries] = await Promise.all([
      db
        .select()
        .from(brandLookupPlatformSnapshots)
        .where(inArray(brandLookupPlatformSnapshots.snapshotId, snapshotIds)),
      db
        .select()
        .from(brandLookupSovEntries)
        .where(inArray(brandLookupSovEntries.snapshotId, snapshotIds))
        .orderBy(brandLookupSovEntries.sortOrder),
    ]);

    const platformsBySnapshot = new Map<string, PersistedPlatformSnapshot[]>();
    for (const p of platforms) {
      const list = platformsBySnapshot.get(p.snapshotId) ?? [];
      list.push(p);
      platformsBySnapshot.set(p.snapshotId, list);
    }

    const sovBySnapshot = new Map<string, PersistedSovEntry[]>();
    for (const s of sovEntries) {
      const list = sovBySnapshot.get(s.snapshotId) ?? [];
      list.push(s);
      sovBySnapshot.set(s.snapshotId, list);
    }

    return snapshots.map((s) => ({
      ...s,
      platforms: platformsBySnapshot.get(s.id) ?? [],
      sovEntries: sovBySnapshot.get(s.id) ?? [],
    }));
  },
};
