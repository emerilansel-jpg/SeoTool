import {
  SerpGoogleAutocompleteLiveAdvancedRequestInfo,
  SerpGoogleOrganicLiveAdvancedRequestInfo,
} from "dataforseo-client";
import { serpApi } from "@/server/lib/dataforseo/core";
import {
  assertOk,
  buildTaskBilling,
  type DataforseoApiResponse,
} from "@/server/lib/dataforseo/envelope";

// Bulk-tools fetchers: PAA questions and autocomplete suggestions per keyword.
// PAA uses depth 2 — live QA showed depth 1 often omits the people_also_ask
// element entirely; depth 2 reliably carries it without extra cost beyond the
// per-request bill.

export async function fetchPaaQuestions(input: {
  keyword: string;
  locationCode: number;
  languageCode: string;
  apiKey?: string;
}): Promise<DataforseoApiResponse<{ keyword: string; questions: string[] }>> {
  const response = await serpApi(input.apiKey).googleOrganicLiveAdvanced([
    new SerpGoogleOrganicLiveAdvancedRequestInfo({
      keyword: input.keyword,
      location_code: input.locationCode,
      language_code: input.languageCode,
      device: "desktop",
      os: "windows",
      depth: 2,
    }),
  ]);
  const task = assertOk(response, { treatNoResultsAsEmpty: true });
  const questions: string[] = [];
  for (const element of task.result?.[0]?.items ?? []) {
    if (element.type === "people_also_ask" && Array.isArray(element.items)) {
      for (const question of element.items) {
        if (question && typeof question === "object" && "title" in question) {
          const title = (question as { title?: unknown }).title;
          if (typeof title === "string" && title.length > 0) {
            questions.push(title);
          }
        }
      }
    }
  }
  return {
    data: { keyword: input.keyword, questions },
    billing: buildTaskBilling(task),
  };
}

export async function fetchAutocompleteSuggestions(input: {
  keyword: string;
  locationCode: number;
  languageCode: string;
  apiKey?: string;
}): Promise<DataforseoApiResponse<{ keyword: string; suggestions: string[] }>> {
  const response = await serpApi(input.apiKey).googleAutocompleteLiveAdvanced([
    new SerpGoogleAutocompleteLiveAdvancedRequestInfo({
      keyword: input.keyword,
      location_code: input.locationCode,
      language_code: input.languageCode,
    }),
  ]);
  const task = assertOk(response, { treatNoResultsAsEmpty: true });
  const suggestions = (task.result?.[0]?.items ?? [])
    .map((item) =>
      item && typeof item === "object" && "suggestion" in item
        ? (item as { suggestion?: unknown }).suggestion
        : undefined,
    )
    .filter(
      (keyword): keyword is string =>
        typeof keyword === "string" && keyword.length > 0,
    );
  return {
    data: { keyword: input.keyword, suggestions },
    billing: buildTaskBilling(task),
  };
}
