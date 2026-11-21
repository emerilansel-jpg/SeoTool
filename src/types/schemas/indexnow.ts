import { z } from "zod";

export const indexNowSetupInputSchema = z.object({
  projectId: z.string().min(1),
  host: z.string().trim().min(1).max(253),
});

export const indexNowActionInputSchema = z.object({
  projectId: z.string().min(1),
});

export const indexNowToggleInputSchema = z.object({
  projectId: z.string().min(1),
  autoSubmit: z.boolean(),
});

export const indexNowSubmitInputSchema = z.object({
  projectId: z.string().min(1),
  urls: z.array(z.string().trim().min(1).max(2000)).min(1).max(10_000),
});
export type IndexNowSubmitInput = z.infer<typeof indexNowSubmitInputSchema>;
