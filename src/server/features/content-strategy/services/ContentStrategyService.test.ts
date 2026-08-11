import { describe, expect, it, vi, beforeEach } from "vitest";
import { ContentStrategyService } from "./ContentStrategyService";
import type { ContentStrategyRepository } from "../repositories/ContentStrategyRepository";

type TopicCluster = NonNullable<
  Awaited<ReturnType<(typeof ContentStrategyRepository)["getTopicCluster"]>>
>;
type ContentBrief = NonNullable<
  Awaited<ReturnType<(typeof ContentStrategyRepository)["getContentBrief"]>>
>;

// vi.hoisted() ensures these are available when vi.mock is hoisted
const { createTopicClusterMock, getTopicClusterMock, createContentBriefMock } =
  vi.hoisted(() => ({
    createTopicClusterMock: vi.fn(),
    getTopicClusterMock: vi.fn(),
    createContentBriefMock: vi.fn(),
  }));

vi.mock("../repositories/ContentStrategyRepository", () => ({
  ContentStrategyRepository: {
    listTopicClusters: vi.fn(),
    getTopicCluster: getTopicClusterMock,
    createTopicCluster: createTopicClusterMock,
    updateTopicCluster: vi.fn(),
    deleteTopicCluster: vi.fn(),
    listContentBriefs: vi.fn(),
    getContentBrief: vi.fn(),
    createContentBrief: createContentBriefMock,
    updateContentBrief: vi.fn(),
    deleteContentBrief: vi.fn(),
  },
}));

describe("ContentStrategyService", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe("Topic Clusters", () => {
    it("createTopicCluster - delegates to repo", async () => {
      // oxlint-disable-next-line typescript-eslint/no-unsafe-type-assertion -- mock narrowing is intentional
      createTopicClusterMock.mockResolvedValueOnce({
        id: "cl-1",
        name: "Cluster1",
      } as TopicCluster);

      const res = await ContentStrategyService.createTopicCluster({
        projectId: "p-1",
        name: "Cluster1",
      });

      expect(res).toEqual({ id: "cl-1", name: "Cluster1" });
      expect(createTopicClusterMock).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ projectId: "p-1", name: "Cluster1" }),
      );
    });

    it("getTopicCluster - throws if not found", async () => {
      getTopicClusterMock.mockResolvedValueOnce(null);
      await expect(
        ContentStrategyService.getTopicCluster("cl-1", "p-1"),
      ).rejects.toThrow("Topic cluster not found");
    });
  });

  describe("Content Briefs", () => {
    it("createContentBrief - validates cluster existence when provided", async () => {
      getTopicClusterMock.mockResolvedValueOnce(null);

      await expect(
        ContentStrategyService.createContentBrief({
          projectId: "p-1",
          targetKeyword: "kw",
          clusterId: "bad-cl",
          status: "idea",
        }),
      ).rejects.toThrow("Topic cluster not found");
    });

    it("createContentBrief - succeeds when cluster not provided", async () => {
      // oxlint-disable-next-line typescript-eslint/no-unsafe-type-assertion -- mock narrowing is intentional
      createContentBriefMock.mockResolvedValueOnce({
        id: "br-1",
        targetKeyword: "kw",
      } as ContentBrief);

      const res = await ContentStrategyService.createContentBrief({
        projectId: "p-1",
        targetKeyword: "kw",
        status: "idea",
      });

      expect(res).toEqual({ id: "br-1", targetKeyword: "kw" });
      expect(getTopicClusterMock).not.toHaveBeenCalled();
    });
  });
});
