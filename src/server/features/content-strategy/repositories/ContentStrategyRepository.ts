import { and, desc, eq } from "drizzle-orm";
import type { z } from "zod";
import { db } from "@/db";
import { topicClusters, contentBriefs } from "@/db/schema";
import type {
  createContentBriefSchema,
  createTopicClusterSchema,
  updateContentBriefSchema,
  updateTopicClusterSchema,
} from "@/types/schemas/content-strategy";

export const ContentStrategyRepository = {
  async listTopicClusters(projectId: string) {
    return db
      .select()
      .from(topicClusters)
      .where(eq(topicClusters.projectId, projectId))
      .orderBy(desc(topicClusters.createdAt));
  },

  async getTopicCluster(id: string, projectId: string) {
    const rows = await db
      .select()
      .from(topicClusters)
      .where(
        and(eq(topicClusters.id, id), eq(topicClusters.projectId, projectId)),
      )
      .limit(1);
    return rows[0] ?? null;
  },

  async createTopicCluster(
    id: string,
    data: z.infer<typeof createTopicClusterSchema>,
  ) {
    await db.insert(topicClusters).values({
      id,
      projectId: data.projectId,
      name: data.name,
      description: data.description ?? null,
      pillarPageUrl: data.pillarPageUrl ?? null,
    });
    return ContentStrategyRepository.getTopicCluster(id, data.projectId);
  },

  async updateTopicCluster(
    id: string,
    projectId: string,
    data: z.infer<typeof updateTopicClusterSchema>,
  ) {
    const setValues: Record<string, unknown> = { updatedAt: new Date() };
    if (data.name !== undefined) setValues.name = data.name;
    if (data.description !== undefined)
      setValues.description = data.description;
    if (data.pillarPageUrl !== undefined)
      setValues.pillarPageUrl = data.pillarPageUrl;

    await db
      .update(topicClusters)
      .set(setValues)
      .where(
        and(eq(topicClusters.id, id), eq(topicClusters.projectId, projectId)),
      );

    return ContentStrategyRepository.getTopicCluster(id, projectId);
  },

  async deleteTopicCluster(id: string, projectId: string) {
    await db
      .delete(topicClusters)
      .where(
        and(eq(topicClusters.id, id), eq(topicClusters.projectId, projectId)),
      );
  },

  async listContentBriefs(projectId: string) {
    return db
      .select()
      .from(contentBriefs)
      .where(eq(contentBriefs.projectId, projectId))
      .orderBy(desc(contentBriefs.createdAt));
  },

  async getContentBrief(id: string, projectId: string) {
    const rows = await db
      .select()
      .from(contentBriefs)
      .where(
        and(eq(contentBriefs.id, id), eq(contentBriefs.projectId, projectId)),
      )
      .limit(1);
    return rows[0] ?? null;
  },

  async createContentBrief(
    id: string,
    data: z.infer<typeof createContentBriefSchema>,
  ) {
    await db.insert(contentBriefs).values({
      id,
      projectId: data.projectId,
      clusterId: data.clusterId ?? null,
      targetKeyword: data.targetKeyword,
      title: data.title ?? null,
      status: data.status,
      priorityScore: data.priorityScore ?? null,
      targetUrl: data.targetUrl ?? null,
      briefDataJson: data.briefDataJson ?? null,
    });
    return ContentStrategyRepository.getContentBrief(id, data.projectId);
  },

  async updateContentBrief(
    id: string,
    projectId: string,
    data: z.infer<typeof updateContentBriefSchema>,
  ) {
    const setValues: Record<string, unknown> = { updatedAt: new Date() };
    if (data.targetKeyword !== undefined)
      setValues.targetKeyword = data.targetKeyword;
    if (data.title !== undefined) setValues.title = data.title;
    if (data.status !== undefined) setValues.status = data.status;
    if (data.clusterId !== undefined) setValues.clusterId = data.clusterId;
    if (data.priorityScore !== undefined)
      setValues.priorityScore = data.priorityScore;
    if (data.targetUrl !== undefined) setValues.targetUrl = data.targetUrl;
    if (data.briefDataJson !== undefined)
      setValues.briefDataJson = data.briefDataJson;

    await db
      .update(contentBriefs)
      .set(setValues)
      .where(
        and(eq(contentBriefs.id, id), eq(contentBriefs.projectId, projectId)),
      );

    return ContentStrategyRepository.getContentBrief(id, projectId);
  },

  async deleteContentBrief(id: string, projectId: string) {
    await db
      .delete(contentBriefs)
      .where(
        and(eq(contentBriefs.id, id), eq(contentBriefs.projectId, projectId)),
      );
  },
};
