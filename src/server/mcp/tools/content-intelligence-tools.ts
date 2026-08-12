import { z } from "zod";
import { AuditRepository } from "@/server/features/audit/repositories/AuditRepository";
import { ContentIntelligenceService } from "@/server/features/content-intelligence/services/ContentIntelligenceService";
import { AppError } from "@/server/lib/errors";
import { buildProjectMeta } from "@/server/mcp/context";
import { mcpResponse } from "@/server/mcp/formatters";
import { optionalMetaOutputSchema } from "@/server/mcp/output-schemas";
import { withMcpProjectAuth } from "@/server/mcp/project-auth";
import { projectIdSchema } from "@/server/mcp/schemas";
import { formatMcpTable, type McpTableColumn } from "@/server/mcp/table";

const auditIdSchema = z
  .string()
  .optional()
  .describe("Audit ID. If omitted, uses the project's most recent audit.");

async function resolveAuditId(
  projectId: string,
  auditId?: string,
): Promise<string> {
  if (auditId) return auditId;
  const latest = await AuditRepository.getLatestAuditForProject(projectId);
  if (!latest) {
    throw new AppError(
      "NOT_FOUND",
      "No audits exist for this project yet. Start one with run_site_audit.",
    );
  }
  return latest.id;
}

type ScoreRow = {
  score: number;
  depth: number;
  headings: number;
  metadata: number;
  media: number;
  linking: number;
  technical: number;
  words: number;
  flags: number;
  url: string;
};

function summarizeScores(rows: ScoreRow[]): {
  averageScore: number;
  total: number;
  excellent: number;
  good: number;
  fair: number;
  poor: number;
} {
  if (rows.length === 0) {
    return {
      averageScore: 0,
      total: 0,
      excellent: 0,
      good: 0,
      fair: 0,
      poor: 0,
    };
  }
  let total = 0;
  let excellent = 0;
  let good = 0;
  let fair = 0;
  let poor = 0;
  for (const row of rows) {
    total += row.score;
    if (row.score >= 90) excellent += 1;
    else if (row.score >= 70) good += 1;
    else if (row.score >= 50) fair += 1;
    else poor += 1;
  }
  return {
    averageScore: Math.round(total / rows.length),
    total: rows.length,
    excellent,
    good,
    fair,
    poor,
  };
}

const SCORE_COLUMNS: McpTableColumn<ScoreRow>[] = [
  { header: "score", value: (r) => r.score },
  { header: "depth", value: (r) => r.depth },
  { header: "headings", value: (r) => r.headings },
  { header: "metadata", value: (r) => r.metadata },
  { header: "media", value: (r) => r.media },
  { header: "linking", value: (r) => r.linking },
  { header: "technical", value: (r) => r.technical },
  { header: "words", value: (r) => r.words },
  { header: "flags", value: (r) => r.flags },
  { header: "url", value: (r) => r.url },
];

const inputSchema = z.object({
  projectId: projectIdSchema,
  auditId: auditIdSchema,
});
type Args = z.infer<typeof inputSchema>;

export const getContentScoresTool = {
  name: "get_content_scores",
  config: {
    title: "Get content-quality scores",
    description:
      "Read per-page content-quality scores (0-100) with sub-scores (depth, headings, metadata, media, linking, technical) and human-readable flags (thin content, missing H1, etc.) from a completed site audit. Free — reads SeoTool.im state, no credits. Scores come from crawled signals only. Omit auditId for the most recent audit.",
    inputSchema,
    outputSchema: {
      ok: z.boolean(),
      auditId: z.string().optional(),
      reason: z.string().optional(),
      rowCount: z.number().optional(),
      scores: z
        .array(
          z
            .object({
              url: z.string(),
              score: z.number(),
              depthScore: z.number(),
              headingsScore: z.number(),
              metadataScore: z.number(),
              mediaScore: z.number(),
              linkingScore: z.number(),
              technicalScore: z.number(),
              wordCount: z.number(),
              flags: z
                .array(
                  z
                    .object({
                      severity: z.string(),
                      code: z.string(),
                      message: z.string(),
                    })
                    .passthrough(),
                )
                .optional(),
            })
            .passthrough(),
        )
        .optional(),
      summary: z
        .object({
          averageScore: z.number(),
          total: z.number(),
          excellent: z.number(),
          good: z.number(),
          fair: z.number(),
          poor: z.number(),
        })
        .optional(),
      ...optionalMetaOutputSchema,
    },
    annotations: {
      readOnlyHint: true,
      openWorldHint: true,
      destructiveHint: false,
    },
  },
  handler: withMcpProjectAuth(async (args: Args, context) => {
    const meta = buildProjectMeta(context, args.projectId);

    let auditId: string;
    try {
      auditId = await resolveAuditId(args.projectId, args.auditId);
    } catch (error) {
      const code = error instanceof AppError ? error.code : "INTERNAL_ERROR";
      return mcpResponse({
        text:
          error instanceof Error ? error.message : "Could not resolve audit.",
        meta,
        structuredContent: { ok: false, reason: code.toLowerCase() },
      });
    }

    const { scores } = await ContentIntelligenceService.getScoresForAudit(
      auditId,
      args.projectId,
    );

    const rows: ScoreRow[] = scores.map((s) => ({
      score: s.score,
      depth: s.depthScore,
      headings: s.headingsScore,
      metadata: s.metadataScore,
      media: s.mediaScore,
      linking: s.linkingScore,
      technical: s.technicalScore,
      words: s.wordCount,
      flags: s.flags.length,
      url: s.url,
    }));

    const summary = summarizeScores(rows);

    const text =
      rows.length > 0
        ? `${rows.length} scored page(s), avg ${summary.averageScore}/100 (${summary.poor} need work). Worst first.\n${formatMcpTable(rows, SCORE_COLUMNS)}`
        : "No scored pages for this audit.";

    return mcpResponse({
      text,
      meta,
      structuredContent: {
        ok: true,
        auditId,
        rowCount: rows.length,
        scores,
        summary,
      },
    });
  }),
};

// --- Per-page entity/topic extraction tool ---

type EntityRow = {
  url: string;
  entityCount: number;
  topicCount: number;
  topEntities: string;
};

const ENTITY_COLUMNS: McpTableColumn<EntityRow>[] = [
  { header: "entities", value: (r) => r.entityCount },
  { header: "topics", value: (r) => r.topicCount },
  { header: "top_entities", value: (r) => r.topEntities },
  { header: "url", value: (r) => r.url },
];

const entityInputSchema = z.object({
  projectId: projectIdSchema,
  auditId: auditIdSchema,
});

type EntityArgs = z.infer<typeof entityInputSchema>;

export const getPageEntitiesTool = {
  name: "get_page_entities",
  config: {
    title: "Get per-page entity/topic extraction",
    description:
      "Read entity and topic extraction results from a completed site audit. Each page's body text was analyzed by an LLM (OpenRouter) to extract named entities (people, organizations, products, locations, brands, technologies) and main topics. Free — reads stored results, no credits. Omit auditId for the most recent audit.",
    inputSchema: entityInputSchema,
    outputSchema: {
      ok: z.boolean(),
      auditId: z.string().optional(),
      reason: z.string().optional(),
      rowCount: z.number().optional(),
      pages: z
        .array(
          z
            .object({
              url: z.string(),
              entityCount: z.number(),
              topicCount: z.number(),
              entities: z
                .array(
                  z
                    .object({
                      name: z.string(),
                      type: z.string(),
                      relevance: z.number(),
                    })
                    .passthrough(),
                )
                .optional(),
              topics: z
                .array(
                  z
                    .object({
                      topic: z.string(),
                      confidence: z.number(),
                    })
                    .passthrough(),
                )
                .optional(),
            })
            .passthrough(),
        )
        .optional(),
      summary: z
        .object({
          totalPages: z.number(),
          totalEntities: z.number(),
          totalTopics: z.number(),
        })
        .optional(),
      ...optionalMetaOutputSchema,
    },
    annotations: {
      readOnlyHint: true,
      openWorldHint: true,
      destructiveHint: false,
    },
  },
  handler: withMcpProjectAuth(async (args: EntityArgs, context) => {
    const meta = buildProjectMeta(context, args.projectId);

    let auditId: string;
    try {
      auditId = await resolveAuditId(args.projectId, args.auditId);
    } catch (error) {
      const code = error instanceof AppError ? error.code : "INTERNAL_ERROR";
      return mcpResponse({
        text:
          error instanceof Error ? error.message : "Could not resolve audit.",
        meta,
        structuredContent: { ok: false, reason: code.toLowerCase() },
      });
    }

    const { entities } = await ContentIntelligenceService.getEntitiesForAudit(
      auditId,
      args.projectId,
    );

    const rows: EntityRow[] = entities.map((e) => ({
      url: e.url,
      entityCount: e.entities.length,
      topicCount: e.topics.length,
      topEntities: e.entities
        .slice(0, 3)
        .map((ent) => ent.name)
        .join(", "),
    }));

    const totalEntities = entities.reduce(
      (sum, e) => sum + e.entities.length,
      0,
    );
    const totalTopics = entities.reduce((sum, e) => sum + e.topics.length, 0);

    const text =
      rows.length > 0
        ? `${rows.length} page(s), ${totalEntities} entities, ${totalTopics} topics.\n${formatMcpTable(rows, ENTITY_COLUMNS)}`
        : "No entity data for this audit. Entity extraction runs when OpenRouter is configured.";

    return mcpResponse({
      text,
      meta,
      structuredContent: {
        ok: true,
        auditId,
        rowCount: entities.length,
        pages: entities.map((e) => ({
          url: e.url,
          entityCount: e.entities.length,
          topicCount: e.topics.length,
          entities: e.entities,
          topics: e.topics,
        })),
        summary: {
          totalPages: entities.length,
          totalEntities,
          totalTopics,
        },
      },
    });
  }),
};
