import { describe, expect, it } from "vitest";
import { classifyUserAgent, isAiBotKey, isSearchBaselineBot } from "./ai-bots";

describe("classifyUserAgent", () => {
  const cases: Array<[string | null, string | null]> = [
    [
      "Mozilla/5.0 (compatible; GPTBot/1.2; +https://openai.com/gptbot)",
      "openai_gptbot",
    ],
    [
      "Mozilla/5.0 (compatible; OAI-SearchBot/1.1; +https://openai.com/searchbot)",
      "openai_oai_searchbot",
    ],
    [
      "Mozilla/5.0 (compatible; ChatGPT-User/1.0; +https://openai.com/bot)",
      "openai_chatgpt_user",
    ],
    [
      "Mozilla/5.0 (compatible; ClaudeBot/1.0; +claudebot@anthropic.com)",
      "anthropic_claudebot",
    ],
    [
      "Mozilla/5.0 (compatible; Claude-SearchBot/1.0)",
      "anthropic_claude_searchbot",
    ],
    [
      "Mozilla/5.0 (compatible; PerplexityBot/1.0; +https://perplexity.ai/perplexitybot)",
      "perplexity_bot",
    ],
    ["Mozilla/5.0 (compatible; Perplexity-User/1.0)", "perplexity_user"],
    ["Mozilla/5.0 (compatible; Google-Extended)", "google_extended"],
    [
      "Mozilla/5.0 (compatible; Applebot-Extended; +https://support.apple.com/applebot)",
      "applebot_extended",
    ],
    [
      "Mozilla/5.0 AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15 (Applebot/0.1)",
      "applebot",
    ],
    [
      "meta-externalagent/1.1 (+https://developers.facebook.com/docs/sharing/webmasters/crawler)",
      "meta_externalagent",
    ],
    [
      "Mozilla/5.0 (compatible; Bytespider; spider-feedback@bytedance.com)",
      "bytedance_bytespider",
    ],
    [
      "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
      "googlebot",
    ],
    [
      "Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)",
      "bingbot",
    ],
    ["curl/8.4.0", null],
    [null, null],
    ["", null],
  ];

  for (const [userAgent, expected] of cases) {
    it(`classifies ${userAgent?.slice(0, 40) ?? "null"} -> ${expected ?? "null"}`, () => {
      const bot = classifyUserAgent(userAgent);
      expect(bot?.key ?? null).toBe(expected);
    });
  }

  it("matches tokens case-insensitively", () => {
    expect(classifyUserAgent("MozILLa GPTBOT/1.0")?.key).toBe("openai_gptbot");
  });
});

describe("bot buckets", () => {
  it("puts crawlers in the right bucket", () => {
    expect(isSearchBaselineBot("googlebot")).toBe(true);
    expect(isSearchBaselineBot("bingbot")).toBe(true);
    expect(isAiBotKey("openai_gptbot")).toBe(true);
    expect(isAiBotKey("perplexity_bot")).toBe(true);
    expect(isSearchBaselineBot("openai_gptbot")).toBe(false);
  });
});
