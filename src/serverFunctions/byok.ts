import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireAuthenticatedContext } from "@/serverFunctions/middleware";
import { ByokRepository } from "@/server/features/byok/repositories/ByokRepository";

export const getByokSettings = createServerFn({ method: "GET" })
  .middleware([requireAuthenticatedContext])
  .handler(async ({ context }) => {
    return ByokRepository.getMasked(context.organizationId);
  });

const updateDataForSeoByokSchema = z.object({
  apiKey: z.string().trim().max(500).nullable(),
});

export const updateDataForSeoByok = createServerFn({ method: "POST" })
  .middleware([requireAuthenticatedContext])
  .validator(updateDataForSeoByokSchema)
  .handler(async ({ context, data }) => {
    const rawKey = data.apiKey?.trim() || null;
    await ByokRepository.upsert({
      organizationId: context.organizationId,
      dataforseoApiKey: rawKey,
    });
    return ByokRepository.getMasked(context.organizationId);
  });

const updateAiByokSchema = z.object({
  provider: z.string().trim().min(1).max(50),
  baseUrl: z.string().trim().max(500).nullable().optional(),
  apiKey: z.string().trim().max(500).nullable().optional(),
  model: z.string().trim().max(100).nullable().optional(),
});

export const updateAiByok = createServerFn({ method: "POST" })
  .middleware([requireAuthenticatedContext])
  .validator(updateAiByokSchema)
  .handler(async ({ context, data }) => {
    await ByokRepository.upsert({
      organizationId: context.organizationId,
      aiProvider: data.provider,
      aiBaseUrl: data.baseUrl?.trim() || null,
      aiApiKey: data.apiKey !== undefined ? (data.apiKey?.trim() || null) : undefined,
      aiModel: data.model?.trim() || null,
    });
    return ByokRepository.getMasked(context.organizationId);
  });
