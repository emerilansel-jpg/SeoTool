import { z } from "zod";
import { getOptionalEnvValue } from "@/server/lib/runtime-env";
import { AppError } from "@/server/lib/errors";

// Raw gateway text generation. The Vercel AI SDK's zod schema rejects
// chat.completion responses our gateway legitimately produces (tool_calls: null
// plus reasoning_content fields) — live QA 2026-11-22 caught every
// generateText() call failing with AI_APICallError "Invalid JSON response" even
// though the model's answer was fine. Features that only need the text should
// use this helper: one POST to /chat/completions, tolerant response parsing.

const DEFAULT_PESATROUTER_BASE_URL = "https://api.pesatrouter.com/v1";
const DEFAULT_CHAT_AGENT_MODEL = "pesat-pro";

export type GatewayConfig = {
  apiKey: string;
  modelId: string;
  baseURL: string;
};

async function resolveGatewayConfig(
  organizationId?: string,
): Promise<GatewayConfig> {
  if (organizationId) {
    try {
      const { ByokRepository } =
        await import("@/server/features/byok/repositories/ByokRepository");
      const byok = await ByokRepository.getByOrganizationId(organizationId);
      if (byok?.aiApiKey) {
        return {
          apiKey: byok.aiApiKey,
          modelId:
            byok.aiModel ||
            (byok.aiProvider === "openai"
              ? "gpt-4o-mini"
              : DEFAULT_CHAT_AGENT_MODEL),
          baseURL:
            byok.aiBaseUrl ||
            (byok.aiProvider === "openai"
              ? "https://api.openai.com/v1"
              : DEFAULT_PESATROUTER_BASE_URL),
        };
      }
    } catch {
      // Fall through to the system default when BYOK lookup fails.
    }
  }
  const apiKey = await getOptionalEnvValue("OPENROUTER_API_KEY");
  if (!apiKey) {
    throw new AppError("INTERNAL_ERROR", "AI gateway is not configured");
  }
  const modelId = await getOptionalEnvValue("OPENROUTER_MODEL");
  const baseURL = await getOptionalEnvValue("OPENROUTER_BASE_URL");
  return {
    apiKey,
    modelId: modelId || DEFAULT_CHAT_AGENT_MODEL,
    baseURL: baseURL || DEFAULT_PESATROUTER_BASE_URL,
  };
}

const completionSchema = z.object({
  choices: z.array(
    z
      .object({
        finish_reason: z.string().nullish(),
        message: z
          .object({
            content: z.string().nullish(),
          })
          .passthrough(),
      })
      .passthrough(),
  ),
});

const GATEWAY_TIMEOUT_MS = 120_000;

/** One text completion via the configured gateway. Retries once on 5xx. */
export async function generateTextViaGateway(input: {
  organizationId?: string;
  prompt: string;
  maxTokens: number;
}): Promise<{ text: string; finishReason: string | null }> {
  const config = await resolveGatewayConfig(input.organizationId);
  const call = () =>
    fetch(`${config.baseURL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: config.modelId,
        messages: [{ role: "user", content: input.prompt }],
        max_tokens: input.maxTokens,
      }),
      signal: AbortSignal.timeout(GATEWAY_TIMEOUT_MS),
    });

  let response = await call();
  if (!response.ok && response.status >= 500) {
    response = await call();
  }
  if (!response.ok) {
    throw new AppError(
      "INTERNAL_ERROR",
      `AI gateway returned HTTP ${response.status}`,
    );
  }

  const parsed = completionSchema.safeParse(await response.json());
  const choice = parsed.success ? parsed.data.choices[0] : undefined;
  const text = choice?.message?.content ?? "";
  if (!text) {
    throw new AppError(
      "INTERNAL_ERROR",
      `AI gateway returned an empty answer (finish_reason: ${choice?.finish_reason ?? "unknown"})`,
    );
  }
  return { text, finishReason: choice?.finish_reason ?? null };
}
