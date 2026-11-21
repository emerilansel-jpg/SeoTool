import { createDataforseoClient } from "@/server/lib/dataforseo";
import type { BillingCustomerContext } from "@/server/billing/subscription";
import { AppError } from "@/server/lib/errors";

// DataForSEO historical bulk traffic accepts up to 5 targets per call.
const MAX_DOMAINS = 5;

export type TrafficComparisonRow = {
  domain: string;
  latestMonth: string | null;
  organicTraffic: number | null;
  etv: number | null;
  series: Array<{ month: string; traffic: number; etv: number }>;
};

function normalizeDomain(domain: string): string {
  return domain
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/.*$/, "");
}

function monthKey(year: number, month: number): string {
  return `${year}-${String(month).padStart(2, "0")}`;
}

/** Multi-domain traffic comparison: monthly estimated organic traffic +
 *  traffic value for each domain, plus top pages per domain on demand. */
async function compareDomains(
  input: { domains: string[]; locationCode?: number; languageCode?: string },
  billingCustomer: BillingCustomerContext,
): Promise<{ rows: TrafficComparisonRow[] }> {
  const domains = [...new Set(input.domains.map(normalizeDomain))]
    .filter(Boolean)
    .slice(0, MAX_DOMAINS);
  if (domains.length === 0) {
    throw new AppError("VALIDATION_ERROR", "Provide at least one domain.");
  }
  const locationCode = input.locationCode ?? 2840;
  const languageCode = input.languageCode ?? "en";
  const dataforseo = createDataforseoClient(billingCustomer);

  const series = await dataforseo.domain.historicalTraffic({
    targets: domains,
    locationCode,
    languageCode,
    creditFeature: "domain_overview",
  });

  const rows: TrafficComparisonRow[] = series.map((entry) => {
    const sorted = entry.points.toSorted(
      (a, b) => a.year * 12 + a.month - (b.year * 12 + b.month),
    );
    const latest = sorted[sorted.length - 1] ?? null;
    return {
      domain: entry.target,
      latestMonth: latest ? monthKey(latest.year, latest.month) : null,
      organicTraffic: latest?.organicTraffic ?? null,
      etv: latest?.etv ?? null,
      series: sorted.map((point) => ({
        month: monthKey(point.year, point.month),
        traffic: point.organicTraffic,
        etv: point.etv,
      })),
    };
  });

  return { rows };
}

/** Top pages by estimated traffic for one domain. */
async function topPages(
  input: {
    domain: string;
    locationCode?: number;
    languageCode?: string;
    limit?: number;
  },
  billingCustomer: BillingCustomerContext,
): Promise<{
  pages: Array<{
    url: string;
    traffic: number | null;
    etv: number | null;
    keywords: number | null;
  }>;
}> {
  const domain = normalizeDomain(input.domain);
  if (!domain) throw new AppError("VALIDATION_ERROR", "A domain is required.");
  const locationCode = input.locationCode ?? 2840;
  const languageCode = input.languageCode ?? "en";
  const dataforseo = createDataforseoClient(billingCustomer);

  const result = await dataforseo.domain.relevantPages({
    target: domain,
    locationCode,
    languageCode,
    limit: input.limit ?? 20,
  });

  // Sort by estimated traffic client-side: DataForSEO rejected our earlier
  // order_by value live ("Invalid Field"), so the default order + client sort
  // is the reliable path.
  const sorted = result.items.toSorted(
    (a, b) =>
      (b.metrics?.organic?.count ?? 0) - (a.metrics?.organic?.count ?? 0),
  );

  return {
    pages: sorted.slice(0, input.limit ?? 20).map((item) => ({
      url: item.url ?? "",
      traffic: item.metrics?.organic?.count ?? null,
      etv: item.metrics?.organic?.etv ?? null,
      keywords: item.metrics?.organic?.count ?? null,
    })),
  };
}

export const CompetitorTrafficService = {
  compareDomains,
  topPages,
  MAX_DOMAINS,
};
