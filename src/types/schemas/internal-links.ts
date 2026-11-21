import { z } from "zod";

export const internalLinksGenerateInputSchema = z.object({
  projectId: z.string().min(1),
  maxSuggestions: z.coerce.number().int().min(1).max(15).default(15),
});

export const internalLinksListInputSchema = z.object({
  projectId: z.string().min(1),
  status: z
    .enum(["pending", "approved", "rejected", "applied", "exported", "all"])
    .default("all"),
});

export const internalLinksStatusInputSchema = z.object({
  projectId: z.string().min(1),
  suggestionId: z.string().min(1),
  status: z.enum(["pending", "approved", "rejected", "applied", "exported"]),
});
