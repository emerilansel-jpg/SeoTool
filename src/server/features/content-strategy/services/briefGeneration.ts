import { generateText } from "ai";
import { and, eq, like, or } from "drizzle-orm";
import { getChatAgentModel } from "@/server/lib/openrouter";
import { openRouterCostUsd } from "@/server/lib/chatAgent";
import {
  generatedBriefOutlineSchema,
  type GeneratedBriefOutline,
} from "@/types/schemas/content-strategy";
import { db } from "@/db";
import { pageEntities } from "@/db/schema";
import { AppError } from "@/server/lib/errors";

export interface BriefGenerationResult {
  outline: GeneratedBriefOutline;
  costUsd: number;
}

const BRIEF_SYSTEM_PROMPT = `You are an expert SEO content strategist.
Your task is to generate a comprehensive content brief outline based on the user's target keyword and related cluster context.
Analyze the target keyword to identify its search intent, suggest a compelling SEO-optimized title and meta description.
Create an outline structure using h2 and h3 headings, with 2-3 key talking points for each heading.
Additionally, provide a list of highly relevant secondary LSI keywords to include.

Return the output STRICTLY as valid JSON matching this schema:
{
  "searchIntent": "informational" | "transactional" | "navigational" | "commercial",
  "primaryKeyword": "...",
  "secondaryKeywords": ["...", "..."],
  "suggestedTitle": "...",
  "metaDescription": "...",
  "outline": [
    { "heading": "...", "level": "h2" | "h3", "keyPoints": ["...", "..."] }
  ]
}

Ensure the response is ONLY raw JSON. Do not wrap it in markdown fences (no \`\`\`json) and provide absolutely no conversation or explanation.`;

/**
 * Strips markdown code fences from the LLM output.
 * Some models ignore the "no markdown fences" instruction and wrap the JSON anyway.
 */
function extractJsonFromResponse(text: string): string {
  const trimmed = text.trim();
  if (trimmed.startsWith("```")) {
    const match = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/);
    if (match && match[1]) {
      return match[1];
    }
  }
  return trimmed;
}

export async function generateContentBriefOutline(
  targetKeyword: string,
  clusterContext?: string | null,
): Promise<BriefGenerationResult> {
  const model = await getChatAgentModel();

  const prompt = `Target Keyword: ${targetKeyword}\n${
    clusterContext ? `Cluster/Topic Context: ${clusterContext}` : ""
  }`;

  const result = await generateText({
    model,
    system: BRIEF_SYSTEM_PROMPT,
    prompt,
    maxOutputTokens: 1500,
  });

  const costUsd = openRouterCostUsd(result.providerMetadata);

  try {
    const json = extractJsonFromResponse(result.text);
    const parsed = generatedBriefOutlineSchema.parse(JSON.parse(json));

    return {
      outline: parsed,
      costUsd,
    };
  } catch {
    throw new AppError(
      "INTERNAL_ERROR",
      "LLM returned invalid or unparseable JSON for content brief",
    );
  }
}

/**
 * Scans the latest completed audit's entities (if any matches exist)
 * to suggest internal links for a generated brief.
 * This uses a lightweight query against stringified JSON columns to locate pages
 * with topics/entities that overlap with the new brief's topics.
 */
export async function suggestInternalLinks(
  auditId: string,
  keywords: string[],
  limit = 5,
) {
  if (!keywords.length) return [];

  // We use Drizzle's `like` operator to perform a naive search within the JSON strings.
  // This avoids unpacking massive rows in-memory and works identically on Postgres/SQLite.
  // We trim and sanitize search terms to avoid injection issues and bad likes.
  const terms = keywords
    .map((k) =>
      k
        .toLowerCase()
        .replace(/[^a-z0-9 ]/g, "")
        .trim(),
    )
    .filter((k) => k.length > 2);

  if (!terms.length) return [];

  // Build an array of OR conditions for both topics and entities overlapping with the given words
  const orConditions = terms.flatMap((term) => [
    like(pageEntities.topicsJson, `%${term}%`),
    like(pageEntities.entitiesJson, `%${term}%`),
  ]);

  const rows = await db
    .select({
      id: pageEntities.id,
      url: pageEntities.url,
    })
    .from(pageEntities)
    .where(and(eq(pageEntities.auditId, auditId), or(...orConditions)))
    .limit(limit);

  // Return distinct URLs
  const uniqueUrls = Array.from(new Set(rows.map((r) => r.url)));
  return uniqueUrls;
}
