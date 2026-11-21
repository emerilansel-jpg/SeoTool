// Canonical taxonomy of crawler user agents relevant to Answer Engine
// Optimization (AEO): AI assistants, AI answer engines, AI training crawlers,
// and the classic search engine crawlers used as the baseline for the
// "AI vs Search" ratio. Shared between the ingest classifier, the log parser,
// and the dashboard so matching can never drift between layers.
//
// Matching is a case-insensitive substring test on the User-Agent against
// `tokens`, checked in order. First match wins, so more specific tokens must
// be listed before looser ones (e.g. "OAI-SearchBot" before "GPTBot" is fine —
// they don't overlap — but "Perplexity-User" must precede any bare "Bot" rule
// if one existed).

export type AiBotCategory =
  | "ai_search"
  | "ai_assistant"
  | "ai_training"
  | "search";

export type AiBotDefinition = {
  /** Canonical key stored in the DB and used as a grouping key in the UI. */
  key: string;
  /** Display name (matches the operator's published product name). */
  label: string;
  /** Operator/company for grouping in the dashboard. */
  operator: string;
  category: AiBotCategory;
  /** Case-insensitive substrings that identify this bot in a User-Agent. */
  tokens: string[];
};

export const AI_BOTS: AiBotDefinition[] = [
  {
    key: "openai_oai_searchbot",
    label: "OAI-SearchBot",
    operator: "OpenAI",
    category: "ai_search",
    tokens: ["oai-searchbot"],
  },
  {
    key: "openai_chatgpt_user",
    label: "ChatGPT-User",
    operator: "OpenAI",
    category: "ai_assistant",
    tokens: ["chatgpt-user"],
  },
  {
    key: "openai_gptbot",
    label: "GPTBot",
    operator: "OpenAI",
    category: "ai_training",
    tokens: ["gptbot"],
  },
  {
    key: "anthropic_claude_searchbot",
    label: "Claude-SearchBot",
    operator: "Anthropic",
    category: "ai_search",
    tokens: ["claude-searchbot"],
  },
  {
    key: "anthropic_claude_user",
    label: "Claude-User",
    operator: "Anthropic",
    category: "ai_assistant",
    tokens: ["claude-user"],
  },
  {
    key: "anthropic_claudebot",
    label: "ClaudeBot",
    operator: "Anthropic",
    category: "ai_training",
    tokens: ["claudebot"],
  },
  {
    key: "perplexity_bot",
    label: "PerplexityBot",
    operator: "Perplexity",
    category: "ai_search",
    tokens: ["perplexitybot"],
  },
  {
    key: "perplexity_user",
    label: "Perplexity-User",
    operator: "Perplexity",
    category: "ai_assistant",
    tokens: ["perplexity-user"],
  },
  {
    key: "google_extended",
    label: "Google-Extended",
    operator: "Google",
    category: "ai_training",
    tokens: ["google-extended"],
  },
  {
    key: "google_gemini_user",
    label: "Gemini-User / Google-CloudVertexBot",
    operator: "Google",
    category: "ai_assistant",
    tokens: ["gemini-user", "google-cloudvertexbot"],
  },
  {
    key: "applebot_extended",
    label: "Applebot-Extended",
    operator: "Apple",
    category: "ai_training",
    tokens: ["applebot-extended"],
  },
  {
    key: "applebot",
    label: "Applebot (Siri/Spotlight)",
    operator: "Apple",
    category: "ai_assistant",
    tokens: ["applebot"],
  },
  {
    key: "meta_externalagent",
    label: "Meta-ExternalAgent",
    operator: "Meta",
    category: "ai_training",
    tokens: ["meta-externalagent"],
  },
  {
    key: "bytedance_bytespider",
    label: "Bytespider",
    operator: "ByteDance",
    category: "ai_training",
    tokens: ["bytespider"],
  },
  {
    key: "youbot",
    label: "YouBot",
    operator: "You.com",
    category: "ai_search",
    tokens: ["youbot"],
  },
  {
    key: "mistralai_user",
    label: "MistralAI-User",
    operator: "Mistral AI",
    category: "ai_assistant",
    tokens: ["mistralai-user"],
  },
  {
    key: "cohere_browser",
    label: "Cohere AI",
    operator: "Cohere",
    category: "ai_training",
    tokens: ["cohere-ai"],
  },
  {
    key: "deepseek_bot",
    label: "DeepSeekBot",
    operator: "DeepSeek",
    category: "ai_training",
    tokens: ["deepseekbot", "deepseek"],
  },
  {
    key: "googlebot",
    label: "Googlebot",
    operator: "Google",
    category: "search",
    tokens: ["googlebot"],
  },
  {
    key: "bingbot",
    label: "Bingbot",
    operator: "Microsoft",
    category: "search",
    tokens: ["bingbot"],
  },
  {
    key: "yandexbot",
    label: "YandexBot",
    operator: "Yandex",
    category: "search",
    tokens: ["yandexbot"],
  },
  {
    key: "duckduckbot",
    label: "DuckDuckBot",
    operator: "DuckDuckGo",
    category: "search",
    tokens: ["duckduckbot"],
  },
];

// Note: plain "Applebot" maps to the assistant bucket above (Siri/Spotlight
// indexing); Apple's dedicated web-search crawler is covered by the same UA.

/** User agents we deliberately ignore: generic/unknown crawlers that would
 *  pollute the AEO dashboard. Returned for hits that match nothing. */
export const UNKNOWN_BOT_KEY = "other";

export function classifyUserAgent(
  userAgent: string | null | undefined,
): AiBotDefinition | null {
  if (!userAgent) return null;
  const ua = userAgent.toLowerCase();
  for (const bot of AI_BOTS) {
    if (bot.tokens.some((token) => ua.includes(token))) {
      return bot;
    }
  }
  return null;
}

/** Whether a bot key belongs to the search-engine baseline (Googlebot etc.). */
export function isSearchBaselineBot(key: string): boolean {
  return AI_BOTS.find((bot) => bot.key === key)?.category === "search";
}

/** Whether a bot key belongs to any AI bucket (search/assistant/training). */
export function isAiBotKey(key: string): boolean {
  const category = AI_BOTS.find((bot) => bot.key === key)?.category;
  return (
    category === "ai_search" ||
    category === "ai_assistant" ||
    category === "ai_training"
  );
}

export const AI_BOT_CATEGORY_LABELS: Record<AiBotCategory, string> = {
  ai_search: "AI Search",
  ai_assistant: "AI Assistant",
  ai_training: "AI Training",
  search: "Search Engine",
};

/** Bots checked against robots.txt for the compliance panel, with the exact
 *  User-agent token the robots parser should match. Training and search-capture
 *  bots are the ones operators honor in robots.txt. */
export const ROBOTS_CHECK_BOTS: Array<{ key: string; uaToken: string }> = [
  { key: "openai_gptbot", uaToken: "GPTBot" },
  { key: "openai_oai_searchbot", uaToken: "OAI-SearchBot" },
  { key: "anthropic_claudebot", uaToken: "ClaudeBot" },
  { key: "anthropic_claude_searchbot", uaToken: "Claude-SearchBot" },
  { key: "perplexity_bot", uaToken: "PerplexityBot" },
  { key: "google_extended", uaToken: "Google-Extended" },
  { key: "applebot_extended", uaToken: "Applebot-Extended" },
  { key: "meta_externalagent", uaToken: "Meta-ExternalAgent" },
  { key: "bytedance_bytespider", uaToken: "Bytespider" },
];
