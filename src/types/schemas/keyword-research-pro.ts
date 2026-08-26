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
    keywords: z.array(z.string().trim().min(1).max(200)).min(1).max(10),
    locationCode: z.number().int().positive().optional(),
    languageCode: z.string().min(2).max(8).optional(),
    mode: z.enum(["basic", "full"]).default("basic"),
    billingMode: z.enum(["standard", "byok"]).default("standard"),
    byokCredential: byokCredentialSchema.optional(),
  })
  .superRefine((value, context) => {
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
