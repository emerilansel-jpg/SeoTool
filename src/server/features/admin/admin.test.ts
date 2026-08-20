// oxlint-disable typescript-eslint/unbound-method -- expect() needs direct references to mocked repository methods
import { beforeEach, describe, expect, it, vi } from "vitest";

// Repository mocks keep these service tests off the database entirely.
vi.mock("@/server/features/admin/repositories/CmsRepository", () => ({
  CmsRepository: {
    listPosts: vi.fn(),
    getPostById: vi.fn(),
    getPublishedPostBySlug: vi.fn(),
    createPost: vi.fn(),
    updatePost: vi.fn(),
    deletePost: vi.fn(),
    postSlugTaken: vi.fn(),
    listPages: vi.fn(),
    getPageById: vi.fn(),
    getPublishedPageBySlug: vi.fn(),
    createPage: vi.fn(),
    updatePage: vi.fn(),
    deletePage: vi.fn(),
    pageSlugTaken: vi.fn(),
  },
}));
vi.mock("@/server/features/admin/repositories/PlanConfigRepository", () => ({
  PlanConfigRepository: {
    listAll: vi.fn(),
    upsert: vi.fn(),
    setSyncStatus: vi.fn(),
  },
}));
vi.mock("@/server/features/admin/repositories/AdminSettingsRepository", () => ({
  AdminSettingsRepository: {
    listAll: vi.fn(),
    get: vi.fn(),
    upsert: vi.fn(),
    remove: vi.fn(),
  },
}));
// The paypal-webhook import chain pulls modules with static cloudflare:workers
// imports (posthog, credits -> db); mock the chain edges (same pattern as
// subscription.test.ts).
vi.mock("@/server/lib/runtime-env", () => ({
  getOptionalEnvValue: vi.fn().mockResolvedValue(undefined),
  getRequiredEnvValue: vi.fn(),
  getEnvValueSync: vi.fn(),
  isHostedServerAuthMode: vi.fn(),
  clearAdminSettingsCache: vi.fn(),
}));
vi.mock("@/server/lib/posthog", () => ({
  captureServerError: vi.fn(),
  captureServerEvent: vi.fn(),
}));
vi.mock("@/server/billing/paypal", () => ({
  paypal: { billingPlans: { updatePricingScheme: vi.fn() } },
}));
vi.mock("@/server/billing/customer-status-sync", () => ({
  syncPaypalCustomerStatus: vi.fn(),
}));
vi.mock("@/server/billing/credits", () => ({
  addTopupCredits: vi.fn(),
  grantMonthlyCredits: vi.fn(),
  getCreditBalance: vi.fn(),
  deductCredits: vi.fn(),
  areCreditsDepleted: vi.fn(),
}));
vi.mock(
  "@/server/features/admin/repositories/PayPalWebhookEventRepository",
  () => ({
    PayPalWebhookEventRepository: {
      record: vi.fn(),
      markStatus: vi.fn(),
    },
  }),
);

import { CmsRepository } from "@/server/features/admin/repositories/CmsRepository";
import { PlanConfigRepository } from "@/server/features/admin/repositories/PlanConfigRepository";
import { AdminSettingsRepository } from "@/server/features/admin/repositories/AdminSettingsRepository";
import { CmsService } from "@/server/features/admin/services/CmsService";
import { AdminSettingsService } from "@/server/features/admin/services/AdminSettingsService";
import {
  clearPlanConfigCache,
  getEffectivePlanConfigs,
  resolvePlanTierByPaypalPlanId,
} from "@/server/billing/plan-config";
import { extractTopupGrant } from "@/server/billing/paypal-webhook";

const cmsRepo = vi.mocked(CmsRepository);
const planRepo = vi.mocked(PlanConfigRepository);
const settingsRepo = vi.mocked(AdminSettingsRepository);

beforeEach(() => {
  vi.clearAllMocks();
  clearPlanConfigCache();
});

describe("CmsService: slug handling", () => {
  it("normalizes messy slugs to kebab-case", async () => {
    cmsRepo.postSlugTaken.mockResolvedValue(false);
    cmsRepo.createPost.mockResolvedValue({
      id: "p1",
      slug: "my-post-title",
      title: "My Post Title",
      description: null,
      contentMd: "body",
      status: "draft",
      publishedAt: null,
      authorUserId: "u1",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    });

    await CmsService.createPost(
      {
        slug: "  My Post -- Title!! ",
        title: "My Post Title",
        contentMd: "body",
        published: false,
      },
      "u1",
    );

    expect(cmsRepo.createPost).toHaveBeenCalledWith(
      expect.objectContaining({ slug: "my-post-title" }),
    );
  });

  it("rejects slugs that normalize to empty", async () => {
    await expect(
      CmsService.createPost(
        {
          slug: "!!!",
          title: "T",
          contentMd: "body",
          published: false,
        },
        "u1",
      ),
    ).rejects.toMatchObject({ code: "VALIDATION_ERROR" });
  });

  it("rejects duplicate slugs with CONFLICT", async () => {
    cmsRepo.postSlugTaken.mockResolvedValue(true);
    await expect(
      CmsService.createPost(
        { slug: "taken", title: "T", contentMd: "body", published: false },
        "u1",
      ),
    ).rejects.toMatchObject({ code: "CONFLICT" });
  });

  it("keeps the original publish date when re-publishing", async () => {
    cmsRepo.getPostById.mockResolvedValue({
      id: "p1",
      slug: "old",
      title: "T",
      description: null,
      contentMd: "body",
      status: "draft",
      publishedAt: "2025-06-01T00:00:00.000Z",
      authorUserId: "u1",
      createdAt: "2025-01-01T00:00:00.000Z",
      updatedAt: "2025-01-01T00:00:00.000Z",
    });
    cmsRepo.postSlugTaken.mockResolvedValue(false);
    cmsRepo.updatePost.mockResolvedValue({
      id: "p1",
      slug: "new",
      title: "T",
      description: null,
      contentMd: "body",
      status: "published",
      publishedAt: "2025-06-01T00:00:00.000Z",
      authorUserId: "u1",
      createdAt: "2025-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    });

    await CmsService.updatePost({
      id: "p1",
      slug: "new",
      title: "T",
      contentMd: "body",
      published: true,
    });

    // Unpublish + republish keeps the first publish date, not a new one.
    expect(cmsRepo.updatePost).toHaveBeenCalledWith(
      "p1",
      expect.objectContaining({ publishedAt: "2025-06-01T00:00:00.000Z" }),
    );
  });
});

describe("plan config: effective merge", () => {
  it("falls back to deploy constants when no rows exist", async () => {
    planRepo.listAll.mockResolvedValue([]);
    const configs = await getEffectivePlanConfigs();
    expect(configs.lite.priceUsdCents).toBe(4900);
    expect(configs.pro.monthlyCredits).toBe(25000);
    expect(configs.free.paypalPlanId).toBeNull();
    expect(configs.lite.priceSource).toBe("default");
  });

  it("layers DB rows over the constants", async () => {
    planRepo.listAll.mockResolvedValue([
      {
        tier: "pro",
        priceUsdCents: 19900,
        monthlyCredits: 30000,
        paypalPlanId: "P-PRO-CUSTOM",
        syncStatus: "synced",
        active: true,
        updatedByUserId: null,
        updatedAt: "2026-01-01T00:00:00.000Z",
      },
    ]);
    const configs = await getEffectivePlanConfigs();
    expect(configs.pro.priceUsdCents).toBe(19900);
    expect(configs.pro.monthlyCredits).toBe(30000);
    expect(configs.pro.priceSource).toBe("db");
    expect(configs.lite.priceUsdCents).toBe(4900);
    // Custom PayPal plan ids resolve back to their tier.
    await expect(resolvePlanTierByPaypalPlanId("P-PRO-CUSTOM")).resolves.toBe(
      "pro",
    );
    // Default plan ids from the constants still resolve.
    await expect(resolvePlanTierByPaypalPlanId("lite-plan")).resolves.toBe(
      "lite",
    );
  });
});

describe("AdminSettingsService: editable key guard", () => {
  it("saves editable keys", async () => {
    settingsRepo.upsert.mockResolvedValue({
      key: "OPENROUTER_MODEL",
      value: "x",
      isSecret: false,
      updatedByUserId: "u1",
      updatedAt: "2026-01-01T00:00:00.000Z",
    });
    await AdminSettingsService.saveSetting(
      { envKey: "OPENROUTER_MODEL", value: "new-model" },
      "u1",
    );
    expect(settingsRepo.upsert).toHaveBeenCalledWith(
      expect.objectContaining({ key: "OPENROUTER_MODEL" }),
    );
  });

  it("rejects keys read at deploy time", async () => {
    await expect(
      AdminSettingsService.saveSetting(
        { envKey: "GOOGLE_CLIENT_ID", value: "x" },
        "u1",
      ),
    ).rejects.toMatchObject({ code: "VALIDATION_ERROR" });
    expect(settingsRepo.upsert).not.toHaveBeenCalled();
  });

  it("rejects unknown keys", async () => {
    await expect(
      AdminSettingsService.saveSetting(
        { envKey: "NOT_A_REAL_KEY", value: "x" },
        "u1",
      ),
    ).rejects.toMatchObject({ code: "VALIDATION_ERROR" });
  });
});

describe("paypal webhook: top-up grant extraction", () => {
  it("computes credits for a completed top-up capture", () => {
    const grant = extractTopupGrant(
      {
        id: "WH-1",
        event_type: "PAYMENT.CAPTURE.COMPLETED",
        resource: {
          amount: { currency_code: "USD", value: "25.00" },
          purchase_units: [{ reference_id: "topup-org-123-1787151171099" }],
        },
      },
      "org-123",
    );
    expect(grant).toEqual({ organizationId: "org-123", credits: 25000 });
  });

  it("returns null for subscription renewals (custom_id, no topup unit)", () => {
    const grant = extractTopupGrant(
      {
        id: "WH-2",
        event_type: "PAYMENT.CAPTURE.COMPLETED",
        resource: {
          custom_id: "org-123",
          amount: { currency_code: "USD", value: "49.00" },
        },
      },
      "org-123",
    );
    expect(grant).toBeNull();
  });

  it("returns null for non-USD or malformed amounts", () => {
    const grant = extractTopupGrant(
      {
        id: "WH-3",
        event_type: "PAYMENT.CAPTURE.COMPLETED",
        resource: {
          amount: { currency_code: "EUR", value: "25.00" },
          purchase_units: [{ reference_id: "topup-org-123-1" }],
        },
      },
      "org-123",
    );
    expect(grant).toBeNull();
  });
});
