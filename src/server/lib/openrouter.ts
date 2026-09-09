import {
  createOpenRouter,
  type LanguageModelV3,
} from "@openrouter/ai-sdk-provider";
import { getOptionalEnvValue } from "@/server/lib/runtime-env";

const DEFAULT_PESATROUTER_BASE_URL = "https://api.pesatrouter.com/v1";
const DEFAULT_CHAT_AGENT_MODEL = "pesat-pro";

/**
 * Returns the AI SDK LanguageModel for the chat agents.
 *
 * PesatRouter gateway is the exclusive LLM provider. Reads from app_settings DB
 * overrides first, then env variables.
 */
export async function getChatAgentModel(): Promise<LanguageModelV3> {
  const apiKey = await getOptionalEnvValue("OPENROUTER_API_KEY");
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is required for the AI chat agents");
  }

  const modelId = await getOptionalEnvValue("OPENROUTER_MODEL");
  const baseURL = await getOptionalEnvValue("OPENROUTER_BASE_URL");
  return buildChatAgentModel(apiKey, modelId, baseURL);
}

/**
 * Synchronous variant for callers that already hold env/cached values.
 */
export function buildChatAgentModel(
  apiKey: string,
  modelId?: string,
  baseURL?: string,
): LanguageModelV3 {
  // ponytail: PesatRouter default gateway; custom endpoint drops openrouter-only routing params
  const resolvedBaseURL = baseURL || DEFAULT_PESATROUTER_BASE_URL;
  const provider = createOpenRouter({ apiKey, baseURL: resolvedBaseURL });
  const isCustomGateway = resolvedBaseURL !== "https://openrouter.ai/api/v1";

  return provider(modelId || DEFAULT_CHAT_AGENT_MODEL, {
    usage: { include: true },
    ...(isCustomGateway
      ? {}
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
