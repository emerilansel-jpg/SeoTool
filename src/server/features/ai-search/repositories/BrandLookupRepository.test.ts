// oxlint-disable typescript-eslint/no-unsafe-type-assertion -- vi.fn mock narrowing in test doubles
import { beforeEach, describe, expect, it, vi } from "vitest";

const batchMock = vi.hoisted(() => ({
  runBatch: vi.fn(async (cb: (tx: unknown) => unknown[]) => {
    const tx = {
      insert: vi.fn(() => ({
        values: vi.fn(() => ({
          onConflictDoUpdate: vi.fn(() => Promise.resolve()),
        })),
      })),
      delete: vi.fn(() => ({
        where: vi.fn(() => Promise.resolve()),
      })),
    };
    return Promise.all(cb(tx) as Promise<unknown>[]);
  }),
}));

const queryMock = vi.hoisted(() => {
  const q: Record<string, unknown> = {};
  q.select = vi.fn(() => q);
  q.from = vi.fn(() => q);
  q.where = vi.fn(() => q);
  q.orderBy = vi.fn(() => q);
  q.limit = vi.fn(() => q);
  return q;
});

vi.mock("@/db/runBatch", () => ({
  runBatch: batchMock.runBatch,
}));

vi.mock("@/db", () => ({
  db: queryMock,
}));

vi.mock("@/db/schema", () => ({
  brandLookupSnapshots: {
    id: "brandLookupSnapshots.id",
    projectId: "brandLookupSnapshots.project_id",
    snapshotDate: "brandLookupSnapshots.snapshot_date",
    query: "brandLookupSnapshots.query",
    targetType: "brandLookupSnapshots.target_type",
    targetValue: "brandLookupSnapshots.target_value",
    locationCode: "brandLookupSnapshots.location_code",
    languageCode: "brandLookupSnapshots.language_code",
    fetchedAt: "brandLookupSnapshots.fetched_at",
    hasData: "brandLookupSnapshots.has_data",
    totalMentions: "brandLookupSnapshots.total_mentions",
    totalAiSearchVolume: "brandLookupSnapshots.total_ai_search_volume",
    createdAt: "brandLookupSnapshots.created_at",
    updatedAt: "brandLookupSnapshots.updated_at",
  },
  brandLookupPlatformSnapshots: {
    id: "brandLookupPlatformSnapshots.id",
    snapshotId: "brandLookupPlatformSnapshots.snapshot_id",
    platform: "brandLookupPlatformSnapshots.platform",
    status: "brandLookupPlatformSnapshots.status",
    mentions: "brandLookupPlatformSnapshots.mentions",
    aiSearchVolume: "brandLookupPlatformSnapshots.ai_search_volume",
  },
  brandLookupSovEntries: {
    id: "brandLookupSovEntries.id",
    snapshotId: "brandLookupSovEntries.snapshot_id",
    label: "brandLookupSovEntries.label",
    isTarget: "brandLookupSovEntries.is_target",
    mentions: "brandLookupSovEntries.mentions",
    sharePct: "brandLookupSovEntries.share_pct",
    sortOrder: "brandLookupSovEntries.sort_order",
  },
}));

import { BrandLookupRepository } from "./BrandLookupRepository";
import type { BrandLookupResult } from "@/types/schemas/ai-search";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("BrandLookupRepository", () => {
  const mockResult: BrandLookupResult = {
    query: "Nike",
    detectedTargetType: "keyword",
    resolvedTarget: "Nike",
    fetchedAt: "2024-06-12T10:00:00.000Z",
    hasData: true,
    totalMentions: 120,
    totalAiSearchVolume: 50000,
    perPlatform: [
      {
        platform: "chat_gpt",
        status: "success",
        mentions: 70,
        aiSearchVolume: 30000,
      },
      {
        platform: "google",
        status: "success",
        mentions: 50,
        aiSearchVolume: 20000,
      },
    ],
    shareOfVoice: {
      platforms: ["chat_gpt", "google"],
      entries: [
        { label: "Nike", isTarget: true, mentions: 120, sharePct: 60 },
        { label: "Adidas", isTarget: false, mentions: 80, sharePct: 40 },
      ],
    },
    topPages: [],
    topQueries: [],
    monthlyVolume: [],
  };

  it("persists valid brand lookup results via runBatch without throwing", async () => {
    (queryMock.limit as ReturnType<typeof vi.fn>).mockResolvedValueOnce([]);

    const snapshotId = await BrandLookupRepository.persistSnapshot(
      "proj_123",
      { locationCode: 2840, languageCode: "en" },
      mockResult,
    );

    expect(typeof snapshotId).toBe("string");
    expect(batchMock.runBatch).toHaveBeenCalledTimes(1);
  });

  it("reuses existing snapshot ID on same-day upsert", async () => {
    (queryMock.limit as ReturnType<typeof vi.fn>).mockResolvedValueOnce([
      { id: "existing-snap-id" },
    ]);

    const snapshotId = await BrandLookupRepository.persistSnapshot(
      "proj_123",
      { locationCode: 2840, languageCode: "en" },
      mockResult,
    );

    expect(snapshotId).toBe("existing-snap-id");
    expect(batchMock.runBatch).toHaveBeenCalledTimes(1);
  });
});
