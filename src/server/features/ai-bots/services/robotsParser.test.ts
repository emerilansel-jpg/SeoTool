import { describe, expect, it } from "vitest";
import { parseRobotsForBot } from "./robotsParser";

describe("parseRobotsForBot", () => {
  it("detects a specific bot disallowed", () => {
    const robots = [
      "User-agent: GPTBot",
      "Disallow: /",
      "",
      "User-agent: *",
      "Disallow:",
    ].join("\n");
    expect(parseRobotsForBot(robots, "GPTBot")).toBe("disallowed");
  });

  it("detects a specific bot allowed while others are blocked", () => {
    const robots = [
      "User-agent: ClaudeBot",
      "Disallow:",
      "",
      "User-agent: *",
      "Disallow: /",
    ].join("\n");
    expect(parseRobotsForBot(robots, "ClaudeBot")).toBe("allowed");
  });

  it("falls back to the wildcard group", () => {
    const robots = ["User-agent: *", "Disallow: /private/", ""].join("\n");
    expect(parseRobotsForBot(robots, "PerplexityBot")).toBe("allowed");
    expect(parseRobotsForBot(robots, "OAI-SearchBot")).toBe("allowed");
  });

  it("falls back to wildcard disallow-all", () => {
    const robots = ["User-agent: *", "Disallow: /"].join("\n");
    expect(parseRobotsForBot(robots, "Bytespider")).toBe("disallowed");
  });

  it("returns not_mentioned when no group applies", () => {
    const robots = ["User-agent: Googlebot", "Disallow: /"].join("\n");
    expect(parseRobotsForBot(robots, "GPTBot")).toBe("not_mentioned");
  });

  it("matches case-insensitively and ignores comments", () => {
    const robots = [
      "# AI bots not welcome",
      "User-agent: gptbot",
      "Disallow: / # block everything",
    ].join("\n");
    expect(parseRobotsForBot(robots, "GPTBot")).toBe("disallowed");
  });

  it("keeps consecutive User-agent lines in one group", () => {
    const robots = [
      "User-agent: GPTBot",
      "User-agent: ClaudeBot",
      "Disallow: /",
    ].join("\n");
    expect(parseRobotsForBot(robots, "GPTBot")).toBe("disallowed");
    expect(parseRobotsForBot(robots, "ClaudeBot")).toBe("disallowed");
    expect(parseRobotsForBot(robots, "PerplexityBot")).toBe("not_mentioned");
  });
});
