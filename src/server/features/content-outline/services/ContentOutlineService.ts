import { generateText } from "ai";
import { createDataforseoClient } from "@/server/lib/dataforseo";
import type { BillingCustomerContext } from "@/server/billing/subscription";
import { getChatAgentModel } from "@/server/lib/openrouter";
import { AppError } from "@/server/lib/errors";
import { extractHeadings } from "./headingExtractor";

const MAX_SERP_PAGES = 8;
const FETCH_TIMEOUT_MS = 7_000;
const MAX_HTML_BYTES = 600_000;

export type CompetitorHeadingMap = {
  url: string;
  title: string | null;
  h2s: string[];
  h3s: string[];
  fetchOk: boolean;
};

/** SERP top-10 for the keyword -> scrape each page's headings -> LLM outline. */
async function buildContentOutline(
  input: {
    projectId: string;
    keyword: string;
    locationCode?: number;
    languageCode?: string;
  },
  billingCustomer: BillingCustomerContext,
): Promise<{
  keyword: string;
  serpTitles: string[];
  headingMaps: CompetitorHeadingMap[];
  outline: string;
}> {
  const keyword = input.keyword.trim();
  if (!keyword)
    throw new AppError("VALIDATION_ERROR", "A keyword is required.");
  const locationCode = input.locationCode ?? 2840;
  const languageCode = input.languageCode ?? "en";

  const dataforseo = createDataforseoClient(billingCustomer);
  const serp = await dataforseo.serp.competition({
    keyword,
    locationCode,
    languageCode,
    creditFeature: "keyword_research",
  });
  const organic = serp.items
    .filter((item) => item.type === "organic" && item.url)
    .slice(0, MAX_SERP_PAGES);
  const serpTitles = serp.items
    .filter((item) => item.type === "organic")
    .slice(0, MAX_SERP_PAGES)
    .map((item) => item.title ?? "")
    .filter(Boolean);

  // Scrape each result for headings; failures just drop that page from the map.
  const headingMaps: CompetitorHeadingMap[] = [];
  await Promise.all(
    organic.map(async (item) => {
      const url = item.url as string;
      try {
        const response = await fetch(url, {
          headers: {
            "User-Agent": "Mozilla/5.0 (compatible; SeoTool.im-Outline/1.0)",
          },
          signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
        });
        const raw = (await response.text()).slice(0, MAX_HTML_BYTES);
        const { h2s, h3s } = extractHeadings(raw);
        headingMaps.push({
          url,
          title: item.title ?? null,
          h2s,
          h3s,
          fetchOk: true,
        });
      } catch {
        headingMaps.push({
          url,
          title: item.title ?? null,
          h2s: [],
          h3s: [],
          fetchOk: false,
        });
      }
    }),
  );
  headingMaps.sort(
    (a, b) =>
      organic.findIndex((item) => item.url === a.url) -
      organic.findIndex((item) => item.url === b.url),
  );

  const model = await getChatAgentModel(billingCustomer.organizationId);
  const result = await generateText({
    model,
    maxOutputTokens: 2000,
    prompt: [
      `Build a content outline for the target keyword: "${keyword}".`,
      "Below are the top-ranking pages' headings (in rank order). Synthesize the common structure, fill gaps, and improve on it.",
      "Output a clean markdown outline: H2s as ## and H3s as ###, each heading followed by a one-line note of what to cover. No preamble, start with the outline directly.",
      "Headings from competitors:",
      ...headingMaps
        .filter((map) => map.fetchOk)
        .flatMap((map, index) => [
          `${index + 1}. ${map.url}`,
          ...map.h2s.map((h2) => `  - ${h2}`),
          ...map.h3s.map((h3) => `    · ${h3}`),
        ]),
    ].join("\n"),
  });

  return { keyword, serpTitles, headingMaps, outline: result.text.trim() };
}

export const ContentOutlineService = {
  buildContentOutline,
  extractHeadings,
};
