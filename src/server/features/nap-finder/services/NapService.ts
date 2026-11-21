import { createDataforseoClient } from "@/server/lib/dataforseo";
import type { BillingCustomerContext } from "@/server/billing/subscription";
import { AppError } from "@/server/lib/errors";
import { NapRepository, type NapResult } from "../repositories/NapRepository";
import { compareAddress, comparePhone, textContainsPhone } from "./napCompare";

// Directories checked per audit. Ordered by local-SEO importance.
export const DEFAULT_DIRECTORIES = [
  "yelp.com",
  "yellowpages.com",
  "bbb.org",
  "mapquest.com",
  "facebook.com",
] as const;

export type NapAuditInput = {
  businessName: string;
  city: string;
  phone?: string | null;
  address?: string | null;
  locationCode?: number;
  languageCode?: string;
  directories?: string[];
};

type NapStatus = NapResult["status"];

export type NapVerdict = Omit<NapResult, "id" | "auditId">;

/** Decide the verdict for one directory from its top SERP result. */
export function verdictForDirectory(input: {
  directory: string;
  url: string | null;
  title: string | null;
  description: string | null;
  referencePhone: string | null;
  referenceAddress: string | null;
}): NapVerdict {
  const {
    directory,
    url,
    title,
    description,
    referencePhone,
    referenceAddress,
  } = input;

  if (!url) {
    return {
      projectId: "",
      directory,
      status: "not_found",
      sourceUrl: null,
      foundName: null,
      foundPhone: null,
      foundAddress: null,
      ratingValue: null,
      ratingCount: null,
      detail:
        "No listing found on this directory for the business + city query.",
    };
  }

  const foundName =
    title
      ?.replace(
        /\s*[-|]\s*(Yelp|Yellow Pages|BBB|Better Business Bureau|MapQuest|Facebook).*$/i,
        "",
      )
      .trim() ?? null;
  const phoneMatches = textContainsPhone(
    `${title ?? ""} ${description ?? ""}`,
    referencePhone,
  );
  const addressMatches = compareAddress(description, referenceAddress);

  let status: NapStatus;
  let detail: string;
  if (referencePhone && phoneMatches === true) {
    status = "consistent";
    detail =
      "Listing found and the reference phone appears on the page snippet.";
  } else if (referencePhone && phoneMatches === false) {
    status = "needs_review";
    detail =
      "Listing found but the reference phone was not in the snippet. Verify manually - the snippet may be truncated.";
  } else if (referenceAddress && addressMatches === true) {
    status = "consistent";
    detail = "Listing found and the address matches the reference address.";
  } else {
    status = "needs_review";
    detail = "Listing found; compare the NAP manually and fix any mismatch.";
  }

  return {
    projectId: "",
    directory,
    status,
    sourceUrl: url,
    foundName,
    foundPhone: null,
    foundAddress: description?.slice(0, 300) ?? null,
    ratingValue: null,
    ratingCount: null,
    detail,
  };
}

/** Decide the verdict for the Google Business Profile row. */
export function verdictForGoogle(input: {
  item: {
    title: string | null;
    phone: string | null;
    address: string | null;
    ratingValue: number | null;
    ratingCount: number | null;
  } | null;
  referencePhone: string | null;
  referenceAddress: string | null;
}): NapVerdict {
  if (!input.item) {
    return {
      projectId: "",
      directory: "google",
      status: "not_found",
      sourceUrl: null,
      foundName: null,
      foundPhone: null,
      foundAddress: null,
      ratingValue: null,
      ratingCount: null,
      detail: "No Google Business Profile match for this name + city.",
    };
  }
  const phoneMatches = comparePhone(input.item.phone, input.referencePhone);
  const addressMatches = compareAddress(
    input.item.address,
    input.referenceAddress,
  );

  let status: NapStatus;
  let detail: string;
  if (phoneMatches === false) {
    status = "mismatch";
    detail = "Google shows a different phone number than the reference NAP.";
  } else if (addressMatches === false) {
    status = "mismatch";
    detail = "Google shows a different address than the reference NAP.";
  } else if (phoneMatches === true || addressMatches === true) {
    status = "consistent";
    detail = "Google Business Profile matches the reference NAP.";
  } else {
    status = "needs_review";
    detail =
      "Profile found; reference phone/address incomplete for auto-compare.";
  }

  return {
    projectId: "",
    directory: "google",
    status,
    sourceUrl: null,
    foundName: input.item.title,
    foundPhone: input.item.phone,
    foundAddress: input.item.address,
    ratingValue: input.item.ratingValue,
    ratingCount: input.item.ratingCount,
    detail,
  };
}

function consistencyScoreOf(verdicts: NapVerdict[]): number {
  const comparable = verdicts.filter(
    (verdict) => verdict.status !== "error" && verdict.status !== "not_found",
  );
  if (comparable.length === 0) return 0;
  const consistent = comparable.filter(
    (verdict) => verdict.status === "consistent",
  ).length;
  return Math.round((consistent / comparable.length) * 100);
}

/** Run a citation audit: Google Business Profile + directory SERP checks.
 *  Metered through the shared DataForSEO client (local_seo attribution). */
async function runNapAudit(
  input: NapAuditInput & { projectId: string },
  billingCustomer: BillingCustomerContext,
): Promise<{ auditId: string; score: number; results: NapVerdict[] }> {
  if (!input.businessName.trim() || !input.city.trim()) {
    throw new AppError(
      "VALIDATION_ERROR",
      "Business name and city are required.",
    );
  }
  const locationCode = input.locationCode ?? 2840;
  const languageCode = input.languageCode ?? "en";
  const directories = (
    input.directories?.length ? input.directories : [...DEFAULT_DIRECTORIES]
  ).slice(0, 8);
  const referencePhone = input.phone?.trim() || null;
  const referenceAddress = input.address?.trim() || null;
  const keyword = `${input.businessName.trim()} ${input.city.trim()}`;

  const dataforseo = createDataforseoClient(billingCustomer);
  const verdicts: NapVerdict[] = [];

  // Google Business Profile (NAP ground truth for the business).
  try {
    const gbp = await dataforseo.business.myBusinessInfo({
      keyword,
      locationCode,
      languageCode,
    });
    verdicts.push(
      verdictForGoogle({
        item: gbp
          ? {
              title: gbp.title ?? null,
              phone: gbp.phone ?? null,
              address: gbp.address ?? null,
              ratingValue: gbp.rating?.value ?? null,
              ratingCount: gbp.rating?.votes_count ?? null,
            }
          : null,
        referencePhone,
        referenceAddress,
      }),
    );
  } catch (error) {
    console.error("[nap-finder] GBP lookup failed:", error);
    verdicts.push({
      projectId: "",
      directory: "google",
      status: "error",
      sourceUrl: null,
      foundName: null,
      foundPhone: null,
      foundAddress: null,
      ratingValue: null,
      ratingCount: null,
      detail: error instanceof Error ? error.message : "GBP lookup failed",
    });
  }

  // One depth-10 SERP per directory. Sequenced so hosted-mode credit
  // reservation settles between calls (same pattern as brand lookup).
  for (const directory of directories) {
    try {
      const serp = await dataforseo.serp.competition({
        keyword: `"${input.businessName.trim()}" ${input.city.trim()} site:${directory}`,
        locationCode,
        languageCode,
        creditFeature: "local_seo",
      });
      const top =
        serp.items.find((item) => item.type === "organic" && item.url) ??
        serp.items.find((item) => item.url) ??
        null;
      verdicts.push(
        verdictForDirectory({
          directory,
          url: top?.url ?? null,
          title: top?.title ?? null,
          description: top?.description ?? null,
          referencePhone,
          referenceAddress,
        }),
      );
    } catch (error) {
      console.error(`[nap-finder] ${directory} lookup failed:`, error);
      verdicts.push({
        projectId: "",
        directory,
        status: "error",
        sourceUrl: null,
        foundName: null,
        foundPhone: null,
        foundAddress: null,
        ratingValue: null,
        ratingCount: null,
        detail: error instanceof Error ? error.message : "SERP lookup failed",
      });
    }
  }

  const score = consistencyScoreOf(verdicts);
  const audit = await NapRepository.createAudit({
    projectId: input.projectId,
    organizationId: billingCustomer.organizationId,
    businessName: input.businessName.trim(),
    city: input.city.trim(),
    phone: referencePhone,
    address: referenceAddress,
    locationCode,
    languageCode,
    consistencyScore: score,
  });
  await NapRepository.insertResults(
    audit.id,
    verdicts.map((verdict) => ({ ...verdict, projectId: input.projectId })),
  );

  return { auditId: audit.id, score, results: verdicts };
}

async function listHistory(projectId: string) {
  const audits = await NapRepository.listAudits(projectId);
  return audits;
}

async function getAudit(projectId: string, auditId: string) {
  const results = await NapRepository.getResultsForAudit(auditId);
  return results;
}

export const NapService = {
  runNapAudit,
  listHistory,
  getAudit,
  DEFAULT_DIRECTORIES,
  consistencyScoreOf,
};
