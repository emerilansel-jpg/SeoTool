// Client-safe registry of provider settings shown on the admin API Keys
// page. `editable` is true only for keys the server reads through
// getOptionalEnvValue/getRequiredEnvValue (src/server/lib/runtime-env.ts),
// because runtime-env layers the app_settings DB table over env vars. Keys
// read directly from the Cloudflare workers env (auth, Loops, PostHog,
// Reddit, Turnstile) are status-only: changing them requires a redeploy.

export interface AdminSettingDefinition {
  envKey: string;
  label: string;
  secret: boolean;
  editable: boolean;
  hint?: string;
}

export interface AdminSettingGroup {
  provider: string;
  settings: AdminSettingDefinition[];
}

export const ADMIN_SETTING_GROUPS: AdminSettingGroup[] = [
  {
    provider: "DataForSEO",
    settings: [
      {
        envKey: "DATAFORSEO_API_KEY",
        label: "Base64 of email:password (from DataForSEO dashboard)",
        secret: true,
        editable: true,
        hint: "Powers all SERP, keyword, and backlink data. Copy the Base64 credential from your DataForSEO API dashboard.",
      },
    ],
  },
  {
    provider: "OpenPageRank",
    settings: [
      {
        envKey: "OPENPAGERANK_API_KEY",
        label: "API key",
        secret: true,
        editable: true,
        hint: "Powers the low-cost Basic backlink snapshot. Live detailed backlinks continue to use DataForSEO.",
      },
    ],
  },
  {
    provider: "OpenAI",
    settings: [
      {
        envKey: "OPENAI_API_KEY",
        label: "API key",
        secret: true,
        editable: true,
        hint: "Set to use GPT-4o directly from OpenAI instead of OpenRouter. When set, overrides the OpenRouter configuration.",
      },
    ],
  },
  {
    provider: "OpenRouter",
    settings: [
      {
        envKey: "OPENROUTER_API_KEY",
        label: "API key",
        secret: true,
        editable: true,
      },
      {
        envKey: "OPENROUTER_MODEL",
        label: "Default model",
        secret: false,
        editable: true,
      },
      {
        envKey: "OPENROUTER_BASE_URL",
        label: "Base URL",
        secret: false,
        editable: true,
        hint: "Custom gateway endpoint; empty uses openrouter.ai.",
      },
    ],
  },
  {
    provider: "PayPal",
    settings: [
      {
        envKey: "PAYPAL_CLIENT_ID",
        label: "Client ID",
        secret: false,
        editable: true,
      },
      {
        envKey: "PAYPAL_CLIENT_SECRET",
        label: "Client secret",
        secret: true,
        editable: true,
      },
      {
        envKey: "PAYPAL_MODE",
        label: "Mode (live/sandbox)",
        secret: false,
        editable: true,
      },
      {
        envKey: "PAYPAL_WEBHOOK_ID",
        label: "Webhook ID",
        secret: false,
        editable: true,
      },
    ],
  },
  {
    provider: "Google OAuth",
    settings: [
      {
        envKey: "GOOGLE_CLIENT_ID",
        label: "Client ID",
        secret: false,
        editable: false,
        hint: "Read at auth init; redeploy to change.",
      },
      {
        envKey: "GOOGLE_CLIENT_SECRET",
        label: "Client secret",
        secret: true,
        editable: false,
      },
    ],
  },
  {
    provider: "Loops (email)",
    settings: [
      {
        envKey: "LOOPS_API_KEY",
        label: "API key",
        secret: true,
        editable: false,
        hint: "Read at worker init; redeploy to change.",
      },
      {
        envKey: "LOOPS_TRANSACTIONAL_VERIFY_EMAIL_ID",
        label: "Verification template",
        secret: false,
        editable: false,
      },
      {
        envKey: "LOOPS_TRANSACTIONAL_RESET_PASSWORD_ID",
        label: "Password reset template",
        secret: false,
        editable: false,
      },
      {
        envKey: "LOOPS_TRANSACTIONAL_TEAM_INVITE_ID",
        label: "Team invite template",
        secret: false,
        editable: false,
      },
      {
        envKey: "LOOPS_TRANSACTIONAL_WELCOME_ID",
        label: "Welcome template",
        secret: false,
        editable: false,
      },
    ],
  },
  {
    provider: "Cloudflare Turnstile",
    settings: [
      {
        envKey: "TURNSTILE_SITE_KEY",
        label: "Site key",
        secret: false,
        editable: false,
      },
      {
        envKey: "TURNSTILE_SECRET_KEY",
        label: "Secret key",
        secret: true,
        editable: false,
      },
    ],
  },
  {
    provider: "PostHog",
    settings: [
      {
        envKey: "POSTHOG_PUBLIC_KEY",
        label: "Public key",
        secret: false,
        editable: false,
      },
      {
        envKey: "POSTHOG_HOST",
        label: "Host",
        secret: false,
        editable: false,
      },
    ],
  },
  {
    provider: "Reddit Ads",
    settings: [
      {
        envKey: "REDDIT_PIXEL_ID",
        label: "Pixel ID",
        secret: false,
        editable: false,
      },
      {
        envKey: "REDDIT_CONVERSIONS_ACCESS_TOKEN",
        label: "Conversions token",
        secret: true,
        editable: false,
      },
    ],
  },
  {
    provider: "Platform",
    settings: [
      {
        envKey: "PLATFORM_ADMIN_USER_IDS",
        label: "Admin user IDs",
        secret: false,
        editable: false,
        hint: "Comma-separated user IDs; redeploy to change.",
      },
    ],
  },
];
