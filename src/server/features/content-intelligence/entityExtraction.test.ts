import { beforeEach, describe, expect, it, vi } from "vitest";

const { generateTextMock, getChatAgentModelMock } = vi.hoisted(() => ({
  generateTextMock: vi.fn(),
  getChatAgentModelMock: vi.fn(),
}));

vi.mock("ai", () => ({ generateText: generateTextMock }));
vi.mock("@/server/lib/openrouter", () => ({
  getChatAgentModel: getChatAgentModelMock,
}));

import {
  extractEntities,
  isOpenRouterAvailable,
  MAX_BODY_CHARS,
} from "@/server/features/content-intelligence/entityExtraction";

function mockLlmResponse(text: string, cost = 0.002) {
  generateTextMock.mockResolvedValueOnce({
    text,
    providerMetadata: {
      openrouter: { usage: { cost } },
    },
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  getChatAgentModelMock.mockResolvedValue({});
});

describe("extractEntities", () => {
  it("parses a clean JSON response", async () => {
    mockLlmResponse(
      JSON.stringify({
        entities: [
          { name: "Google", type: "organization", relevance: 0.95 },
          { name: "SEO", type: "technology", relevance: 0.8 },
        ],
        topics: [{ topic: "search engine optimization", confidence: 0.9 }],
      }),
    );
    const result = await extractEntities("Some page content about SEO.");
    expect(result.entities).toHaveLength(2);
    expect(result.entities[0].name).toBe("Google");
    expect(result.topics).toHaveLength(1);
    expect(result.costUsd).toBe(0.002);
  });

  it("strips markdown fences from the response", async () => {
    mockLlmResponse(
      '```json\n{"entities":[{"name":"Test","type":"product","relevance":0.7}],"topics":[]}\n```',
    );
    const result = await extractEntities("Content");
    expect(result.entities).toHaveLength(1);
    expect(result.entities[0].name).toBe("Test");
  });

  it("extracts JSON from a response with surrounding text", async () => {
    mockLlmResponse(
      'Here is the analysis:\n{"entities":[{"name":"Acme","type":"brand","relevance":0.6}],"topics":[{"topic":"widgets","confidence":0.5}]}\nDone.',
    );
    const result = await extractEntities("Content");
    expect(result.entities).toHaveLength(1);
    expect(result.entities[0].name).toBe("Acme");
  });

  it("returns empty arrays for non-JSON responses", async () => {
    mockLlmResponse("I'm sorry, I cannot analyze this content.");
    const result = await extractEntities("Content");
    expect(result.entities).toEqual([]);
    expect(result.topics).toEqual([]);
    expect(result.costUsd).toBe(0.002);
  });

  it("returns empty arrays for invalid JSON structure", async () => {
    mockLlmResponse('{"unexpected": "shape"}');
    const result = await extractEntities("Content");
    expect(result.entities).toEqual([]);
    expect(result.topics).toEqual([]);
  });

  it("truncates body text to MAX_BODY_CHARS", async () => {
    const longText = "a".repeat(MAX_BODY_CHARS + 5000);
    mockLlmResponse(JSON.stringify({ entities: [], topics: [] }));
    await extractEntities(longText);
    // oxlint-disable-next-line typescript-eslint/no-unsafe-type-assertion -- mock typing is inherently any
    const args = generateTextMock.mock.calls[0][0] as Record<string, unknown>;
    const prompt = String(args.prompt);
    // The prompt includes "Content:\n" prefix + truncated text.
    expect(prompt.length).toBeLessThanOrEqual(MAX_BODY_CHARS + 20);
  });

  it("caps entities to 10 and topics to 5", async () => {
    const entities = Array.from({ length: 15 }, (_, i) => ({
      name: `E${i}`,
      type: "other",
      relevance: 0.5,
    }));
    const topics = Array.from({ length: 10 }, (_, i) => ({
      topic: `T${i}`,
      confidence: 0.5,
    }));
    mockLlmResponse(JSON.stringify({ entities, topics }));
    const result = await extractEntities("Content");
    expect(result.entities).toHaveLength(10);
    expect(result.topics).toHaveLength(5);
  });

  it("catches entity type and relevance with .catch defaults", async () => {
    mockLlmResponse(
      JSON.stringify({
        entities: [{ name: "X", type: "invalid_type", relevance: 2.0 }],
        topics: [{ topic: "Y", confidence: -1 }],
      }),
    );
    const result = await extractEntities("Content");
    expect(result.entities[0].type).toBe("other");
    expect(result.entities[0].relevance).toBe(0.5);
    expect(result.topics[0].confidence).toBe(0.5);
  });
});

describe("isOpenRouterAvailable", () => {
  it("returns true when the model resolves", async () => {
    expect(await isOpenRouterAvailable()).toBe(true);
  });

  it("returns false when the model throws", async () => {
    getChatAgentModelMock.mockRejectedValueOnce(new Error("no key"));
    expect(await isOpenRouterAvailable()).toBe(false);
  });
});
