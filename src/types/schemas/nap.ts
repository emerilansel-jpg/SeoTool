import { z } from "zod";

export const napAuditInputSchema = z.object({
  projectId: z.string().min(1),
  businessName: z.string().trim().min(2).max(200),
  city: z.string().trim().min(1).max(120),
  phone: z.string().trim().max(40).optional().nullable(),
  address: z.string().trim().max(300).optional().nullable(),
  locationCode: z.coerce.number().int().min(1).max(100000).default(2840),
  languageCode: z.string().trim().min(2).max(10).default("en"),
  directories: z.array(z.string().trim().max(120)).max(8).optional(),
});
export type NapAuditInput = z.infer<typeof napAuditInputSchema>;

export const napHistoryInputSchema = z.object({
  projectId: z.string().min(1),
});

export const napAuditResultsInputSchema = z.object({
  projectId: z.string().min(1),
  auditId: z.string().min(1),
});

export const gbpProfileInputSchema = z.object({
  projectId: z.string().min(1),
  keyword: z.string().trim().min(2).max(300),
  locationCode: z.coerce.number().int().min(1).max(100000).default(2840),
  languageCode: z.string().trim().min(2).max(10).default("en"),
});

export const gbpFetchReviewsInputSchema = z.object({
  projectId: z.string().min(1),
  keyword: z.string().trim().min(2).max(300),
  locationCode: z.coerce.number().int().min(1).max(100000).default(2840),
  languageCode: z.string().trim().min(2).max(10).default("en"),
  depth: z.coerce.number().int().min(1).max(50).default(20),
});

export const gbpCheckTaskInputSchema = z.object({
  projectId: z.string().min(1),
  taskId: z.string().trim().min(5).max(120),
});

export const gbpReviewsListInputSchema = z.object({
  projectId: z.string().min(1),
  limit: z.coerce.number().int().min(10).max(200).default(100),
});
