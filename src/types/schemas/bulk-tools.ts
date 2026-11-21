import { z } from "zod";

const bulkListInput = {
  locationCode: z.coerce.number().int().min(1).max(100000).default(2840),
  languageCode: z.string().trim().min(2).max(10).default("en"),
};

export const bulkKeywordMetricsInputSchema = z.object({
  projectId: z.string().min(1),
  keywords: z.array(z.string().trim().min(1).max(200)).min(1).max(1000),
  ...bulkListInput,
});

export const bulkPaaInputSchema = z.object({
  projectId: z.string().min(1),
  keywords: z.array(z.string().trim().min(1).max(200)).min(1).max(20),
  ...bulkListInput,
});

export const bulkAutocompleteInputSchema = z.object({
  projectId: z.string().min(1),
  keywords: z.array(z.string().trim().min(1).max(200)).min(1).max(20),
  ...bulkListInput,
});

export const bulkMentionsInputSchema = z.object({
  projectId: z.string().min(1),
  terms: z.array(z.string().trim().min(1).max(200)).min(1).max(20),
  ...bulkListInput,
});

export const bulkMetadataOptimizerInputSchema = z.object({
  projectId: z.string().min(1),
  auditId: z.string().trim().max(80).optional(),
  maxPages: z.coerce.number().int().min(1).max(20).default(15),
});
