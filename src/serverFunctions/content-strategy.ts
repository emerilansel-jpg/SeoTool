import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
  requireProjectContext,
  requireProjectRole,
} from "@/serverFunctions/middleware";
import { ContentStrategyService } from "@/server/features/content-strategy/services/ContentStrategyService";
import {
  createContentBriefSchema,
  createTopicClusterSchema,
  updateContentBriefSchema,
  updateTopicClusterSchema,
  projectBoundIdSchema,
} from "@/types/schemas/content-strategy";
import { assertFeatureQuota } from "@/server/billing/quota-gate";
import { ProjectRepository } from "@/server/features/projects/repositories/ProjectRepository";
import { AuditRepository } from "@/server/features/audit/repositories/AuditRepository";
import {
  generateContentBriefOutline,
  suggestInternalLinks,
} from "@/server/features/content-strategy/services/briefGeneration";

// === Topic Clusters ===

export const listTopicClusters = createServerFn({ method: "GET" })
  .middleware([requireProjectContext])
  .validator(z.object({ projectId: z.string() }))
  .handler(async ({ data: { projectId } }) => {
    return ContentStrategyService.listTopicClusters(projectId);
  });

const _getTopicCluster = createServerFn({ method: "GET" })
  .middleware([requireProjectContext])
  .validator(projectBoundIdSchema)
  .handler(async ({ data: { id, projectId } }) => {
    return ContentStrategyService.getTopicCluster(id, projectId);
  });

export const createTopicCluster = createServerFn({ method: "POST" })
  .middleware([requireProjectContext, requireProjectRole("member")])
  .validator(createTopicClusterSchema)
  .handler(async ({ data }) => {
    return ContentStrategyService.createTopicCluster(data);
  });

const _updateTopicCluster = createServerFn({ method: "POST" })
  .middleware([requireProjectContext, requireProjectRole("member")])
  .validator(
    z.object({
      id: z.string(),
      projectId: z.string(),
      data: updateTopicClusterSchema,
    }),
  )
  .handler(async ({ data: { id, projectId, data } }) => {
    return ContentStrategyService.updateTopicCluster(id, projectId, data);
  });

const _deleteTopicCluster = createServerFn({ method: "POST" })
  .middleware([requireProjectContext, requireProjectRole("manager")])
  .validator(projectBoundIdSchema)
  .handler(async ({ data: { id, projectId } }) => {
    await ContentStrategyService.deleteTopicCluster(id, projectId);
    return { success: true };
  });

// === Content Briefs ===

export const listContentBriefs = createServerFn({ method: "GET" })
  .middleware([requireProjectContext])
  .validator(z.object({ projectId: z.string() }))
  .handler(async ({ data: { projectId } }) => {
    return ContentStrategyService.listContentBriefs(projectId);
  });

export const getContentBrief = createServerFn({ method: "GET" })
  .middleware([requireProjectContext])
  .validator(projectBoundIdSchema)
  .handler(async ({ data: { id, projectId } }) => {
    return ContentStrategyService.getContentBrief(id, projectId);
  });

export const createContentBrief = createServerFn({ method: "POST" })
  .middleware([requireProjectContext, requireProjectRole("member")])
  .validator(createContentBriefSchema)
  .handler(async ({ data }) => {
    return ContentStrategyService.createContentBrief(data);
  });

export const updateContentBrief = createServerFn({ method: "POST" })
  .middleware([requireProjectContext, requireProjectRole("member")])
  .validator(
    z.object({
      id: z.string(),
      projectId: z.string(),
      data: updateContentBriefSchema,
    }),
  )
  .handler(async ({ data: { id, projectId, data } }) => {
    return ContentStrategyService.updateContentBrief(id, projectId, data);
  });

const _deleteContentBrief = createServerFn({ method: "POST" })
  .middleware([requireProjectContext, requireProjectRole("manager")])
  .validator(projectBoundIdSchema)
  .handler(async ({ data: { id, projectId } }) => {
    await ContentStrategyService.deleteContentBrief(id, projectId);
    return { success: true };
  });

// === Generate Brief via LLM ===

export const generateBriefAi = createServerFn({ method: "POST" })
  .middleware([requireProjectContext, requireProjectRole("member")])
  .validator(projectBoundIdSchema)
  .handler(async ({ data: { id, projectId } }) => {
    const project = await ProjectRepository.getProjectById(projectId);
    if (!project) throw new Error("Project not found");

    // Bill to "content_intelligence" quota. Will throw QUOTA_EXCEEDED if limits are hit.
    await assertFeatureQuota(project.organizationId, "content_intelligence");

    // Fetch brief & context
    const brief = await ContentStrategyService.getContentBrief(id, projectId);
    let clusterContext = null;
    if (brief.clusterId) {
      const cluster = await ContentStrategyService.getTopicCluster(
        brief.clusterId,
        projectId,
      );
      clusterContext =
        cluster.name + (cluster.description ? ` (${cluster.description})` : "");
    }

    // Ping generation service
    const { outline } = await generateContentBriefOutline(
      brief.targetKeyword,
      clusterContext,
    );

    // Look for internal linking opportunities automatically
    let linkedUrls: string[] = [];
    const latestAudit =
      await AuditRepository.getLatestCompletedAuditForProject(projectId);
    if (latestAudit) {
      // Gather relevant keywords for search (primary + secondary)
      const kwForSearch = [
        outline.primaryKeyword,
        ...outline.secondaryKeywords,
      ];
      linkedUrls = await suggestInternalLinks(latestAudit.id, kwForSearch, 5);
    }

    // Embed the internal linking strategy into the generated brief Data JSON
    const payloadToSave = {
      ...outline,
      suggestedInternalLinks: linkedUrls,
    };

    // Update brief
    return ContentStrategyService.updateContentBrief(id, projectId, {
      briefDataJson: JSON.stringify(payloadToSave),
      title: outline.suggestedTitle,
      status: "briefing", // transition the state
    });
  });
