import type {
  PromptExplorerModel,
  WebSearchCountryCode,
} from "@/types/schemas/ai-search";

const MENTION_PLATFORM_LABELS: Record<"chat_gpt" | "google", string> = {
  chat_gpt: "ChatGPT",
  google: "Google AI Overview",
};

const MODEL_LABELS: Record<PromptExplorerModel, string> = {
  chat_gpt: "ChatGPT",
  claude: "Claude",
  gemini: "Gemini",
  perplexity: "Perplexity",
};

/**
 * Per-model accent classes. Applied as left-border + dot on response cards so
 * the model header is unambiguously separated from the markdown content that
 * follows. Classes come from app.css (platform-border/dot-*) so raw palette
 * colors stay out of JSX and work in light + dark themes.
 */
type ModelAccent = {
  border: string;
  dot: string;
};

const MODEL_ACCENTS: Record<PromptExplorerModel, ModelAccent> = {
  chat_gpt: {
    border: "platform-border-chatgpt",
    dot: "platform-dot-chatgpt",
  },
  claude: {
    border: "platform-border-claude",
    dot: "platform-dot-claude",
  },
  gemini: {
    border: "platform-border-gemini",
    dot: "platform-dot-gemini",
  },
  perplexity: {
    border: "platform-border-perplexity",
    dot: "platform-dot-perplexity",
  },
};

export function formatPlatformLabel(platform: "chat_gpt" | "google"): string {
  return MENTION_PLATFORM_LABELS[platform];
}

/** Shared per-platform accent dot + short label for compact table/KPI rows. */
export const PLATFORM_DOT_CLASS: Record<"chat_gpt" | "google", string> = {
  chat_gpt: "platform-dot-chatgpt",
  google: "platform-dot-google",
};

export const PLATFORM_SHORT_LABEL: Record<"chat_gpt" | "google", string> = {
  chat_gpt: "ChatGPT",
  google: "Google",
};

export function formatModelLabel(model: PromptExplorerModel): string {
  return MODEL_LABELS[model];
}

export function getModelAccent(model: PromptExplorerModel): ModelAccent {
  return MODEL_ACCENTS[model];
}

const COUNTRY_LABELS: Record<WebSearchCountryCode, string> = {
  US: "United States",
  GB: "United Kingdom",
  CA: "Canada",
  AU: "Australia",
  IE: "Ireland",
  DE: "Germany",
  FR: "France",
  ES: "Spain",
  IT: "Italy",
  NL: "Netherlands",
  PT: "Portugal",
  PL: "Poland",
  SE: "Sweden",
  NO: "Norway",
  DK: "Denmark",
  BR: "Brazil",
  MX: "Mexico",
  IN: "India",
  JP: "Japan",
  KR: "South Korea",
  SG: "Singapore",
  HK: "Hong Kong",
  TW: "Taiwan",
  ZA: "South Africa",
};

export function formatCountryLabel(code: WebSearchCountryCode): string {
  return COUNTRY_LABELS[code];
}

const NUMBER_FORMATTER = new Intl.NumberFormat("en-US");

/** Render a count for display. Null/undefined renders as an em-dash. */
export function formatCount(value: number | null | undefined): string {
  if (value == null) return "—";
  return NUMBER_FORMATTER.format(value);
}
