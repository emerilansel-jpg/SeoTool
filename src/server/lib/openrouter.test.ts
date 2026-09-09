import { describe, expect, it } from "vitest";
import { buildChatAgentModel } from "@/server/lib/openrouter";

describe("openrouter / pesatrouter model factory", () => {
  it("builds model with default pesatrouter endpoint and pesat-pro model", () => {
    const model = buildChatAgentModel("sk-pesat-test");
    expect(model.modelId).toBe("pesat-pro");
    expect(model.provider).toBe("openrouter");
  });

  it("respects custom modelId and baseURL", () => {
    const model = buildChatAgentModel(
      "sk-pesat-test",
      "pesat-flash",
      "https://api.pesatrouter.com/v1",
    );
    expect(model.modelId).toBe("pesat-flash");
  });
});
