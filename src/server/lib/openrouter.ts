import {
  createOpenRouter,
  type LanguageModelV3,
} from "@openrouter/ai-sdk-provider";
import {
  getOptionalEnvValue,
  getRequiredEnvValue,
} from "@/server/lib/runtime-env";

// OpenRouter model slug used for the in-app chat agents (onboarding + SAM).
// Override with OPENROUTER_MODEL to swap models without a code change.
const DEFAULT_CHAT_AGENT_MODEL = "minimax/minimax-m3";

// Model used when OPENAI_API_KEY is set (direct OpenAI, bypasses OpenRouter).
const DEFAULT_OPENAI_MODEL = "gpt-4o";

/**
 * Returns the AI SDK LanguageModel for the chat agents. Resolution order:
 *
 * 1. OPENAI_API_KEY set → direct OpenAI API (api.openai.com/v1) with GPT-4o.
 *    No OpenRouter routing, no reasoning channel (GPT-4o is not a reasoning
 *    model and rejects `reasoning_effort`).
 * 2. Otherwise → OpenRouter (openrouter.ai or OPENROUTER_BASE_URL gateway).
 *
 * OpenRouter mode details: `usage: { include: true }` turns on usage
 * accounting so each response carries its real USD cost
 * (providerMetadata.openrouter.usage.cost) — which we meter against the
 * shared usage-credit pool. `provider.order` prefers Together, then Atlas
 * Cloud (fp8); `zdr: true` restricts routing to Zero-Data-Retention
 * endpoints. `reasoning` separates the model's chain-of-thought from the
 * visible answer text.
 *
 * When a custom baseURL is set (gateway or OpenAI), OpenRouter-specific
 * options (`order`/`zdr`/`allow_fallbacks`) and the `reasoning` channel are
 * dropped so non-OpenRouter endpoints don't reject the request body.
 */
export async function getChatAgentModel(): Promise<LanguageModelV3> {
  // Direct OpenAI: highest priority, bypasses OpenRouter entirely.
  const openaiKey = await getOptionalEnvValue("OPENAI_API_KEY");
  if (openaiKey) {
    const openaiModel =
      (await getOptionalEnvValue("OPENAI_MODEL")) ?? DEFAULT_OPENAI_MODEL;
    return buildChatAgentModel(
      openaiKey,
      openaiModel,
      "https://api.openai.com/v1",
    );
  }

  const apiKey = await getRequiredEnvValue("OPENROUTER_API_KEY");
  const modelId = await getOptionalEnvValue("OPENROUTER_MODEL");
  const baseURL = await getOptionalEnvValue("OPENROUTER_BASE_URL");
  return buildChatAgentModel(apiKey, modelId, baseURL);
}

/**
 * Synchronous variant for callers that already hold the env values. Think's
 * `getModel()` hook is sync and runs on every turn, so the SAM agent reads the
 * key/model from its DO env and builds the model here.
 */
export function buildChatAgentModel(
  apiKey: string,
  modelId?: string,
  baseURL?: string,
): LanguageModelV3 {
  const provider = createOpenRouter(baseURL ? { apiKey, baseURL } : { apiKey });
  return provider(modelId ?? DEFAULT_CHAT_AGENT_MODEL, {
    usage: { include: true },
    ...(baseURL
      ? {
          // Custom gateway / direct OpenAI: no reasoning channel (GPT-4o and
          // other non-reasoning models reject reasoning_effort), no
          // OpenRouter-specific routing options.
        }
      : {
          reasoning: { effort: "medium" },
          provider: {
            order: ["together", "atlas-cloud/fp8"],
            zdr: true,
            allow_fallbacks: true,
          },
        }),
  });
}
