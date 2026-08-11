import { generateText } from "ai";
import { z } from "zod";
import { getChatAgentModel } from "@/server/lib/openrouter";
import { openRouterCostUsd } from "@/server/lib/chatAgent";

/**
 * Per-page entity/topic extraction via LLM (OpenRouter).
 *
 * Sends truncated body text to the configured LLM and parses a structured
 * JSON response into typed entity and topic arrays. The prompt is designed
 * for deterministic JSON output — the model is instructed to return ONLY
 * valid JSON with no markdown fences or explanation.
 *
 * Cost: ~2000 tokens per call (8000-char truncation ≈ 2000 tokens in,
 * ~500 tokens out). At typical OpenRouter rates (~$0.5-2/M tokens) this is
 * ~$0.002/page.
 */

/** Max characters of body text sent to the LLM. Controls token cost. */
export const MAX_BODY_CHARS = 8000;

const ENTITY_TYPES = [
  "person",
  "organization",
  "product",
  "location",
  "brand",
  "technology",
  "other",
] as const;

export type EntityType = (typeof ENTITY_TYPES)[number];

export interface ExtractedEntity {
  name: string;
  type: EntityType;
  relevance: number;
}

export interface ExtractedTopic {
  topic: string;
  confidence: number;
}

export interface EntityExtractionResult {
  entities: ExtractedEntity[];
  topics: ExtractedTopic[];
  costUsd: number;
}

// Zod schema for the LLM response. Uses .passthrough() so extra fields the
// model might add are silently ignored rather than causing a parse failure.
const entitySchema = z
  .object({
    name: z.string().min(1),
    type: z.enum(ENTITY_TYPES).catch("other"),
    relevance: z.number().min(0).max(1).catch(0.5),
  })
  .passthrough();

const topicSchema = z
  .object({
    topic: z.string().min(1),
    confidence: z.number().min(0).max(1).catch(0.5),
  })
  .passthrough();

const llmResponseSchema = z.object({
  entities: z.array(entitySchema).catch([]),
  topics: z.array(topicSchema).catch([]),
});

const SYSTEM_PROMPT = `You are an SEO content analyst. Analyze the given page content and extract:
1. Named entities (people, organizations, products, locations, brands, technologies)
2. Main topics/themes

Respond with ONLY valid JSON — no markdown fences, no explanation, no commentary:
{
  "entities": [{"name": "...", "type": "person|organization|product|location|brand|technology|other", "relevance": 0.0-1.0}],
  "topics": [{"topic": "...", "confidence": 0.0-1.0}]
}

Limit to the top 10 most relevant entities and 5 topics. Relevance and confidence are 0.0-1.0 floats.`;

/**
 * Extract JSON from an LLM response that might be wrapped in markdown fences
 * or include leading/trailing commentary. Returns the raw JSON string.
 */
function extractJsonFromResponse(text: string): string {
  const trimmed = text.trim();
  // Strip ```json ... ``` or ``` ... ``` fences.
  const fenceMatch = trimmed.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
  if (fenceMatch) return fenceMatch[1].trim();
  // Try to find the first { ... } block.
  const jsonMatch = trimmed.match(/\{[\s\S]*\}/);
  if (jsonMatch) return jsonMatch[0];
  return trimmed;
}

/**
 * Extract entities and topics from page body text via LLM.
 *
 * @param bodyText - Visible page text (script/style stripped). Truncated to
 *   MAX_BODY_CHARS before sending to the LLM.
 * @returns Parsed entities/topics + the real USD cost of the LLM call.
 * @throws If the OpenRouter API key is missing or the LLM call fails.
 */
export async function extractEntities(
  bodyText: string,
): Promise<EntityExtractionResult> {
  const truncated =
    bodyText.length > MAX_BODY_CHARS
      ? bodyText.slice(0, MAX_BODY_CHARS)
      : bodyText;

  const model = await getChatAgentModel();
  const result = await generateText({
    model,
    system: SYSTEM_PROMPT,
    prompt: `Content:\n${truncated}`,
    maxOutputTokens: 800,
  });

  const costUsd = openRouterCostUsd(result.providerMetadata);

  let parsed;
  try {
    const json = extractJsonFromResponse(result.text);
    parsed = llmResponseSchema.safeParse(JSON.parse(json));
  } catch {
    // JSON.parse failed — the model returned non-JSON. Return empty.
    return { entities: [], topics: [], costUsd };
  }

  if (!parsed.success) {
    return { entities: [], topics: [], costUsd };
  }

  return {
    entities: parsed.data.entities.slice(0, 10),
    topics: parsed.data.topics.slice(0, 5),
    costUsd,
  };
}

/** Check whether the OpenRouter API key is configured. */
export async function isOpenRouterAvailable(): Promise<boolean> {
  try {
    await getChatAgentModel();
    return true;
  } catch {
    return false;
  }
}
