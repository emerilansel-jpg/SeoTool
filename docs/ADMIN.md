# Admin Area

Platform administration lives under `/admin` (sidebar group "Admin", visible
only to platform admins). Authority is the `PLATFORM_ADMIN_USER_IDS` env
allowlist (comma-separated user IDs); there is no DB-stored admin role. Every
admin server function stacks `requirePlatformAdmin`, and the route layout
returns 404 for non-admins, so the area stays hidden.

Tabs: Overview (existing analytics), Users, Billing, Pricing, Blog, Pages,
API Keys.

## Users (`/admin/users`)

- Search by name or email, server-side pagination.
- Detail page: profile, verification/ban state, session count, organizations
  with plan tier, quota status, and credit balances.
- Actions: ban (with reason, revokes all sessions immediately), unban, force
  logout, manual plan tier change, credit adjustment, PayPal re-sync.
- Guardrails: admins cannot ban themselves or other platform admins.
- Ban enforcement is provided by the Better Auth `admin()` plugin
  (`getSession` rejects banned users). The plugin's HTTP endpoints stay locked
  because no user carries `role="admin"`; the admin UI writes the ban columns
  through its own server functions.

## Billing (`/admin/billing`)

- Subscription list (search by org or owner email) with per-org actions: tier
  override, credit adjustment, re-sync from PayPal.
- Manual tier override mirrors webhook semantics: on a tier change the windowed
  quotas reset and monthly credits are re-granted at the new tier's effective
  grant.
- PayPal webhook event log: every verified delivery is recorded in
  `paypal_webhook_events` (deduplicated by PayPal event id, so retries never
  double-process) with processed/failed status and the raw payload.

### PayPal behaviors worth knowing

- Top-up purchases (`PAYMENT.CAPTURE.COMPLETED` with a `topup-{orgId}-{ts}`
  reference) grant credits at `CREDITS_PER_USD`. Subscription renewals (same
  event type, `custom_id` instead) are excluded.
- Only `BILLING.SUBSCRIPTION.*` payloads are used directly as the subscription
  resource; capture events re-fetch the live subscription from PayPal. (Using
  a capture payload directly derived a free-tier snapshot and downgraded
  paying orgs on every renewal, which is why this rule exists.)
- Webhook signature verification now sends `PAYPAL_WEBHOOK_ID` (editable at
  runtime, see API Keys) instead of an empty string.

## Pricing (`/admin/pricing`)

- Per tier: price (USD/month), monthly credit grant, PayPal plan id, active
  toggle (inactive tiers are hidden from /pricing and /subscribe).
- Values are stored in `plan_config` and layered over the deploy-time
  constants (`src/shared/plans.ts`, `src/shared/billing.ts`) by
  `getEffectivePlanConfigs()` (60s cache). Missing rows fall back to the
  constants, so pricing survives a DB wipe.
- On a price change with a linked PayPal plan, the plan's pricing scheme is
  updated via `POST /v1/billing/plans/{id}/update-pricing-scheme` so the
  charged amount matches the displayed one. If PayPal rejects the call the row
  is marked `pending` and a retry button appears.
- Consumers already on effective pricing: /pricing, /subscribe picker,
  /billing current-plan card, checkout plan-id resolution, webhook plan-id
  resolution, monthly credit grants, MRR estimate.
- Known gap: the marketing site's static pricing page shows deploy-time
  prices until the next marketing rebuild.

## Blog (`/admin/blog`) and Pages (`/admin/pages`)

- Markdown editors with live preview, slug validation (kebab-case, unique),
  draft/published toggle, delete.
- Public rendering: `/blogs` + `/blogs/{slug}` for posts; `/pages/{slug}` for
  custom pages; fixed legal paths (`/privacy`, `/terms-and-conditions`,
  `/cookie-policy`, `/refund-policy`, `/dpa`) serve published `cms_pages`
  rows with the same slug.
- Public routes read through route loaders (repository directly), not server
  functions, so anonymous visitors are never blocked by the auth middleware.
- Seed: migrations `0051`/`0028` import the markdown from `web/content`
  idempotently (ON CONFLICT DO NOTHING). To re-seed edited content, tweak
  `web/content` and run `node scripts/generate-cms-seed.mjs` before migrating.
- Caddy: `/blogs*` and the legal paths are routed to the SaaS app in all
  three Caddyfiles (root, `gateway-caddy/Caddyfile`, `gateway-caddy/Caddyfile.seotool`).

## API Keys (`/admin/api-keys`)

- Status board for every provider (configured/missing, source).
- Editable keys (DataForSEO, OpenRouter, PayPal) are stored in `app_settings`
  and override env vars in `getOptionalEnvValue` (60s cache, empty value
  falls back to env). Bonus: overrides survive alchemy's env reconciliation.
- Secret values are write-only: never returned to the browser after saving.
- Keys read at worker init (Google OAuth, Loops, Turnstile, PostHog, Reddit,
  `PLATFORM_ADMIN_USER_IDS`) are status-only and need a redeploy to change.

## Database

New tables (both SQLite and Postgres, parity-tested):
`app_settings`, `plan_config`, `cms_posts`, `cms_pages`,
`paypal_webhook_events`, plus Better Auth admin plugin columns on `user`
(`role`, `banned`, `ban_reason`, `ban_expires`, `ban_count`) and `session`
(`impersonated_by`).

Migrations: `drizzle/0050_admin_area.sql`, `drizzle/0051_cms_seed.sql` and
their `drizzle-pg` counterparts (created via `drizzle-kit generate --custom`).
The drizzle snapshots are stale (pre-dates this work; `generate` prompts for a
TTY), which is why these are hand-written custom migrations.

## Deploy checklist

1. Run DB migrations (PG: `db:migrate:pg` in the container; D1:
   `db:migrate:local` / `db:migrate:prod`).
2. Deploy the SaaS app (CI/CD as usual).
3. Recreate/reload the caddy container so the updated Caddyfile matchers take
   effect (legal paths and /blogs now proxy to the app).
4. Confirm `PLATFORM_ADMIN_USER_IDS` is set, then sign in as that user.
