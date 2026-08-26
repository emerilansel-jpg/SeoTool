import { z } from "zod";
import {
  BacklinksBulkBacklinksLiveRequestInfo,
  BacklinksBulkRanksLiveRequestInfo,
  BacklinksBulkReferringDomainsLiveRequestInfo,
  BacklinksBulkSpamScoreLiveRequestInfo,
} from "dataforseo-client";
import { backlinksApi } from "@/server/lib/dataforseo/core";
import {
  assertOk,
  buildTaskBilling,
  parseTaskItems,
} from "@/server/lib/dataforseo/envelope";
import { createDataforseoBillingClassifier } from "@/server/lib/dataforseoBillingClassification";
import { AppError } from "@/server/lib/errors";

type BacklinksBulkRequest = {
  targets: string[];
  apiKey?: string;
};

const classifyBacklinksError = createDataforseoBillingClassifier({
  pathPrefix: "/backlinks/",
  billingIssueCode: "BACKLINKS_BILLING_ISSUE",
  billingIssueMessage:
    "The connected DataForSEO account has a billing or balance issue",
});

export const backlinksBulkRankItemSchema = z
  .object({ target: z.string(), rank: z.number().nullable().optional() })
  .passthrough();
export const backlinksBulkBacklinkItemSchema = z
  .object({ target: z.string(), backlinks: z.number().nullable().optional() })
  .passthrough();
export const backlinksBulkSpamItemSchema = z
  .object({ target: z.string(), spam_score: z.number().nullable().optional() })
  .passthrough();
export const backlinksBulkReferringDomainItemSchema = z
  .object({
    target: z.string(),
    referring_domains: z.number().nullable().optional(),
    referring_main_domains: z.number().nullable().optional(),
  })
  .passthrough();

const assertOptions = (path: string) =>
  ({ classify: classifyBacklinksError, classifyPath: path }) as const;

function assertBulkTargets(targets: string[]) {
  if (targets.length === 0 || targets.length > 1000) {
    throw new AppError(
      "VALIDATION_ERROR",
      "Backlink competition requires between 1 and 1,000 targets",
    );
  }
}

export async function fetchBacklinksBulkRanks(input: BacklinksBulkRequest) {
  assertBulkTargets(input.targets);
  const response = await backlinksApi(
    classifyBacklinksError,
    input.apiKey,
  ).bulkRanksLive([
    new BacklinksBulkRanksLiveRequestInfo({
      targets: input.targets,
      rank_scale: "one_hundred",
    }),
  ]);
  const task = assertOk(
    response,
    assertOptions("/v3/backlinks/bulk_ranks/live"),
  );
  return {
    data: parseTaskItems(
      "backlinks-bulk-ranks-live",
      task,
      backlinksBulkRankItemSchema,
    ),
    billing: buildTaskBilling(task),
  };
}

export async function fetchBacklinksBulkBacklinks(input: BacklinksBulkRequest) {
  assertBulkTargets(input.targets);
  const response = await backlinksApi(
    classifyBacklinksError,
    input.apiKey,
  ).bulkBacklinksLive([
    new BacklinksBulkBacklinksLiveRequestInfo({ targets: input.targets }),
  ]);
  const task = assertOk(
    response,
    assertOptions("/v3/backlinks/bulk_backlinks/live"),
  );
  return {
    data: parseTaskItems(
      "backlinks-bulk-backlinks-live",
      task,
      backlinksBulkBacklinkItemSchema,
    ),
    billing: buildTaskBilling(task),
  };
}

export async function fetchBacklinksBulkSpamScores(
  input: BacklinksBulkRequest,
) {
  assertBulkTargets(input.targets);
  const response = await backlinksApi(
    classifyBacklinksError,
    input.apiKey,
  ).bulkSpamScoreLive([
    new BacklinksBulkSpamScoreLiveRequestInfo({ targets: input.targets }),
  ]);
  const task = assertOk(
    response,
    assertOptions("/v3/backlinks/bulk_spam_score/live"),
  );
  return {
    data: parseTaskItems(
      "backlinks-bulk-spam-score-live",
      task,
      backlinksBulkSpamItemSchema,
    ),
    billing: buildTaskBilling(task),
  };
}

export async function fetchBacklinksBulkReferringDomains(
  input: BacklinksBulkRequest,
) {
  assertBulkTargets(input.targets);
  const response = await backlinksApi(
    classifyBacklinksError,
    input.apiKey,
  ).bulkReferringDomainsLive([
    new BacklinksBulkReferringDomainsLiveRequestInfo({
      targets: input.targets,
    }),
  ]);
  const task = assertOk(
    response,
    assertOptions("/v3/backlinks/bulk_referring_domains/live"),
  );
  return {
    data: parseTaskItems(
      "backlinks-bulk-referring-domains-live",
      task,
      backlinksBulkReferringDomainItemSchema,
    ),
    billing: buildTaskBilling(task),
  };
}

export type BacklinksBulkRankItem = z.infer<typeof backlinksBulkRankItemSchema>;
