/* eslint-disable max-lines */
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  CREDITS_PER_USD,
  SEO_DATA_BYOK_FEE_MULTIPLIER,
  SEO_DATA_COST_MARKUP,
  roundUsdForBilling,
} from "@/shared/billing";

const {
  checkMock,
  trackMock,
  reserveMock,
  settleMock,
  refundMock,
  captureMock,
  getOrCreateMock,
  isHostedServerAuthModeMock,
  quotaMock,
  fetchBacklinksSummaryMock,
  postMapsTasksMock,
} = vi.hoisted(() => ({
  checkMock: vi.fn(),
  trackMock:
    vi.fn<
      (
        organizationId: string,
        amount: number,
      ) => { monthlyDeducted: number; topupDeducted: number }
    >(),
  reserveMock: vi.fn(),
  settleMock: vi.fn(),
  refundMock: vi.fn(),
  captureMock: vi.fn(),
  getOrCreateMock: vi.fn(),
  isHostedServerAuthModeMock: vi.fn(),
  quotaMock: vi.fn().mockResolvedValue(undefined),
  fetchBacklinksSummaryMock: vi.fn(),
  postMapsTasksMock: vi.fn(),
}));

vi.mock("cloudflare:workers", () => ({
  waitUntil: vi.fn(),
}));

vi.mock("@/server/billing/credits", () => ({
  getCreditBalance: checkMock,
  deductCredits: trackMock,
  grantMonthlyCredits: vi.fn(),
}));

vi.mock("@/server/billing/credit-reservations", () => ({
  reserveUsageCredits: reserveMock,
  settleUsageCreditReservation: settleMock,
  refundUsageCreditReservation: refundMock,
}));

// Keep the real subscription module (its assertUsageCreditsAvailable calls the
// mocked autumn.check) and only stub the customer lookup, so the balance-assert
// logic stays exercised through these tests after it moved out of client.ts.
import * as subscription from "@/server/billing/subscription";

vi.mock("@/server/lib/runtime-env", () => ({
  isHostedServerAuthMode: isHostedServerAuthModeMock,
}));

vi.mock("@/server/billing/quota-gate", () => ({
  assertFeatureQuota: quotaMock,
  assertGaugeFeature: vi.fn().mockResolvedValue(undefined),
  assertFeatureAccess: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/server/features/billing/repositories/QuotaRepository", () => ({
  QuotaRepository: {
    getSubscription: vi.fn().mockResolvedValue(null),
    getPlanTier: vi.fn().mockResolvedValue("free"),
    upsertSubscription: vi.fn().mockResolvedValue({}),
    getUsageQuota: vi.fn().mockResolvedValue(null),
    listUsageQuota: vi.fn().mockResolvedValue([]),
    incrementUsageQuota: vi.fn().mockResolvedValue({ used: 1 }),
    peekUsageQuota: vi
      .fn()
      .mockResolvedValue({ used: 0, windowStart: null, windowEnd: null }),
    resetUsageQuotaForOrg: vi.fn().mockResolvedValue(undefined),
  },
}));

vi.mock("@/server/lib/posthog", () => ({
  captureServerEvent: captureMock,
}));

// Mock every section module the client wraps so meterDataforseoCall's
// `execute()` resolves to a controllable fixture.
vi.mock("@/server/lib/dataforseo/labs", () => ({
  fetchRelatedKeywords: vi.fn(),
  fetchKeywordSuggestions: vi.fn(),
  fetchKeywordIdeas: vi.fn(),
  fetchDomainRankOverview: vi.fn(),
  fetchRankedKeywords: vi.fn(),
  fetchRelevantPages: vi.fn(),
  fetchKeywordOverview: vi.fn(),
  fetchSerpCompetitors: vi.fn(),
  fetchDomainIntersection: vi.fn(),
}));
vi.mock("@/server/lib/dataforseo/serp", () => ({
  fetchLiveSerp: vi.fn(),
  fetchRankCheckSerp: vi.fn(),
  postRankCheckTasks: vi.fn(),
  fetchLocalSerp: vi.fn(),
}));
vi.mock("@/server/lib/dataforseo/maps-serp", () => ({
  postMapsTasks: postMapsTasksMock,
  fetchMapsTaskResult: vi.fn(),
}));
vi.mock("@/server/lib/dataforseo/business", () => ({
  fetchBusinessListingsSearch: vi.fn(),
  fetchQuestionsAnswers: vi.fn(),
}));
vi.mock("@/server/lib/dataforseo/backlinks", () => ({
  fetchBacklinksSummary: fetchBacklinksSummaryMock,
  fetchBacklinksRows: vi.fn(),
  fetchReferringDomains: vi.fn(),
  fetchDomainPagesSummary: vi.fn(),
  fetchBacklinksHistory: vi.fn(),
}));
vi.mock("@/server/lib/dataforseo/lighthouse", () => ({
  fetchLighthouseResult: vi.fn(),
}));
vi.mock("@/server/lib/dataforseo/ai", () => ({
  fetchLlmMentionsSearch: vi.fn(),
  fetchLlmAggregatedMetrics: vi.fn(),
  fetchLlmTopPages: vi.fn(),
  fetchLlmCrossAggregatedMetrics: vi.fn(),
  fetchLlmResponse: vi.fn(),
}));

// `client.ts` loads the aggregate section barrel lazily. Mock that exact
// boundary so this unit test does not import the full DataForSEO SDK graph or
// leave a cold dynamic import running after a test timeout under full-suite
// worker pressure.
vi.mock("@/server/lib/dataforseo/sections", () => ({
  fetchBacklinksSummary: fetchBacklinksSummaryMock,
  postMapsTasks: postMapsTasksMock,
}));

import {
  createDataforseoClient,
  mapDataforseoPathToCreditFeature,
} from "@/server/lib/dataforseo/client";
import { DataforseoChargedTaskError } from "@/server/lib/dataforseo/envelope";
import { fetchBacklinksSummary } from "@/server/lib/dataforseo/backlinks";
import { postMapsTasks } from "@/server/lib/dataforseo/maps-serp";

const billingCustomer = {
  organizationId: "org_123",
  userId: "user_123",
  userEmail: "alice@example.com",
};

const backlinksInput = {
  target: "example.com",
};

function setupHostedMode() {
  isHostedServerAuthModeMock.mockResolvedValue(true);
  getOrCreateMock.mockResolvedValue({ id: "org_123" });
}

function mockBalances(monthly: number, topup: number) {
  checkMock.mockResolvedValue({
    monthlyRemaining: monthly,
    topupRemaining: topup,
    totalRemaining: monthly + topup,
  });
  trackMock.mockImplementation((_orgId: string, amount: number) => ({
    monthlyDeducted: Math.min(monthly, amount),
    topupDeducted: Math.max(0, amount - monthly),
  }));
  reserveMock.mockImplementation(
    (input: { organizationId: string; credits: number }) => {
      if (monthly + topup < input.credits) {
        return Promise.reject({ code: "INSUFFICIENT_CREDITS" });
      }
      const monthlyReserved = Math.min(monthly, input.credits);
      return Promise.resolve({
        id: "reservation-1",
        organizationId: input.organizationId,
        reservedCredits: input.credits,
        monthlyReserved,
        topupReserved: input.credits - monthlyReserved,
        status: "reserved",
      });
    },
  );
  settleMock.mockImplementation((_reservationId: string, amount: number) => {
    const monthlyCharged = Math.min(monthly, amount);
    return Promise.resolve({
      reservation: { reservedCredits: Math.max(amount, 10_000) },
      monthlyCharged,
      topupCharged: amount - monthlyCharged,
      totalCharged: amount,
      overageCredits: 0,
    });
  });
  refundMock.mockResolvedValue({ totalCharged: 0 });
}

function mockDataforseoResult(costUsd: number) {
  vi.mocked(fetchBacklinksSummary).mockResolvedValue({
    data: { rank: 42 },
    billing: { costUsd, path: ["backlinks", "summary"] },
  });
}

describe("meterDataforseoCall with split balances", () => {
  beforeEach(() => {
    vi.spyOn(
      subscription,
      "getOrCreateOrganizationCustomer",
    ).mockImplementation(getOrCreateMock);
    vi.clearAllMocks();
  });

  it("skips billing in non-hosted mode", async () => {
    isHostedServerAuthModeMock.mockResolvedValue(false);
    mockDataforseoResult(0.05);

    const client = createDataforseoClient(billingCustomer);
    const result = await client.backlinks.summary(backlinksInput);

    expect(result).toEqual({ rank: 42 });
    expect(checkMock).not.toHaveBeenCalled();
    expect(trackMock).not.toHaveBeenCalled();
    expect(reserveMock).not.toHaveBeenCalled();
  }, 60_000);

  it("reserves an endpoint-aware ceiling before dispatching the provider", async () => {
    setupHostedMode();
    mockBalances(5000, 3000);
    mockDataforseoResult(0.05);

    const client = createDataforseoClient(billingCustomer);
    await client.backlinks.summary(backlinksInput);

    expect(reserveMock).toHaveBeenCalledTimes(1);
    expect(reserveMock).toHaveBeenCalledWith(
      expect.objectContaining({
        organizationId: "org_123",
        credits: 32,
        provider: "dataforseo",
        billingMode: "standard",
      }),
    );
    expect(fetchBacklinksSummary).toHaveBeenCalledTimes(1);
  });

  it("charges the dedicated daily quota by Maps grid point", async () => {
    setupHostedMode();
    mockBalances(5000, 3000);
    vi.mocked(postMapsTasks).mockResolvedValue({
      data: { tasks: [], costUsd: 0.0294 },
      billing: {
        costUsd: 0.0294,
        path: ["v3", "serp", "google", "maps", "task_post"],
      },
    });

    const client = createDataforseoClient(billingCustomer);
    await client.serp.mapsTaskPost({
      tasks: [
        { snapshotId: "snapshot-a", keyword: "dentist", lat: -6.2, lng: 106.8 },
      ],
      languageCode: "id",
      device: "mobile",
      zoom: 15,
      depth: 20,
      quotaUnits: 49,
    });

    expect(quotaMock).toHaveBeenCalledWith("org_123", "local_map_points", 49);
  });

  const RAW_COST = 0.02;
  const EXPECTED_CREDITS = Math.ceil(
    roundUsdForBilling(RAW_COST * SEO_DATA_COST_MARKUP) * CREDITS_PER_USD,
  );

  it("deducts entirely from monthly when monthly has enough", async () => {
    setupHostedMode();
    mockBalances(5000, 3000);
    mockDataforseoResult(RAW_COST);

    const client = createDataforseoClient(billingCustomer);
    await client.backlinks.summary(backlinksInput);

    expect(settleMock).toHaveBeenCalledTimes(1);
    expect(settleMock).toHaveBeenCalledWith("reservation-1", EXPECTED_CREDITS);
  });

  it("deducts entirely from topup when monthly is empty", async () => {
    setupHostedMode();
    mockBalances(0, 5000);
    mockDataforseoResult(RAW_COST);

    const client = createDataforseoClient(billingCustomer);
    await client.backlinks.summary(backlinksInput);

    expect(settleMock).toHaveBeenCalledWith("reservation-1", EXPECTED_CREDITS);
  });

  it("splits deduction across monthly and topup when monthly is partially sufficient", async () => {
    setupHostedMode();
    const monthlyAvailable = 30;
    mockBalances(monthlyAvailable, 5000);
    mockDataforseoResult(RAW_COST);

    const client = createDataforseoClient(billingCustomer);
    await client.backlinks.summary(backlinksInput);

    expect(settleMock).toHaveBeenCalledWith("reservation-1", EXPECTED_CREDITS);
  });

  it("throws INSUFFICIENT_CREDITS when both balances are exactly zero", async () => {
    setupHostedMode();
    mockBalances(0, 0);
    mockDataforseoResult(RAW_COST);

    const client = createDataforseoClient(billingCustomer);
    await expect(
      client.backlinks.summary(backlinksInput),
    ).rejects.toMatchObject({ code: "INSUFFICIENT_CREDITS" });

    expect(fetchBacklinksSummary).not.toHaveBeenCalled();
    expect(settleMock).not.toHaveBeenCalled();
  });

  it("does not dispatch when the remaining balance is below the call ceiling", async () => {
    setupHostedMode();
    mockBalances(1, 0);
    mockDataforseoResult(RAW_COST);

    const client = createDataforseoClient(billingCustomer);
    await expect(
      client.backlinks.summary(backlinksInput),
    ).rejects.toMatchObject({ code: "INSUFFICIENT_CREDITS" });

    expect(reserveMock).toHaveBeenCalledWith(
      expect.objectContaining({ credits: 32 }),
    );
    expect(fetchBacklinksSummary).not.toHaveBeenCalled();
  });

  it("dispatches only the request that wins a concurrent reservation", async () => {
    setupHostedMode();
    mockBalances(32, 0);
    mockDataforseoResult(RAW_COST);
    let claims = 0;
    reserveMock.mockImplementation(() => {
      claims += 1;
      return claims === 1
        ? Promise.resolve({
            id: "reservation-1",
            reservedCredits: 32,
            monthlyReserved: 32,
            topupReserved: 0,
            status: "reserved",
          })
        : Promise.reject({ code: "INSUFFICIENT_CREDITS" });
    });

    const client = createDataforseoClient(billingCustomer);
    const results = await Promise.allSettled([
      client.backlinks.summary(backlinksInput),
      client.backlinks.summary(backlinksInput),
    ]);

    expect(
      results.filter((result) => result.status === "fulfilled"),
    ).toHaveLength(1);
    expect(
      results.filter((result) => result.status === "rejected"),
    ).toHaveLength(1);
    expect(fetchBacklinksSummary).toHaveBeenCalledTimes(1);
  });

  it("meters charged DataForSEO task errors before rethrowing", async () => {
    setupHostedMode();
    mockBalances(5000, 3000);
    vi.mocked(fetchBacklinksSummary).mockRejectedValue(
      new DataforseoChargedTaskError("DataForSEO task failed", {
        costUsd: RAW_COST,
        path: ["v3", "backlinks", "summary", "live"],
      }),
    );

    const client = createDataforseoClient(billingCustomer);
    await expect(client.backlinks.summary(backlinksInput)).rejects.toThrow(
      "DataForSEO task failed",
    );

    expect(settleMock).toHaveBeenCalledWith("reservation-1", EXPECTED_CREDITS);
  });

  it("skips the charge for an unbilled invalid-field failure and rethrows VALIDATION_ERROR", async () => {
    setupHostedMode();
    mockBalances(5000, 3000);
    vi.mocked(fetchBacklinksSummary).mockRejectedValue(
      new DataforseoChargedTaskError(
        "Invalid Field: 'target'.",
        { costUsd: 0, path: ["v3", "backlinks", "summary", "live"] },
        true,
      ),
    );

    const client = createDataforseoClient(billingCustomer);
    await expect(
      client.backlinks.summary(backlinksInput),
    ).rejects.toMatchObject({ code: "VALIDATION_ERROR" });

    expect(refundMock).toHaveBeenCalledWith("reservation-1");
    expect(settleMock).not.toHaveBeenCalled();
  });

  it("refunds the reservation when the provider fails without billing metadata", async () => {
    setupHostedMode();
    mockBalances(5000, 3000);
    vi.mocked(fetchBacklinksSummary).mockRejectedValue(
      new Error("network unavailable"),
    );

    const client = createDataforseoClient(billingCustomer);
    await expect(client.backlinks.summary(backlinksInput)).rejects.toThrow(
      "network unavailable",
    );

    expect(refundMock).toHaveBeenCalledWith("reservation-1");
    expect(settleMock).not.toHaveBeenCalled();
  });

  it("still meters an invalid-field failure that DataForSEO actually billed", async () => {
    setupHostedMode();
    mockBalances(5000, 3000);
    vi.mocked(fetchBacklinksSummary).mockRejectedValue(
      new DataforseoChargedTaskError(
        "Invalid Field: 'target'.",
        { costUsd: RAW_COST, path: ["v3", "backlinks", "summary", "live"] },
        true,
      ),
    );

    const client = createDataforseoClient(billingCustomer);
    await expect(client.backlinks.summary(backlinksInput)).rejects.toThrow(
      "Invalid Field: 'target'.",
    );

    expect(settleMock).toHaveBeenCalledWith("reservation-1", EXPECTED_CREDITS);
  });

  it("deducts the correct credit amount", async () => {
    setupHostedMode();
    mockBalances(30, 5000);
    mockDataforseoResult(RAW_COST);

    const client = createDataforseoClient(billingCustomer);
    await client.backlinks.summary(backlinksInput);

    expect(settleMock).toHaveBeenCalledWith("reservation-1", EXPECTED_CREDITS);
  });

  it("charges only the 10% service fee and forwards a request-scoped BYOK key", async () => {
    setupHostedMode();
    mockBalances(5000, 3000);
    mockDataforseoResult(RAW_COST);

    const client = createDataforseoClient(billingCustomer, {
      billingMode: "byok",
      apiKey: "request-scoped-key",
      skipQuota: true,
    });
    await client.backlinks.summary(backlinksInput);

    const expectedByokCredits = Math.ceil(
      Number((RAW_COST * SEO_DATA_BYOK_FEE_MULTIPLIER).toFixed(6)) *
        CREDITS_PER_USD,
    );
    expect(fetchBacklinksSummary).toHaveBeenCalledWith({
      ...backlinksInput,
      apiKey: "request-scoped-key",
    });
    expect(quotaMock).not.toHaveBeenCalled();
    expect(settleMock).toHaveBeenCalledWith(
      "reservation-1",
      expectedByokCredits,
    );
  });
});

describe("mapDataforseoPathToCreditFeature", () => {
  it("maps real keyword research paths", () => {
    expect(
      mapDataforseoPathToCreditFeature([
        "v3",
        "dataforseo_labs",
        "google",
        "related_keywords",
        "live",
      ]),
    ).toBe("keyword_research");
    expect(
      mapDataforseoPathToCreditFeature([
        "v3",
        "dataforseo_labs",
        "google",
        "keyword_suggestions",
        "live",
      ]),
    ).toBe("keyword_research");
  });

  it("maps real serp paths", () => {
    expect(
      mapDataforseoPathToCreditFeature([
        "v3",
        "serp",
        "google",
        "organic",
        "live",
        "regular",
      ]),
    ).toBe("keyword_research");
  });

  it("maps real domain paths", () => {
    expect(
      mapDataforseoPathToCreditFeature([
        "v3",
        "dataforseo_labs",
        "google",
        "domain_rank_overview",
        "live",
      ]),
    ).toBe("domain_overview");
    expect(
      mapDataforseoPathToCreditFeature([
        "v3",
        "dataforseo_labs",
        "google",
        "ranked_keywords",
        "live",
      ]),
    ).toBe("domain_overview");
    expect(
      mapDataforseoPathToCreditFeature([
        "v3",
        "dataforseo_labs",
        "google",
        "relevant_pages",
        "live",
      ]),
    ).toBe("domain_overview");
  });

  it("maps domain_intersection to content_intelligence", () => {
    expect(
      mapDataforseoPathToCreditFeature([
        "v3",
        "dataforseo_labs",
        "google",
        "domain_intersection",
        "live",
      ]),
    ).toBe("content_intelligence");
    // The generic domain_* rule must still hold for other domain endpoints.
    expect(
      mapDataforseoPathToCreditFeature([
        "v3",
        "dataforseo_labs",
        "google",
        "domain_rank_overview",
        "live",
      ]),
    ).toBe("domain_overview");
  });

  it("maps real backlinks paths", () => {
    expect(
      mapDataforseoPathToCreditFeature(["v3", "backlinks", "summary", "live"]),
    ).toBe("backlinks");
    expect(mapDataforseoPathToCreditFeature(["backlinks", "summary"])).toBe(
      "backlinks",
    );
    expect(
      mapDataforseoPathToCreditFeature([
        "v3",
        "backlinks",
        "referring_domains",
        "live",
      ]),
    ).toBe("backlinks");
  });

  it("maps real lighthouse/on_page paths to site_audit", () => {
    expect(
      mapDataforseoPathToCreditFeature([
        "v3",
        "on_page",
        "lighthouse",
        "live",
        "json",
      ]),
    ).toBe("site_audit");
  });

  it("maps ai_optimization llm_mentions paths to ai_citations", () => {
    expect(
      mapDataforseoPathToCreditFeature([
        "v3",
        "ai_optimization",
        "llm_mentions",
        "search",
        "live",
      ]),
    ).toBe("ai_citations");
    expect(
      mapDataforseoPathToCreditFeature([
        "v3",
        "ai_optimization",
        "llm_mentions",
        "aggregated_metrics",
        "live",
      ]),
    ).toBe("ai_citations");
    expect(
      mapDataforseoPathToCreditFeature([
        "v3",
        "ai_optimization",
        "llm_mentions",
        "top_pages",
        "live",
      ]),
    ).toBe("ai_citations");
  });

  it("maps ai_optimization provider llm_responses paths to ai_prompt_responses", () => {
    for (const provider of ["chat_gpt", "claude", "gemini", "perplexity"]) {
      expect(
        mapDataforseoPathToCreditFeature([
          "v3",
          "ai_optimization",
          provider,
          "llm_responses",
          "live",
        ]),
      ).toBe("ai_prompt_responses");
    }
  });

  it("maps local and supporting paths to the intended credit features", () => {
    expect(
      mapDataforseoPathToCreditFeature([
        "v3",
        "business_data",
        "business_listings",
        "search",
        "live",
      ]),
    ).toBe("local_seo");
    expect(
      mapDataforseoPathToCreditFeature([
        "v3",
        "serp",
        "google",
        "local_finder",
        "live",
        "advanced",
      ]),
    ).toBe("local_seo");
    expect(
      mapDataforseoPathToCreditFeature([
        "v3",
        "serp",
        "google",
        "maps",
        "live",
        "advanced",
      ]),
    ).toBe("local_map_rank");
    expect(
      mapDataforseoPathToCreditFeature([
        "v3",
        "keywords_data",
        "google_ads",
        "search_volume",
        "live",
      ]),
    ).toBe("keyword_research");
  });
});
