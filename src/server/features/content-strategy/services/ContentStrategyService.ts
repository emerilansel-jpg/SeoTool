import { ContentStrategyRepository } from "../repositories/ContentStrategyRepository";
import { AppError } from "@/server/lib/errors";
import type {
  createContentBriefSchema,
  createTopicClusterSchema,
  updateContentBriefSchema,
  updateTopicClusterSchema,
} from "@/types/schemas/content-strategy";
import type { z } from "zod";

export const ContentStrategyService = {
  async listTopicClusters(projectId: string) {
    return ContentStrategyRepository.listTopicClusters(projectId);
  },

  async getTopicCluster(id: string, projectId: string) {
    const cluster = await ContentStrategyRepository.getTopicCluster(
      id,
      projectId,
    );
    if (!cluster) {
      throw new AppError("NOT_FOUND", "Topic cluster not found");
    }
    return cluster;
  },

  async createTopicCluster(data: z.infer<typeof createTopicClusterSchema>) {
    const id = crypto.randomUUID();
    return ContentStrategyRepository.createTopicCluster(id, data);
  },

  async updateTopicCluster(
    id: string,
    projectId: string,
    data: z.infer<typeof updateTopicClusterSchema>,
  ) {
    await ContentStrategyService.getTopicCluster(id, projectId); // verify ownership natively
    return ContentStrategyRepository.updateTopicCluster(id, projectId, data);
  },

  async deleteTopicCluster(id: string, projectId: string) {
    await ContentStrategyService.getTopicCluster(id, projectId);
    await ContentStrategyRepository.deleteTopicCluster(id, projectId);
  },

  async listContentBriefs(projectId: string) {
    return ContentStrategyRepository.listContentBriefs(projectId);
  },

  async getContentBrief(id: string, projectId: string) {
    const brief = await ContentStrategyRepository.getContentBrief(
      id,
      projectId,
    );
    if (!brief) {
      throw new AppError("NOT_FOUND", "Content brief not found");
    }
    return brief;
  },

  async createContentBrief(data: z.infer<typeof createContentBriefSchema>) {
    const id = crypto.randomUUID();
    // Validate cluster ownership if provided
    if (data.clusterId) {
      await ContentStrategyService.getTopicCluster(
        data.clusterId,
        data.projectId,
      );
    }
    return ContentStrategyRepository.createContentBrief(id, data);
  },

  async updateContentBrief(
    id: string,
    projectId: string,
    data: z.infer<typeof updateContentBriefSchema>,
  ) {
    await ContentStrategyService.getContentBrief(id, projectId);
    // Validate cluster ownership if jumping clusters
    if (data.clusterId) {
      await ContentStrategyService.getTopicCluster(data.clusterId, projectId);
    }
    return ContentStrategyRepository.updateContentBrief(id, projectId, data);
  },

  async deleteContentBrief(id: string, projectId: string) {
    await ContentStrategyService.getContentBrief(id, projectId);
    await ContentStrategyRepository.deleteContentBrief(id, projectId);
  },
};
