// oxlint-disable typescript-eslint/unbound-method -- direct mocked method assertions are intentional
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/server/features/admin/repositories/AdminBillingRepository", () => ({
  AdminBillingRepository: {
    listSubscriptions: vi.fn(),
    listWebhookEvents: vi.fn(),
  },
}));
vi.mock("@/server/features/admin/repositories/AdminUserRepository", () => ({
  AdminUserRepository: {
    listUsers: vi.fn(),
    getUserDetail: vi.fn(),
    banUser: vi.fn(),
    unbanUser: vi.fn(),
    revokeSessions: vi.fn(),
  },
}));
vi.mock("@/server/features/admin/repositories/PlanConfigRepository", () => ({
  PlanConfigRepository: { upsert: vi.fn() },
}));
vi.mock("@/server/features/billing/repositories/QuotaRepository", () => ({
  QuotaRepository: {
    getSubscription: vi.fn(),
    upsertSubscription: vi.fn(),
    resetUsageQuotaForOrg: vi.fn(),
  },
}));
vi.mock("@/server/billing/credits", () => ({
  addTopupCredits: vi.fn(),
  deductCredits: vi.fn(),
  grantMonthlyCredits: vi.fn(),
}));
vi.mock("@/server/billing/customer-status-sync", () => ({
  syncPaypalCustomerStatus: vi.fn(),
}));
vi.mock("@/server/lib/platform-admin", () => ({
  isPlatformAdminId: vi.fn(),
}));
vi.mock("@/server/billing/plan-config", () => ({
  clearPlanConfigCache: vi.fn(),
  getEffectivePlanConfigs: vi.fn(),
}));
vi.mock("@/server/billing/paypal", () => ({
  paypal: { billingPlans: { updatePricingScheme: vi.fn() } },
}));

import {
  addTopupCredits,
  deductCredits,
  grantMonthlyCredits,
} from "@/server/billing/credits";
import { syncPaypalCustomerStatus } from "@/server/billing/customer-status-sync";
import { getEffectivePlanConfigs } from "@/server/billing/plan-config";
import { paypal } from "@/server/billing/paypal";
import { QuotaRepository } from "@/server/features/billing/repositories/QuotaRepository";
import { isPlatformAdminId } from "@/server/lib/platform-admin";
import { AdminBillingRepository } from "@/server/features/admin/repositories/AdminBillingRepository";
import { AdminUserRepository } from "@/server/features/admin/repositories/AdminUserRepository";
import { PlanConfigRepository } from "@/server/features/admin/repositories/PlanConfigRepository";
import { AdminBillingService } from "@/server/features/admin/services/AdminBillingService";
import { AdminPricingService } from "@/server/features/admin/services/AdminPricingService";
import { AdminUserService } from "@/server/features/admin/services/AdminUserService";

const billingRepo = vi.mocked(AdminBillingRepository);
const userRepo = vi.mocked(AdminUserRepository);
const quotaRepo = vi.mocked(QuotaRepository);
const planRepo = vi.mocked(PlanConfigRepository);
const addCredits = vi.mocked(addTopupCredits);
const deduct = vi.mocked(deductCredits);
const grantCredits = vi.mocked(grantMonthlyCredits);
const syncCustomer = vi.mocked(syncPaypalCustomerStatus);
const isAdminId = vi.mocked(isPlatformAdminId);
const getConfigs = vi.mocked(getEffectivePlanConfigs);
const updatePricing = vi.mocked(paypal.billingPlans.updatePricingScheme);

const configs = {
  free: {
    tier: "free" as const,
    priceUsdCents: 0,
    monthlyCredits: 0,
    paypalPlanId: null,
    syncStatus: "synced",
    active: true,
    priceSource: "default" as const,
    creditsSource: "default" as const,
    paypalPlanIdSource: "default" as const,
    updatedAt: null,
  },
  lite: {
    tier: "lite" as const,
    priceUsdCents: 4900,
    monthlyCredits: 5000,
    paypalPlanId: "P-LITE",
    syncStatus: "synced",
    active: true,
    priceSource: "default" as const,
    creditsSource: "default" as const,
    paypalPlanIdSource: "default" as const,
    updatedAt: null,
  },
  pro: {
    tier: "pro" as const,
    priceUsdCents: 9900,
    monthlyCredits: 25000,
    paypalPlanId: "P-PRO",
    syncStatus: "synced",
    active: true,
    priceSource: "default" as const,
    creditsSource: "default" as const,
    paypalPlanIdSource: "default" as const,
    updatedAt: null,
  },
  agency: {
    tier: "agency" as const,
    priceUsdCents: 24900,
    monthlyCredits: 100000,
    paypalPlanId: "P-AGENCY",
    syncStatus: "synced",
    active: true,
    priceSource: "default" as const,
    creditsSource: "default" as const,
    paypalPlanIdSource: "default" as const,
    updatedAt: null,
  },
};

beforeEach(() => {
  vi.clearAllMocks();
  getConfigs.mockResolvedValue(configs);
  quotaRepo.getSubscription.mockResolvedValue(null);
  isAdminId.mockResolvedValue(false);
  updatePricing.mockResolvedValue();
});

describe("AdminBillingService", () => {
  it("maps admin pagination to repository limit and offset", async () => {
    billingRepo.listSubscriptions.mockResolvedValue({
      subscriptions: [],
      total: 0,
    });
    await AdminBillingService.listSubscriptions({
      search: "acme",
      page: 3,
      pageSize: 20,
    });
    expect(billingRepo.listSubscriptions).toHaveBeenCalledWith({
      search: "acme",
      limit: 20,
      offset: 40,
    });
  });

  it("changes a tier, preserves its PayPal link, and refreshes quotas", async () => {
    quotaRepo.getSubscription.mockResolvedValue({
      organizationId: "org-1",
      planTier: "lite",
      paypalSubscriptionId: "I-123",
      status: "active",
      currentPeriodEnd: null,
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    });

    await AdminBillingService.setPlanTier({
      organizationId: "org-1",
      planTier: "pro",
    });

    expect(quotaRepo.upsertSubscription).toHaveBeenCalledWith(
      expect.objectContaining({
        organizationId: "org-1",
        planTier: "pro",
        paypalSubscriptionId: "I-123",
      }),
    );
    expect(quotaRepo.resetUsageQuotaForOrg).toHaveBeenCalledWith("org-1");
    expect(grantCredits).toHaveBeenCalledWith("org-1", "pro");
  });

  it("adds and deducts credits through the correct pool operations", async () => {
    deduct.mockResolvedValue({ monthlyDeducted: 10, topupDeducted: 0 });
    await AdminBillingService.adjustCredits({
      organizationId: "org-1",
      delta: 100,
    });
    await AdminBillingService.adjustCredits({
      organizationId: "org-1",
      delta: -10,
    });
    expect(addCredits).toHaveBeenCalledWith("org-1", 100);
    expect(deduct).toHaveBeenCalledWith("org-1", 10);
  });

  it("rejects zero and insufficient credit adjustments", async () => {
    await expect(
      AdminBillingService.adjustCredits({
        organizationId: "org-1",
        delta: 0,
      }),
    ).rejects.toMatchObject({ code: "VALIDATION_ERROR" });

    deduct.mockRejectedValueOnce(new Error("insufficient"));
    await expect(
      AdminBillingService.adjustCredits({
        organizationId: "org-1",
        delta: -100,
      }),
    ).rejects.toMatchObject({ code: "VALIDATION_ERROR" });
  });

  it("delegates a manual PayPal resync for the selected organization", async () => {
    syncCustomer.mockResolvedValue({
      organizationId: "org-1",
      isPaying: true,
      paidPlanId: "P-PRO",
      paidPlanStatus: "active",
      planTier: "pro",
      paypalSubscriptionId: "I-123",
      currentPeriodEnd: null,
      customerJson: "{}",
      syncedAt: "2026-08-24T00:00:00.000Z",
    });
    await AdminBillingService.resyncOrg({ organizationId: "org-1" });
    expect(syncCustomer).toHaveBeenCalledWith("org-1");
  });
});

describe("AdminPricingService", () => {
  it("syncs a changed price to PayPal before storing the override", async () => {
    await expect(
      AdminPricingService.saveTierConfig(
        {
          tier: "lite",
          priceUsd: 59,
          monthlyCredits: 6000,
          paypalPlanId: "P-LITE",
          active: true,
        },
        "admin-1",
      ),
    ).resolves.toEqual({ syncStatus: "synced" });

    expect(updatePricing).toHaveBeenCalledWith("P-LITE", 5900);
    expect(planRepo.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        tier: "lite",
        priceUsdCents: 5900,
        monthlyCredits: 6000,
        syncStatus: "synced",
        updatedByUserId: "admin-1",
      }),
    );
  });

  it("stores pending when PayPal price synchronization fails", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    updatePricing.mockRejectedValueOnce(new Error("PayPal unavailable"));

    await expect(
      AdminPricingService.saveTierConfig(
        {
          tier: "pro",
          priceUsd: 109,
          monthlyCredits: 25000,
          paypalPlanId: "P-PRO",
          active: true,
        },
        "admin-1",
      ),
    ).resolves.toEqual({ syncStatus: "pending" });
    expect(planRepo.upsert).toHaveBeenCalledWith(
      expect.objectContaining({ syncStatus: "pending" }),
    );
    consoleError.mockRestore();
  });

  it("validates a changed PayPal plan id even when its price is unchanged", async () => {
    await AdminPricingService.saveTierConfig(
      {
        tier: "lite",
        priceUsd: 49,
        monthlyCredits: 5000,
        paypalPlanId: "P-LITE-REPLACEMENT",
        active: true,
      },
      "admin-1",
    );

    expect(updatePricing).toHaveBeenCalledWith("P-LITE-REPLACEMENT", 4900);
    expect(planRepo.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        paypalPlanId: "P-LITE-REPLACEMENT",
        syncStatus: "synced",
      }),
    );
  });

  it("rejects PayPal sync retry for the free tier", async () => {
    await expect(
      AdminPricingService.retrySync({ tier: "free" }, "admin-1"),
    ).rejects.toMatchObject({ code: "VALIDATION_ERROR" });
  });
});

describe("AdminUserService", () => {
  it("prevents self-ban and banning another configured platform admin", async () => {
    await expect(
      AdminUserService.banUser({ userId: "admin-1" }, "admin-1"),
    ).rejects.toMatchObject({ code: "VALIDATION_ERROR" });

    isAdminId.mockResolvedValueOnce(true);
    await expect(
      AdminUserService.banUser({ userId: "admin-2" }, "admin-1"),
    ).rejects.toMatchObject({ code: "VALIDATION_ERROR" });
    expect(userRepo.banUser).not.toHaveBeenCalled();
  });

  it("bans, unbans, and logs out a non-admin user", async () => {
    await AdminUserService.banUser(
      { userId: "user-1", banReason: " abuse " },
      "admin-1",
    );
    await AdminUserService.unbanUser({ userId: "user-1" });
    await AdminUserService.forceLogout({ userId: "user-1" }, "admin-1");

    expect(userRepo.banUser).toHaveBeenCalledWith("user-1", "abuse");
    expect(userRepo.unbanUser).toHaveBeenCalledWith("user-1");
    expect(userRepo.revokeSessions).toHaveBeenCalledWith("user-1");
  });

  it("rejects forcing logout on the active admin session", async () => {
    await expect(
      AdminUserService.forceLogout({ userId: "admin-1" }, "admin-1"),
    ).rejects.toMatchObject({ code: "VALIDATION_ERROR" });
  });
});
