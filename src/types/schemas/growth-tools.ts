import { z } from "zod";

export const contentOutlineInputSchema = z.object({
  projectId: z.string().min(1),
  keyword: z.string().trim().min(2).max(200),
  locationCode: z.coerce.number().int().min(1).max(100000).default(2840),
  languageCode: z.string().trim().min(2).max(10).default("en"),
});
export type ContentOutlineInput = z.infer<typeof contentOutlineInputSchema>;

export const competitorTrafficInputSchema = z.object({
  projectId: z.string().min(1),
  domains: z.array(z.string().trim().min(1).max(253)).min(1).max(5),
  locationCode: z.coerce.number().int().min(1).max(100000).default(2840),
  languageCode: z.string().trim().min(2).max(10).default("en"),
});
export type CompetitorTrafficInput = z.infer<
  typeof competitorTrafficInputSchema
>;

export const competitorTopPagesInputSchema = z.object({
  projectId: z.string().min(1),
  domain: z.string().trim().min(1).max(253),
  locationCode: z.coerce.number().int().min(1).max(100000).default(2840),
  languageCode: z.string().trim().min(2).max(10).default("en"),
  limit: z.coerce.number().int().min(5).max(50).default(20),
});

export const webhookCreateInputSchema = z.object({
  url: z
    .string()
    .trim()
    .url()
    .max(500)
    .refine(
      (value) =>
        value.startsWith("https://") || value.startsWith("http://localhost"),
      {
        message: "Webhook URL must use HTTPS.",
      },
    ),
  events: z
    .array(
      z.enum([
        "audit.completed",
        "report.generated",
        "rank_check.completed",
        "ping",
      ]),
    )
    .min(1),
  projectId: z.string().trim().max(80).optional().nullable(),
});

export const webhookActionInputSchema = z.object({
  webhookId: z.string().min(1),
});

export const webhookUpdateInputSchema = z.object({
  webhookId: z.string().min(1),
  active: z.boolean().optional(),
  events: z
    .array(
      z.enum([
        "audit.completed",
        "report.generated",
        "rank_check.completed",
        "ping",
      ]),
    )
    .min(1)
    .optional(),
});
