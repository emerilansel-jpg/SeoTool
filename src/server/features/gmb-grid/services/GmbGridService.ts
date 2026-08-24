import { env } from "cloudflare:workers";
import { z } from "zod";
import type { BillingCustomerContext } from "@/server/billing/subscription";
import { createDataforseoClient } from "@/server/lib/dataforseo";
import { AppError } from "@/server/lib/errors";
import { generateGridNodes } from "@/server/utils/geo-grid";
import type { CreateGmbGridInput } from "../gmb-grid.schema";
import { calculateGmbMetrics, estimateGmbGridCost } from "../gmb-grid";
import { GmbGridRepository } from "../repositories/GmbGridRepository";

const profileItemSchema = z
  .object({
    type: z.string().optional(),
    title: z.string().nullable().optional(),
    place_id: z.string().nullable().optional(),
    cid: z.string().nullable().optional(),
    address: z.string().nullable().optional(),
    category: z.string().nullable().optional(),
    domain: z.string().nullable().optional(),
    url: z.string().nullable().optional(),
    gps_coordinates: z
      .object({
        latitude: z.number().nullable().optional(),
        longitude: z.number().nullable().optional(),
      })
      .nullable()
      .optional(),
  })
  .passthrough();

const useE2eFixtures = import.meta.env.BYPASS_AUTH === "true";
const E2E_RUN_ID = "00000000-0000-4000-8000-000000000091";
const E2E_CONFIG_ID = "00000000-0000-4000-8000-000000000092";

function computeNextCheckAt(interval: "weekly" | "monthly" | "manual") {
  if (interval === "manual") return null;
  const next = new Date();
  if (interval === "weekly") next.setUTCDate(next.getUTCDate() + 7);
  else next.setUTCMonth(next.getUTCMonth() + 1);
  return next.toISOString();
}

async function searchProfiles(input: {
  projectId: string;
  query: string;
  billingCustomer: BillingCustomerContext;
}) {
  if (useE2eFixtures) {
    return [
      {
        businessName: "Test Dental Jakarta",
        placeId: "e2e-place-id",
        cid: "e2e-cid",
        address: "Jakarta, Indonesia",
        category: "Dentist",
        domain: "example.com",
        url: "https://example.com",
        lat: -6.2,
        lng: 106.816666,
      },
    ];
  }
  const market = await GmbGridRepository.getProjectMarket(input.projectId);
  if (!market) throw new AppError("NOT_FOUND", "Project not found");

  const items = await createDataforseoClient(input.billingCustomer).serp.local({
    keyword: input.query,
    locationCode: market.locationCode,
    languageCode: market.languageCode,
    searchType: "maps",
    device: "mobile",
    depth: 20,
    searchPlaces: true,
    creditFeature: "local_seo",
  });

  return items.flatMap((item) => {
    const parsed = profileItemSchema.safeParse(item);
    if (!parsed.success) return [];
    const row = parsed.data;
    const latitude = row.gps_coordinates?.latitude;
    const longitude = row.gps_coordinates?.longitude;
    if (
      row.type !== "maps_search" ||
      !row.title ||
      !row.place_id ||
      latitude == null ||
      longitude == null
    ) {
      return [];
    }
    return [
      {
        businessName: row.title,
        placeId: row.place_id,
        cid: row.cid ?? null,
        address: row.address ?? null,
        category: row.category ?? null,
        domain: row.domain ?? null,
        url: row.url ?? null,
        lat: latitude,
        lng: longitude,
      },
    ];
  });
}

async function startScan(input: {
  data: CreateGmbGridInput;
  billingCustomer: BillingCustomerContext;
}) {
  const data = input.data;
  if (useE2eFixtures) {
    return {
      ok: true as const,
      runId: E2E_RUN_ID,
      configId: E2E_CONFIG_ID,
    };
  }
  const market = await GmbGridRepository.getProjectMarket(data.projectId);
  if (!market) throw new AppError("NOT_FOUND", "Project not found");
  const languageCode = market.languageCode;
  const normalizedKeyword = data.keyword.trim().toLocaleLowerCase();
  const nowIso = new Date().toISOString();
  const nextCheckAt = computeNextCheckAt(data.scheduleInterval);
  let config = await GmbGridRepository.findMatchingConfig({
    projectId: data.projectId,
    placeId: data.placeId,
    keyword: normalizedKeyword,
    gridSize: data.gridSize,
    radiusMeters: data.radiusMeters,
    languageCode,
    device: data.device,
    mapZoom: data.mapZoom,
  });

  if (config) {
    await GmbGridRepository.updateConfig(
      config.id,
      {
        businessName: data.businessName,
        cid: data.cid ?? null,
        address: data.address ?? null,
        centerLat: data.centerLat,
        centerLng: data.centerLng,
        scheduleInterval: data.scheduleInterval,
        nextCheckAt,
        isActive: true,
        updatedAt: nowIso,
      },
      data.projectId,
    );
    config = await GmbGridRepository.getConfigById(config.id, data.projectId);
  } else {
    const configId = crypto.randomUUID();
    await GmbGridRepository.createConfig({
      id: configId,
      projectId: data.projectId,
      businessName: data.businessName,
      placeId: data.placeId,
      cid: data.cid ?? null,
      address: data.address ?? null,
      keyword: normalizedKeyword,
      centerLat: data.centerLat,
      centerLng: data.centerLng,
      gridSize: data.gridSize,
      radiusMeters: data.radiusMeters,
      languageCode,
      device: data.device,
      mapZoom: data.mapZoom,
      scheduleInterval: data.scheduleInterval,
      nextCheckAt,
    });
    config = await GmbGridRepository.getConfigById(configId, data.projectId);
  }

  if (!config)
    throw new AppError("INTERNAL_ERROR", "Failed to save grid configuration");

  const runId = crypto.randomUUID();
  const totalPoints = data.gridSize * data.gridSize;
  const inserted = await GmbGridRepository.tryCreateRun({
    id: runId,
    configId: config.id,
    status: "pending",
    trigger: "manual",
    totalPoints,
  });
  if (!inserted) {
    const active = await GmbGridRepository.getActiveRunForConfig(config.id);
    return {
      ok: false as const,
      reason: "already_running" as const,
      runId: active?.id ?? null,
      configId: config.id,
    };
  }

  const snapshots = generateGridNodes(
    config.centerLat,
    config.centerLng,
    config.gridSize,
    config.radiusMeters,
  ).map((node) => ({
    id: crypto.randomUUID(),
    runId,
    lat: node.lat,
    lng: node.lng,
    gridRow: node.gridRow,
    gridCol: node.gridCol,
    status: "pending" as const,
  }));
  await GmbGridRepository.insertSnapshots(snapshots);

  try {
    await env.GMB_GRID_WORKFLOW.create({
      id: runId,
      params: {
        runId,
        configId: config.id,
        projectId: data.projectId,
        billingCustomer: input.billingCustomer,
        trigger: "manual" as const,
      },
    });
  } catch (error) {
    await GmbGridRepository.updateRun(runId, {
      status: "failed",
      errorCode: "WORKFLOW_START_FAILED",
      errorMessage:
        error instanceof Error ? error.message : "Failed to start workflow",
      completedAt: new Date().toISOString(),
    });
    throw error;
  }

  return { ok: true as const, runId, configId: config.id };
}

async function getRun(projectId: string, runId: string) {
  if (useE2eFixtures && runId === E2E_RUN_ID) {
    const now = new Date().toISOString();
    const snapshots = generateGridNodes(-6.2, 106.816666, 7, 5000).map(
      (node, index) => ({
        id: `e2e-snapshot-${index}`,
        runId,
        ...node,
        rank: index % 6 === 0 ? null : (index % 12) + 1,
        taskId: `e2e-task-${index}`,
        status: "completed" as const,
        errorCode: null,
        errorMessage: null,
        checkedAt: now,
      }),
    );
    const metrics = calculateGmbMetrics(snapshots);
    return {
      config: {
        id: E2E_CONFIG_ID,
        projectId,
        businessName: "Test Dental Jakarta",
        placeId: "e2e-place-id",
        cid: "e2e-cid",
        address: "Jakarta, Indonesia",
        keyword: "dentist jakarta",
        centerLat: -6.2,
        centerLng: 106.816666,
        gridSize: 7,
        radiusMeters: 5000,
        languageCode: "en",
        device: "mobile" as const,
        mapZoom: 15,
        scheduleInterval: "manual" as const,
        nextCheckAt: null,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
      run: {
        id: runId,
        configId: E2E_CONFIG_ID,
        status: "completed" as const,
        trigger: "manual" as const,
        ...metrics,
        costUsd: estimateGmbGridCost(7).estimatedCostUsd,
        errorCode: null,
        errorMessage: null,
        startedAt: now,
        completedAt: now,
      },
      snapshots,
    };
  }
  const result = await GmbGridRepository.getRunForProject(runId, projectId);
  if (!result) throw new AppError("NOT_FOUND", "Grid scan not found");
  const snapshots = await GmbGridRepository.getSnapshotsForRun(runId);
  return { ...result, snapshots };
}

export const GmbGridService = {
  searchProfiles,
  startScan,
  getRun,
  listConfigs: GmbGridRepository.listConfigsForProject,
  estimateCost: estimateGmbGridCost,
  computeNextCheckAt,
};
