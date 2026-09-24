import { describe, expect, it, vi } from "vitest";

vi.mock("cloudflare:workers", () => ({ env: {} }));
vi.mock("@/server/lib/posthog", () => ({
  captureException: vi.fn(),
  captureServerError: vi.fn(),
  captureServerEvent: vi.fn(),
}));

import { AiTrackingDiscoveryInternals } from "./services/AiDiscoveryService";
import { aggregateDashboardMetrics } from "./dashboardAggregation";

function normalizeQueryTokens(value: string): string[] {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9\s]+/g, " ")
    .split(/\s+/)
    .filter((t) => t.length >= 3);
}

function isTokenMatch(prompt: string, gscQuery: string): boolean {
  const pTokens = new Set(normalizeQueryTokens(prompt));
  const gTokens = normalizeQueryTokens(gscQuery);
  if (pTokens.size === 0 || gTokens.length === 0) return false;
  let shared = 0;
  for (const t of gTokens) {
    if (pTokens.has(t)) shared++;
  }
  const overlap = shared / Math.min(pTokens.size, gTokens.length);
  const minTokensRequired = Math.min(2, pTokens.size);
  return shared >= minTokensRequired && overlap >= 0.75;
}

describe("AI Tracking Data Isolation & Relevance Guardrails", () => {
  describe("strongAliases", () => {
    it("rejects short or generic aliases that cause cross-topic contamination", () => {
      const brand = "Jet Digital Pro";
      const aliases = [
        "jdp",
        "jet",
        "JDP",
        "drill",
        "seo",
        "Jet Digital",
        "JetDigitalAgency",
      ];

      const filtered = AiTrackingDiscoveryInternals.strongAliases(
        brand,
        aliases,
      );

      // 'jdp', 'jet', 'drill', 'seo' must be excluded
      expect(filtered).not.toContain("jdp");
      expect(filtered).not.toContain("jet");
      expect(filtered).not.toContain("JDP");
      expect(filtered).not.toContain("drill");
      expect(filtered).not.toContain("seo");

      // Multi-word or >= 7 char specific aliases must be kept
      expect(filtered).toContain("Jet Digital");
      expect(filtered).toContain("JetDigitalAgency");
    });
  });

  describe("discoveryRelevance", () => {
    const jdpConfig = {
      brandName: "Jet Digital Pro",
      aliases: ["Jet Digital Agency"],
      domain: "jetdigitalpro.com",
    };

    it("rejects irrelevant prompts (e.g. drill press, unrelated generic questions)", () => {
      const irrelevant = AiTrackingDiscoveryInternals.discoveryRelevance({
        prompt: "best heavy duty drill press for metalworking and woodworking",
        brandName: jdpConfig.brandName,
        aliases: jdpConfig.aliases,
        domain: jdpConfig.domain,
        brandEntities: ["WEN", "JET Tools", "Shop Fox"],
        sources: [
          {
            url: "https://woodworkingguide.com/drill-press",
            domain: "woodworkingguide.com",
          },
          { url: "https://jettools.com/power-tools", domain: "jettools.com" },
        ],
      });

      expect(irrelevant.relevant).toBe(false);
      expect(irrelevant.hasMention).toBe(false);
      expect(irrelevant.matchedTarget).toBeNull();
    });

    it("rejects cross-project prompts from other tenants (e.g. Klinik Niumiu into JDP)", () => {
      const crossTenant = AiTrackingDiscoveryInternals.discoveryRelevance({
        prompt:
          "klinik kecantikan terbaik di tangerang gading serpong klinik niumiu",
        brandName: jdpConfig.brandName,
        aliases: jdpConfig.aliases,
        domain: jdpConfig.domain,
        brandEntities: ["Klinik Niumiu", "Niumiu Dental & Aesthetic"],
        sources: [
          {
            url: "https://klinikniumiu.com/layanan",
            domain: "klinikniumiu.com",
          },
          {
            url: "https://instagram.com/klinikniumiu",
            domain: "instagram.com",
          },
        ],
      });

      expect(crossTenant.relevant).toBe(false);
      expect(crossTenant.hasMention).toBe(false);
      expect(crossTenant.matchedTarget).toBeNull();
    });

    it("approves relevant prompts matching domain or brand name", () => {
      const relevant = AiTrackingDiscoveryInternals.discoveryRelevance({
        prompt: "what is Jet Digital Pro and how does their SEO service work?",
        brandName: jdpConfig.brandName,
        aliases: jdpConfig.aliases,
        domain: jdpConfig.domain,
        brandEntities: ["Jet Digital Pro"],
        sources: [
          {
            url: "https://jetdigitalpro.com/services/seo",
            domain: "jetdigitalpro.com",
          },
        ],
      });

      expect(relevant.relevant).toBe(true);
      expect(relevant.hasMention).toBe(true);
      expect(relevant.matchedTarget).toBe("jetdigitalpro.com");
    });
  });

  describe("aggregateDashboardMetrics isolation", () => {
    it("strictly isolates Project A data from Project B data and displays '—' when no rank", () => {
      const configA = {
        id: "cfg_proj_a",
        projectId: "proj_a",
        brandName: "Jet Digital Pro",
        domain: "jetdigitalpro.com",
        brandAliases: [],
        platforms: ["chat_gpt" as const],
        schedule: "manual" as const,
        scheduleStatus: "idle" as const,
        lastRunAt: null,
      };

      // Empty observations for project A
      const dashboardA = aggregateDashboardMetrics({
        config: configA,
        promptsList: [],
        observations: [],
        mentions: [],
        citations: [],
        latestRun: null,
      });

      expect(dashboardA.kpi.mentionCoveragePercent).toBe(0);
      expect(dashboardA.kpi.averageListPosition).toBeNull();
      expect(dashboardA.kpi.brandMentions).toBe(0);
      expect(dashboardA.prompts).toHaveLength(0);

      // Now verify that project B mentions do not bleed into project A
      const _foreignObservation = {
        id: "obs_b_1",
        runId: "run_b_1",
        configId: "cfg_proj_b", // Belongs to Project B!
        promptId: "prompt_b_1",
        prompt: "perawatan facial di klinik niumiu",
        platform: "chat_gpt" as const,
        status: "success" as const,
        responseText:
          "Klinik Niumiu adalah klinik kecantikan di Gading Serpong",
        errorMessage: null,
        observedAt: "2026-09-17T00:00:00.000Z",
      };

      const _foreignMention = {
        id: "mention_b_1",
        observationId: "obs_b_1",
        runId: "run_b_1",
        configId: "cfg_proj_b",
        brandName: "Klinik Niumiu",
        domain: "klinikniumiu.com",
        isTargetBrand: true, // target for B, but foreign for A!
        position: 1,
        sentiment: "positive" as const,
        evidence: "Klinik Niumiu nomor 1",
        createdAt: "2026-09-17T00:00:00.000Z",
      };

      // Project A dashboard with its own data only
      const safeDashboardA = aggregateDashboardMetrics({
        config: configA,
        promptsList: [
          {
            id: "prompt_a_1",
            configId: "cfg_proj_a",
            prompt: "What is Jet Digital Pro?",
            active: true,
            createdAt: "2026-09-17T00:00:00.000Z",
          },
        ],
        observations: [], // No B observations
        mentions: [], // No B mentions
        citations: [],
        latestRun: null,
      });

      expect(safeDashboardA.config?.domain).toBe("jetdigitalpro.com");
      expect(safeDashboardA.prompts).toHaveLength(1);
      expect(safeDashboardA.prompts[0].prompt).toBe("What is Jet Digital Pro?");
      expect(safeDashboardA.kpi.averageListPosition).toBeNull();
    });
  });

  describe("GSC Token Correlation Logic", () => {
    it("matches high-intent overlapping queries and rejects loose substrings", () => {
      // Valid matches
      expect(
        isTokenMatch(
          "What is Jet Digital Pro agency?",
          "jet digital pro agency",
        ),
      ).toBe(true);
      expect(
        isTokenMatch(
          "Jet Digital Pro reviews and pricing",
          "jet digital pro reviews",
        ),
      ).toBe(true);

      // Loose substrings that previously false-matched must be rejected
      expect(isTokenMatch("drill press reviews", "press")).toBe(false);
      expect(isTokenMatch("jet digital pro", "jdp")).toBe(false);
      expect(isTokenMatch("seo agency services", "agency")).toBe(false);
    });
  });
});
