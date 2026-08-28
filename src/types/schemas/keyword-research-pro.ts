import { z } from "zod";

const byokCredentialSchema = z
  .string()
  .trim()
  .min(8)
  .max(500)
  .refine((value) => !/\s/.test(value), "Credential cannot contain spaces");

export const keywordResearchProSchema = z
  .object({
    projectId: z.string().min(1),
    keywords: z.array(z.string().trim().min(1).max(200)).min(1).max(25),
    locationCode: z.number().int().positive().optional(),
    languageCode: z.string().min(2).max(8).optional(),
    mode: z.enum(["basic", "full"]).default("basic"),
    billingMode: z.enum(["standard", "byok"]).default("standard"),
    byokCredential: byokCredentialSchema.optional(),
  })
  .superRefine((value, context) => {
    if (value.mode === "full" && value.keywords.length > 10) {
      context.addIssue({
        code: "custom",
        path: ["keywords"],
        message: "Full backlink research supports up to 10 keywords per run",
      });
    }
    if (value.billingMode === "byok" && !value.byokCredential) {
      context.addIssue({
        code: "custom",
        path: ["byokCredential"],
        message: "DataForSEO credential is required for BYOK",
      });
    }
  });

export type KeywordResearchProInput = z.infer<typeof keywordResearchProSchema>;
export type ResolvedKeywordResearchProInput = KeywordResearchProInput & {
  locationCode: number;
  languageCode: string;
};
