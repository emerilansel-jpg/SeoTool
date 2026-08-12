# Rencana: Transformasi SeoTool.im → SaaS Hosted (Ahrefs/Semrush-style)

## Keputusan (dari user)

- **Runtime**: Workerd di Docker (pakai `Dockerfile.selfhost` yang sudah ada) + Postgres
- **Billing**: Tiered plan + per-feature quota (Ahrefs-style: Free/Lite/Pro/Agency)
- **Self-host**: Hapus `cloudflare_access` & `local_noauth` — hanya `hosted`

## Temuan Kunci dari Eksplorasi

Codebase ini **sudah 80% SaaS**. Yang sudah ada dan tetap dipakai:

- Auth hosted: Better Auth (email/password, Google OAuth, verifikasi email, Turnstile, org auto-create)
- Billing: Autumn/Stripe (base plan $10 + credit pool)
- Multi-tenant: organization-scoped projects, RBAC
- Marketing site terpisah di `web/` dengan pricing page
- Audit capacity free/paid tiers sudah ada

Yang diubah: **billing model** (1 plan + credit pool → 4 tier + per-feature quota) + **hapus self-host mode**.

---

## FASE 1 — Plan Tier Config & Quota System (Foundation)

### 1.1 Definisi Plan Tier

File baru: `src/shared/plans.ts`

```
┌──────────┬────────┬────────┬────────┬─────────────┐
│          │  Free  │  Lite  │  Pro   │  Agency     │
├──────────┼────────┼────────┼────────┼─────────────┤
│ Price/mo │  $0    │  $49   │  $149  │  $499       │
│ Plan ID  │  free  │  lite  │  pro   │  agency     │
├──────────┼────────┼────────┼────────┼─────────────┤
│ Projects │   1    │   5    │   25   │  Unlimited  │
│ KW Search│  10/d  │  100/d │  500/d │  Unlimited  │
│ KW Saved │   50   │  500   │  5000  │  Unlimited  │
│ Rank Trk │   0    │   50   │   500  │  5000       │
│ Backlink│   0    │  10/d  │  100/d │  500/d      │
│ Site Aud │ 1x50pg│ 3x500  │10x5000 │ 50x10000    │
│ AI Brand │   0    │  10/mo │  50/mo │  200/mo     │
│ AI Prompt│   0    │  20/mo │ 100/mo │  500/mo     │
│ GA4+GSC  │  ✓    │  ✓     │  ✓     │  ✓          │
│ Reports  │   0    │   5    │   25   │  Unlimited  │
│ SAM Agent│   ✗   │  ✓     │  ✓     │  ✓          │
│ MCP Tools│   ✗   │  ✓     │  ✓     │  ✓          │
└──────────┴────────┴────────┴────────┴─────────────┘
```

### 1.2 Quota DB Schema

File baru: `src/db/quota.schema.ts` + `src/db/pg/quota.schema.ts` (+ daftar di barrel `schema.ts`)

```
usage_quota: per-feature quota per org, reset per window
  - organization_id (FK→organization, CASCADE)
  - feature (text: "keyword_search", "rank_check", "backlink_check", ...)
  - period ("daily" | "monthly")
  - used (int)
  - window_start, window_end (ISO timestamp)
  - UNIQUE(organization_id, feature, period)

subscription: link org → Autumn plan tier
  - organization_id (PK, FK→organization)
  - plan_tier ("free" | "lite" | "pro" | "agency")
  - autumn_subscription_id
  - status, current_period_end
```

### 1.3 QuotaService

File baru: `src/server/features/billing/services/QuotaService.ts`

- `checkQuota(orgId, feature)` → `{ allowed, used, limit, resetAt }`
- `incrementQuota(orgId, feature, count)` → throws `QUOTA_EXCEEDED`
- `getPlanTier(orgId)` → `PlanTier`
- `getQuotaState(orgId)` → per-feature summary (untuk UI)
- `resetQuotaIfWindowElapsed(orgId, feature)` — daily = midnight UTC, monthly = subscription period

### 1.4 Plan Quota Config

File baru: `src/shared/plan-quotas.ts`

```typescript
export const PLAN_TIERS = {
  free:   { price: 0,   limits: { projects: 1, keywordSearchPerDay: 10, ... } },
  lite:   { price: 49,  limits: { projects: 5, keywordSearchPerDay: 100, ... } },
  pro:    { price: 149, limits: { projects: 25, keywordSearchPerDay: 500, ... } },
  agency: { price: 499, limits: { projects: Infinity, keywordSearchPerDay: Infinity, ... } },
}
```

---

## FASE 2 — Hapus Self-Host Mode (Simplification)

### 2.1 Simplify Auth Mode

- `src/lib/auth-mode.ts`: hapus `cloudflare_access` & `local_noauth`, hanya `hosted`
- Hapus `AUTH_MODES` array → hardcoded `"hosted"`
- `isHostedAuthMode()` selalu `true`
- `src/middleware/ensure-user/resolve.ts`: hanya panggil `resolveHostedContext`

### 2.2 Hapus Cloudflare Access Dependencies

- Hapus `src/middleware/ensure-user/cloudflareAccess.ts`
- Hapus `src/middleware/ensure-user/delegated.ts` (local_noauth)
- Hapus `src/server/auth/delegated-organization.ts`
- Hapus env: `TEAM_DOMAIN`, `POLICY_AUD`, `ACCESS_ALLOWED_EMAILS`
- Hapus `jose` dependency (hanya dipakai untuk CF Access JWT)

### 2.3 Update Docker/Deploy

- `compose.yaml`: `AUTH_MODE=hosted` + semua hosted env vars
- `.env.selfhost.example` → `.env.hosted.example` dengan semua hosted vars

---

## FASE 3 — Integrate Quota ke Billing Pipeline

### 3.1 Quota Gate Function

File baru: `src/server/billing/quota-gate.ts`

```typescript
async function assertQuotaAvailable(orgId, feature) {
  const tier = await QuotaService.getPlanTier(orgId);
  const limit = PLAN_TIERS[tier].limits[feature];
  if (limit === 0) throw new AppError("PLAN_LIMIT_REACHED", { feature });
  if (limit === Infinity) return;
  await QuotaService.checkAndIncrement(orgId, feature, 1);
}
```

### 3.2 Hook ke Setiap Feature (update existing files)

- `keyword-research/` → gate `keyword_search` quota
- `backlinks/` → gate `backlink_check` quota
- `audit/` → gate `site_audit` quota + project count
- `rank-tracking/` → gate `rank_tracking` quota + tracked keywords count
- `ai-brand-lookup/` → gate `ai_brand_lookup` quota
- `ai-prompt-explorer/` → gate `ai_prompt` quota
- `content-intelligence/` → gate `content_intelligence` quota
- `reports/` → gate `reports` quota
- Project creation → gate `projects` quota

### 3.3 Update Audit Capacity

`src/server/features/audit/services/audit-capacity.ts`:

- `free`/`paid` → baca dari `PLAN_TIERS[tier].limits.auditPagesPerAudit`

### 3.4 SAM Agent & MCP Gating

- SAM chat: gate plan tier (Free = blocked)
- MCP tools: gate plan tier (Free = blocked)

---

## FASE 4 — Autumn Plan Configuration

### 4.1 Dokumentasi Autumn Plans

File baru: `docs/AUTUMN_PLANS.md` — 4 plan di Autumn dashboard (free/lite/pro/agency)

### 4.2 Update Subscription Sync

`src/server/billing/customer-status-sync.ts`:

- Sync `subscription.plan_tier` dari Autumn subscription
- Update `subscription` table saat webhook event

### 4.3 Update Webhook Handler

`src/server/billing/autumn-webhook.ts`:

- Handle `subscription.created/updated/canceled`
- Update `subscription` table + reset quotas on plan change

### 4.4 Credit Pool → Overage

`src/server/billing/subscription.ts`:

- `trackUsageCreditSpend()` tetap untuk analytics
- `assertUsageCreditsAvailable()` → ganti `assertQuotaAvailable()`
- Top-up credits tetap sebagai "overage" mechanism

---

## FASE 5 — UI: Plan Selector, Quota Display, Paywall

### 5.1 Pricing Page (Marketing)

Update `web/src/routes/_marketing/pricing.tsx`:

- Estimator slider → 4-tier comparison table (Ahrefs-style)
- Tiap tier: price, feature list, CTA → sign-up

### 5.2 Billing Page (App)

Update `src/routes/_app/billing.tsx`:

- Current plan + usage bars per feature (used/limit)
- Plan upgrade/downgrade (link ke Autumn checkout)
- "Manage Subscription" → Stripe portal

### 5.3 Quota Bar Component

File baru: `src/client/features/billing/QuotaBar.tsx`

- Feature name, used/limit, progress bar, reset time
- Color: green (<70%), yellow (70-90%), red (>90%)
- "Unlimited" badge untuk Infinity

### 5.4 Plan-Gated UI

Update `src/client/features/billing/HostedPlanGate.tsx`:

- `isFreePlan` → `planTier: PlanTier`
- Gate features by tier (SAM, MCP, Reports, AI)

### 5.5 Error Handling

Update `src/middleware/errorHandling.ts` + `src/shared/error-codes.ts`:

- `QUOTA_EXCEEDED` → toast dengan upgrade CTA
- `PLAN_LIMIT_REACHED` → modal dengan plan comparison

### 5.6 Subscribe Page

Update `src/routes/_authenticated.subscribe.tsx`:

- Single $10 plan → 4-tier picker
- Stripe checkout redirect per tier

---

## FASE 6 — Landing Page Polish

### 6.1 Homepage

Update `web/src/components/landing-page.tsx`:

- Positioning sebagai Ahrefs/Semrush alternative
- Feature comparison table vs competitors
- CTA → pricing page

### 6.2 Feature Pages

Update `web/src/lib/feature-pages.ts`:

- Feature pages untuk tiap fitur (keyword research, rank tracking, dll)
- SEO-optimized programmatic pages

---

## FASE 7 — Deployment & VPS Config

### 7.1 Docker Compose untuk VPS

File baru: `docker-compose.hosted.yaml`

```yaml
services:
  open-seo:
    build: .
    env_file: .env.hosted
    environment:
      - AUTH_MODE=hosted
      - DATABASE_PROVIDER=postgres
    ports: ["3001:3001"]
    depends_on: [postgres]
    volumes: [open_seo_data:/app/.wrangler]
  postgres:
    image: postgres:17-alpine
    environment: { POSTGRES_DB: openseo, ... }
    volumes: [pg_data:/var/lib/postgresql/data]
  caddy:
    image: caddy:2-alpine
    ports: ["80:80", "443:443"]
    volumes: [./Caddyfile:/etc/caddy/Caddyfile, caddy_data:/data]
volumes: { open_seo_data: {}, pg_data: {}, caddy_data: {} }
```

### 7.2 Caddyfile (Reverse Proxy + TLS)

File baru: `Caddyfile`

### 7.3 Env Template

File baru: `.env.hosted.example` — semua hosted vars (BETTER_AUTH_SECRET, GOOGLE_CLIENT_ID/SECRET, DATAFORSEO_API_KEY, AUTUMN_SECRET_KEY, OPENROUTER_API_KEY, TURNSTILE, LOOPS, POSTHOG, POSTGRES_PASSWORD)

### 7.4 Deploy Script

File baru: `scripts/deploy-vps.sh` — build, migrate, compose up, health check

---

## Urutan Eksekusi

| Step | Fase    | Deskripsi                                      |
| ---- | ------- | ---------------------------------------------- |
| 1    | 1.1-1.4 | Plan tier config + quota schema + QuotaService |
| 2    | 2.1-2.3 | Hapus self-host mode, simplify auth            |
| 3    | 3.1-3.4 | Integrate quota ke billing pipeline            |
| 4    | 4.1-4.4 | Autumn plan config + webhook + sync            |
| 5    | 5.1-5.6 | UI: pricing, billing, quota bars, paywall      |
| 6    | 6.1-6.2 | Landing page polish                            |
| 7    | 7.1-7.4 | VPS deployment config                          |

**Mulai dari Step 1 (Fase 1) — foundation plan tier + quota system.**
