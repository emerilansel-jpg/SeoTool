# Coldstart — JetDigitalSEO (SeoTool.im)

Dokumen konteks untuk melanjutkan pengembangan di percakapan baru.

---

## Identitas project

**SeoTool.im** (`package.json: open-seo` v0.1.3) — SEO SaaS dashboard (Semrush/Ahrefs alternative). Cloudflare Workers + TanStack Start, Postgres (primary) / D1 (SQLite, dev fallback), hosted-only. Ahrefs-style tiered billing: Free / Lite ($49) / Pro ($149) / Agency ($499) dengan per-feature quotas.

**Transformasi SaaS (2026-08-08)**: Project ini dulunya open-source self-host (3 auth mode, BYO API key, credit-pool billing). Sekarang **hosted-only** — `cloudflare_access` dan `local_noauth` auth modes dihapus, hanya `hosted` (Better Auth). Billing model berubah dari single-plan + credit pool → **4 tier dengan per-feature quotas** (Ahrefs-style).

---

## Tech stack

| Layer      | Teknologi                                                                                                                                       |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Framework  | TanStack Start (SSR) + TanStack Router/Query/Form, React 19, Vite 7                                                                             |
| Runtime    | Cloudflare Workers (workerd) + Wrangler 4                                                                                                       |
| DB         | Drizzle ORM, dual-backend: Postgres (hosted SaaS, primary) / D1 (SQLite, dev fallback)                                                          |
| Auth       | Better Auth **hosted-only** (email/password + Google OAuth + Turnstile captcha). Self-host modes (`cloudflare_access`, `local_noauth`) dihapus. |
| Data SEO   | `dataforseo-client` (metered), GSC (first-party, gratis)                                                                                        |
| AI         | Cloudflare Agents SDK, OpenRouter, MCP SDK (24 tools)                                                                                           |
| Billing    | PayPal Subscriptions (Billing Plans) — **4-tier plan** (Free/Lite/Pro/Agency) + per-feature quotas + local credits system                       |
| Quota      | `QuotaService` — 11 features (daily/monthly/gauge windows), atomic upsert enforcement                                                           |
| UI         | Tailwind v4 + DaisyUI v5, lucide-react, recharts, jspdf (client PDF)                                                                            |
| Email      | Loops (transactional)                                                                                                                           |
| Analytics  | PostHog                                                                                                                                         |
| Deploy VPS | Docker Compose (workerd + Postgres 17 + Caddy reverse proxy + TLS)                                                                              |

**Kunci**: `pnpm dev:agents` (portless), `pnpm ci:check`, `pnpm test:ci`. File di bawah `Supastarter/` diabaikan (unrelated starter kit).

---

## Pola arsitektur (HARUS diikuti)

- **Server function → service → repository** (provider-aware DB).
- **Dual-dialect**: setiap tabel wajib di `src/db/ga4.schema.ts` (D1) DAN `src/db/pg/ga4.schema.ts` (PG), didaftarkan di barrels (`schema.ts` + `pg/schema.ts` + `d1/schema.ts`) + `schema-parity.test.ts`. JANGAN lupa parity test!
- **Zod** untuk validasi input di trust boundaries.
- **TanStack Query** untuk data fetching di client.
- **Array-form middleware**: `.middleware([requireProjectContext])` (BUKAN single arg — TanStack 1.170 regresi tipe pada single arg).
- **`requireProjectRole`**: role di-fetch on-demand dari DB via `MemberRepository.getMemberRole` (bukan di shared context — TanStack inference quirk).
- **Quota enforcement**: sebelum operasi metered, panggil `assertFeatureQuota(orgId, feature)` (windowed) atau `assertGaugeFeature(orgId, feature)` (live count). Untuk feature access (SAM, MCP), panggil `assertFeatureAccess(orgId, "samAgent")`. Import dari `@/server/billing/quota-gate`.
- **Plan tier config**: single source of truth di `src/shared/plans.ts`. Marketing pricing page + in-app billing + QuotaService semua baca dari sini.

---

## Yang sudah dibangun (sesi ini)

### Fase 1 — GA4 Insights (LENGKAP, end-to-end)

Modul lengkap mirroring GSC: OAuth Google → koneksi property → query Data API → UI + dashboard + MCP + RBAC.

| File                                                              | Keterangan                                                                                                                                                                          |
| ----------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/db/ga4.schema.ts` + `src/db/pg/ga4.schema.ts`                | Tabel `ga4_connections` dual-dialect                                                                                                                                                |
| `src/shared/ga4.ts`                                               | `GA4_OAUTH_PROVIDER_ID = "google-analytics"`, scopes                                                                                                                                |
| `src/lib/auth-config.ts`                                          | Entry `genericOAuth` GA4 (reuses `GOOGLE_CLIENT_ID/SECRET`)                                                                                                                         |
| `src/server/features/ga4/oauth-config.ts`                         | Config self-host GA4                                                                                                                                                                |
| `src/server/features/ga4/selfHostedOAuth.ts`                      | OAuth flow self-hosted                                                                                                                                                              |
| `src/routes/api/ga4/oauth/callback.ts`                            | OAuth callback route                                                                                                                                                                |
| `src/server/lib/ga4Client.ts`                                     | Client: `listProperties` (Admin API), `runReport` (Data API)                                                                                                                        |
| `src/server/features/ga4/repositories/Ga4ConnectionRepository.ts` | CRUD koneksi                                                                                                                                                                        |
| `src/server/features/ga4/analyticsRequest.ts`                     | Build `runReport` body (dates, dims, metrics, filters)                                                                                                                              |
| `src/server/features/ga4/analyticsReport.ts`                      | Pure shapers: `readMetrics`, `sumTotals`, `toTrendPoints`, `toDimensionRows`                                                                                                        |
| `src/server/features/ga4/services/Ga4Service.ts`                  | Service layer (getConnection, setProperty, getReport, disconnect)                                                                                                                   |
| `src/serverFunctions/ga4.ts`                                      | Connection management server fns (array-form middleware)                                                                                                                            |
| `src/serverFunctions/ga4Report.ts`                                | Report data server fns (totals, trend, pages, channels, export)                                                                                                                     |
| `src/types/schemas/ga4.ts`                                        | Zod input/filter schemas                                                                                                                                                            |
| `src/client/features/ga4/`                                        | `startGa4Link.ts`, `Ga4ConnectionCard.tsx`, `PropertyPicker.tsx`, `SelfHostedSetupWarning.tsx`                                                                                      |
| `src/client/features/ga4-insights/`                               | `Ga4InsightsPage.tsx` (totals+delta, trend chart, breakdowns, paginated tables, CSV/Sheets export), `Ga4InsightsParts.tsx`, `Ga4InsightsColumns.tsx`, `Ga4InsightsLoadingState.tsx` |
| `src/routes/_project/p/$projectId/ga4-insights.tsx`               | Route                                                                                                                                                                               |
| `src/client/navigation/items.ts`                                  | Nav item "GA4 Insights" di "My Site" group                                                                                                                                          |
| `src/client/features/dashboard/DashboardCards.tsx`                | `Ga4Card` (self-contained, dashboard embed)                                                                                                                                         |
| `src/client/features/projects/ProjectSettings.tsx`                | Section `#google-analytics`                                                                                                                                                         |
| `src/server/mcp/tools/ga4-tools.ts`                               | MCP tool `get_ga4_report`                                                                                                                                                           |
| `src/server/mcp/server.ts`                                        | Tool registration                                                                                                                                                                   |
| `src/shared/ga4.ts`                                               | Shared constants                                                                                                                                                                    |

**Unit tests**: `analyticsReport.test.ts` (11 tests), `analyticsRequest.test.ts` (9 tests).

### Fase 2 — Custom Reports + RBAC (LENGKAP, end-to-end)

#### 2A: RBAC foundation

- `src/shared/rbac.ts` — Role ordering: `owner > admin > manager > member > viewer`.
- `src/server/features/auth/MemberRepository.ts` — `getMemberRole(userId, organizationId)`.
- `src/serverFunctions/middleware.ts` — `requireProjectRole(minRole)` middleware (role fetched on-demand, NOT in shared context).
- **Array-form migration**: `.middleware(requireX)` → `.middleware([requireX])` di 22 server fns (fix TanStack cascade).

#### 2B: Data model + CRUD

- **4 tabel dual-dialect**: `reports`, `report_sections`, `report_snapshots`, `report_deliveries`.
- `src/server/features/reports/repositories/ReportsRepository.ts` — CRUD + `listDue(now)` untuk cron.
- `src/server/features/reports/services/ReportService.ts` — Config CRUD + `scheduleNextRun`.
- `src/server/features/reports/services/reportSchedule.ts` — `computeNextRunAt` (pure, unit-testable).
- `src/serverFunctions/reports.ts` — 7 server functions (listReports, getReport, createReport, updateReport, deleteReport, listReportSnapshots, getReportSnapshot). **Array-form middleware**.
- `src/types/schemas/reports.ts` — Zod schemas.

#### 2C: Snapshot generation

- `src/server/features/reports/services/ReportSnapshotBuilder.ts` — Tolerant per-section aggregator. Reuses DashboardService (rank/audit/backlinks), GscService, Ga4Service + shapers. Section gagal → `status: "skipped"`.
- `generateReportSnapshot` server function (add to `reports.ts`). Manager+ only.

#### 2D: Report view UI + client PDF

- `src/client/features/reports/ReportsListPage.tsx` — List + create/edit modal + role-gated.
- `src/client/features/reports/ReportSnapshotView.tsx` — Render snapshot: branding header, recharts, tables, section errors/skips.
- `src/client/lib/reportPdf.ts` — jsPDF client-side PDF (cover + stats + tables + footer).
- Route: `reports/route.tsx` (Outlet) → `reports/index.tsx` (list) → `reports/$reportId.tsx` (snapshot view).
- Nav item "Reports" di My Site group.

#### 2E: Scheduling + email delivery

- `src/server/workflows/ReportGenerationWorkflow.ts` — `WorkflowEntrypoint`, 5 pgSteps. **Note**: `pgStep(step, name, undefined, fn)` (4 args, 3rd arg `undefined`).
- `src/server/features/reports/services/scheduledReports.ts` — `runScheduledReports(env)`, dispatch `REPORT_WORKFLOW`.
- `src/server/email/report-delivery.ts` — Loops email, graceful skip when `LOOPS_TRANSACTIONAL_REPORT_ID` unset.
- `src/server.ts` — `scheduled()` extended: `runScheduledRankChecks` + `runScheduledReports`.
- `wrangler.jsonc` — `REPORT_WORKFLOW` binding added.

#### 2F: Quality

- **Unit tests**: `rbac.test.ts` (7 tests), `ReportService.test.ts` (7 tests — computeNextRunAt). Total 14 unit tests baru.
- `db:generate` → D1 `drizzle/0038_*` + PG `drizzle-pg/0016_*`.
- `pnpm ci:check` pass, `pnpm test:ci` 97 pass (1 pre-existing flaky).

### Fase 3 — Content Intelligence, Slice A: Content-Quality Scoring (LENGKAP, end-to-end)

Penilaian kualitas konten per halaman audit, deterministik dari sinyal crawl `audit_pages` (no external API, no cost, no deps). Fondasi untuk entity-gap (DataForSEO) + topical/LLM (OpenRouter) di slice berikutnya.

| File                                                                                 | Keterangan                                                                                                                                                                                                                                        |
| ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/db/content-intelligence.schema.ts` + `src/db/pg/content-intelligence.schema.ts` | Tabel `content_scores` dual-dialect (1 row per audit page: overall + 6 sub-skors + `flags_json`)                                                                                                                                                  |
| `src/db/d1/schema.ts` + `src/db/pg/schema.ts` + `src/db/schema.ts`                   | Registrasi barrel (d1, pg, provider-aware + AppSchema type + runtime spread + export)                                                                                                                                                             |
| `src/server/features/content-intelligence/contentScore.ts`                           | Pure scoring engine `scoreContent(input)` → overall 0-100 + 6 sub-skors (depth/headings/metadata/media/linking/technical) + flags. Bobot: depth 25, headings 20, metadata 20, technical 15, media 10, linking 10.                                 |
| `src/server/features/content-intelligence/contentScore.test.ts`                      | 20 unit tests (thresholds tiap sub-skor)                                                                                                                                                                                                          |
| `src/server/features/content-intelligence/repositories/ContentScoreRepository.ts`    | `replaceForAudit` (idempotent), `listForAudit` (worst-first), `getForPage`, `clearForAudit`                                                                                                                                                       |
| `src/server/features/content-intelligence/services/ContentIntelligenceService.ts`    | `computeScoresForAudit(auditId)` (query `audit_pages` langsung, hanya skor halaman `fetchClass==="ok"`), `getScoresForAudit(auditId, projectId)` (ownership via `AuditRepository.getAuditForProject`, map ke `ContentScoreView` dgn flags parsed) |
| `src/server/workflows/siteAuditWorkflowPhases.ts`                                    | Fase baru `runContentScoringPhase` (pgStep), dipanggil setelah `runCrawlPhase`. **Best-effort**: error tertelan, tidak pernah gagalkan audit.                                                                                                     |
| `src/serverFunctions/content-intelligence.ts`                                        | `getContentScores` (GET, `[requireProjectContext]`, viewer+). Array-form middleware.                                                                                                                                                              |
| `src/types/schemas/content-intelligence.ts`                                          | Zod `contentScoresInputSchema`                                                                                                                                                                                                                    |
| `src/types/schemas/audit.ts`                                                         | `auditTabs` +1: `"content"`                                                                                                                                                                                                                       |
| `src/client/features/content-intelligence/ContentScoresView.tsx`                     | Summary cards (avg + distribusi), recurring issues (top flags), tabel sortable + expandable detail (sub-skor bars + flags). Lazy `useQuery`.                                                                                                      |
| `src/client/features/content-intelligence/ContentScoresParts.tsx`                    | `ScoreBadge`, `SubScoreBar`, `SummaryCards`, `TopFlags`, `FlagIcon`                                                                                                                                                                               |
| `src/client/features/audit/results/ResultsView.tsx`                                  | Tab "Content" ke-4 (export dropdown di-hide saat content tab aktif)                                                                                                                                                                               |
| `src/routes/_project/p/$projectId/audit/index.tsx`                                   | `onTabChange` type +1: `"content"`                                                                                                                                                                                                                |
| `src/server/mcp/tools/content-intelligence-tools.ts`                                 | MCP tool `get_content_scores` (readOnly, auditId optional → latest)                                                                                                                                                                               |
| `src/server/mcp/server.ts`                                                           | Registrasi tool                                                                                                                                                                                                                                   |

- `db:generate` → D1 `drizzle/0039_bouncy_meltdown.sql` + PG `drizzle-pg/0016_futuristic_pretty_boy.sql`.
- **Unit tests**: `contentScore.test.ts` (20). schema-parity test green (content_scores 14 cols/2 idx/2 fk di kedua dialect).
- `pnpm exec tsc --noEmit` clean (excl. Supastarter), `oxlint` 0 error, `knip` clean untuk feature ini, brace-balance OK semua file baru.
- **Test total**: 841 pass (baseline 821 + 20 baru), 1 pre-existing flaky (`dataforseo/client.test.ts`).

#### Slice A+ — Perdalam (dashboard + reports + export + MCP summary) (LENGKAP)

Pemenuhan pilihan "perdalam Slice A": polong tanpa biaya API. Meng-ekspos content scores di permukaan lain aplikasi.

| File                                                                              | Keterangan                                                                                                                                                                               |
| --------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/server/features/content-intelligence/repositories/ContentScoreRepository.ts` | `listScoreRowsForAudit` (lightweight: url/score/wordCount tanpa flagsJson, untuk agregasi)                                                                                               |
| `src/server/features/audit/repositories/AuditRepository.ts`                       | `getLatestCompletedAuditForProject` (filter status=completed; dipakai dashboard card). File kini >400 baris → `/* eslint-disable max-lines */` (precedent ga4-tools/DashboardCards).     |
| `src/server/features/content-intelligence/services/ContentIntelligenceService.ts` | `getSummaryForAudit(auditId,projectId)` + `getSummaryForProject(projectId)` → `ContentSummary` (avg, distribusi, worstPages top-5). `computeSummary` pure.                               |
| `src/serverFunctions/content-intelligence.ts`                                     | `getContentScoreSummary({projectId, auditId?})` (GET, viewer+). auditId optional → latest completed.                                                                                     |
| `src/types/schemas/content-intelligence.ts`                                       | `contentScoreSummaryInputSchema`                                                                                                                                                         |
| `src/client/features/dashboard/DashboardCards.tsx`                                | `ContentCard` (self-contained, mirip Ga4Card): empty-state CTA "Run an audit" + loading skeleton + avg/needs-work stats + link ke tab Content. File kini >400 baris → disable max-lines. |
| `src/client/features/dashboard/DashboardPage.tsx`                                 | Wire ContentCard ke cards-array (setelah audit).                                                                                                                                         |
| `src/types/schemas/reports.ts`                                                    | `REPORT_SECTION_TYPES` +1: `"content"`                                                                                                                                                   |
| `src/server/features/reports/services/ReportSnapshotBuilder.ts`                   | `buildContentSection(projectId)` + switch case. Skipped bila tak ada completed audit.                                                                                                    |
| `src/client/features/reports/ReportSnapshotView.tsx`                              | `ContentSection` renderer (avg/total/need-work StatLines + worst pages) + switch case                                                                                                    |
| `src/client/features/audit/results/export.ts`                                     | `exportContentScores(scores, format)` (csv/json/sheets)                                                                                                                                  |
| `src/client/features/content-intelligence/ContentScoresView.tsx`                  | `ExportDropdown` self-contained (punya scores dari query sendiri)                                                                                                                        |
| `src/server/mcp/tools/content-intelligence-tools.ts`                              | `summary` field di outputSchema + `summarizeScores` helper + ringkasan di text response                                                                                                  |

- tsc clean, oxlint 0 error (file content-intelligence + AuditRepository), knip clean untuk feature ini.
- Test total tetap 841 pass (no new test layer — pure additions ke UI/agregasi).

### Fase 3 — Content Intelligence, Slice B: Content Gap (Entity/Topic Gap) (LENGKAP, end-to-end)

Domain-level keyword/topic gap vs 1–3 kompetitor via DataForSEO Labs `googleDomainIntersectionLive` (intersections:false → keyword yang diranking kompetitor dan TIDAK oleh domain sendiri), di-merge + di-cluster jadi "topics" (gratis, client-side). Pragmatis karena `audit_pages` hanya simpan sinyal turunan (wordCount/headings/hash), BUKAN body text — jadi entity extraction per-halaman (Content Analysis API) diblokur → wilayah Fase 3c. Persistensi: R2 cache 12j (mirror DomainService), **bukan** tabel DB (data domain-level, on-demand). Competitor input stateless.

| File                                                                     | Keterangan                                                                                                                                                                                                                                                                       |
| ------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/server/lib/dataforseo/labs.ts`                                      | `fetchDomainIntersection({target1,target2,...})` + `domainIntersectionItemSchema` (Zod passthrough, mirip `domainRankedKeywordItemSchema`). `intersections:false`, `item_types:["organic"]`.                                                                                     |
| `src/server/lib/dataforseo/sections.ts`                                  | Re-export `fetchDomainIntersection` (lazy chunk tetap utuh)                                                                                                                                                                                                                      |
| `src/server/lib/dataforseo/client.ts`                                    | `labs.domainIntersection = meter(customer, (s) => s.fetchDomainIntersection, "content_intelligence")`                                                                                                                                                                            |
| `src/shared/billing-credit-features.ts`                                  | `CreditFeature` +1 `"content_intelligence"` + label; path-mapper override `domain_intersection` → `content_intelligence` (sebelum generic `domain_*` → `domain_overview`)                                                                                                        |
| `src/server/features/content-intelligence/contentGap.ts`                 | Pure engine: `mapIntersectionItem`, `mergeGapKeywords` (dedupe case-insensitive, akumulasi kompetitor, pick-higher volume/KD/cpc), `clusterGapTopics` (anchor ke significant-token paling sering, "(other)" fallback, cap maxTopics), `summarizeGap`, `buildContentGap`. No I/O. |
| `src/server/features/content-intelligence/contentGap.test.ts`            | 13 unit tests (map/merge/dedupe/sort/cluster/summary/e2e)                                                                                                                                                                                                                        |
| `src/server/features/content-intelligence/services/ContentGapService.ts` | `getGap` — `buildCacheKey("content:gap",...)` + `getCached` + Zod-on-read (cache-view schema), miss: N `dataforseo.labs.domainIntersection` via `Promise.all` (cap kompetitor, `KEYWORDS_PER_COMPETITOR=300`), `waitUntil(setCached(...,12h))`. Reuse `normalizeDomainInput`.    |
| `src/types/schemas/content-intelligence.ts`                              | `contentGapInputSchema` (projectId, domain, competitors[1..3], optional market)                                                                                                                                                                                                  |
| `src/serverFunctions/content-intelligence.ts`                            | `getContentGap` (POST, `[requireProjectContext]`, `resolveLabsMarket`, viewer+). **Array-form middleware.**                                                                                                                                                                      |
| `src/client/features/content-intelligence/ContentGapView.tsx`            | Form (domain pre-fill dari project, competitor textarea 1–3), `useMutation`, results: summary cards + topic clusters + gap keyword table sortable (volume/difficulty/competitors/cpc). Empty-state.                                                                              |
| `src/client/features/content-intelligence/ContentGapParts.tsx`           | `GapSummaryCards`, `DifficultyPill`, `TopicList` (presentational)                                                                                                                                                                                                                |
| `src/routes/_project/p/$projectId/content-gap.tsx`                       | Route (h1 + view)                                                                                                                                                                                                                                                                |
| `src/client/navigation/items.ts`                                         | Nav "Content Gap" (icon `Swords`) di group "My Site"                                                                                                                                                                                                                             |
| `src/server/mcp/tools/content-gap-tools.ts`                              | MCP tool `get_content_gap` (readOnly, projectId + competitors[1..3] + optional domain/market; domain fallback ke project.domain)                                                                                                                                                 |
| `src/server/mcp/server.ts`                                               | Tool registration (`server.registerTool(...)`)                                                                                                                                                                                                                                   |
| `src/server/lib/dataforseo/client.test.ts`                               | +1 test: path `domain_intersection` → `content_intelligence`; `domain_rank_overview` tetap `domain_overview`; +mock `fetchDomainIntersection`                                                                                                                                    |

- **TIDAK ada migration** (R2-cached, no new table). Route tree regen via `vite` sebentar.
- **Report section `content_gap` DILEWATI** — butuh persisted competitor list per project (YAGNI; stateless di slice ini).
- tsc 0 error (excl. Supastarter), oxlint 0 error, knip clean untuk feature, prettier clean per-file, brace-balance OK semua file baru.
- **Test total: 856 pass, 0 fail** (baseline 841 + 13 contentGap + 1 path-mapping + flaky dataforseo lucky-pass run ini).

### Persist body text dari crawl phase (Fase 3c prep) (LENGKAP)

Membuka jalan untuk per-page entity extraction (Fase 3c) dan Content Strategy (Fase 4): `bodyText` (visible text, script/style/noscript/svg stripped) yang sudah diekstraksi oleh cheerio di `page-analyzer.ts` (untuk `contentHash` + `wordCount`) sekarang juga di-persist ke `audit_pages`. Sebelumnya teks ini langsung dibuang.

| File                                                        | Keterangan                                                                                |
| ----------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `src/db/audit.schema.ts`                                    | Kolom baru `bodyText: text("body_text")` (nullable, after `contentHash`)                  |
| `src/db/pg/audit.schema.ts`                                 | Kolom yang sama (dual-dialect parity)                                                     |
| `src/server/lib/audit/types.ts`                             | `CrawledPageResult.bodyText: string \| null`                                              |
| `src/server/workflows/site-audit-workflow-helpers.ts`       | `crawlPage` return: `bodyText: analysis.bodyText \|\| null`; error-path: `bodyText: null` |
| `src/server/features/audit/repositories/AuditRepository.ts` | `insertCrawledBatch` dataColumns: `bodyText: page.bodyText`                               |
| `src/server/lib/audit/issues/page-reporters.test.ts`        | Fixture: `bodyText: null`                                                                 |

- **Migration**: D1 `drizzle/0040_chunky_bloodstrike.sql` (`ALTER TABLE audit_pages ADD body_text text`) + PG `drizzle-pg/0017_far_reavers.sql` (`ALTER TABLE "audit_pages" ADD COLUMN "body_text" text`).
- **Parity test**: saat ini TIDAK mencakup `audit` schema (hanya app, sam, billing, dll) → tidak pecah. Idealnya audit tables ditambahkan ke parity test (di luar scope).
- **Tidak ada behavioral change** — scoring, crawl, existing tests tidak terpengaruh. Kolom baru nullable, tidak dipakai oleh kode yang ada.
- tsc 0, oxlint 0, brace-balance OK, tests 855 pass + 1 pre-existing flaky.

### Fase 3c — Topical/LLM: Per-Page Entity Extraction via OpenRouter (LENGKAP, end-to-end)

Ekstraksi entitas/topik per halaman via LLM (OpenRouter) dari `audit_pages.body_text`. Menggunakan `generateText()` dari Vercel AI SDK dengan model `minimax/minimax-m3` (default). Prompt JSON terstruktur → Zod parse → persist ke tabel `page_entities`. Best-effort: LLM gagal → skip halaman, tidak gagalkan audit. Graceful skip bila `OPENROUTER_API_KEY` tidak tersedia.

| File                                                                                 | Keterangan                                                                                                                                                                            |
| ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/db/content-intelligence.schema.ts` + `src/db/pg/content-intelligence.schema.ts` | Tabel `page_entities` dual-dialect (id, auditId FK, pageId FK unique, url, entitiesJson, topicsJson, extractedAt)                                                                     |
| `src/db/schema.ts`                                                                   | Registrasi barrel (`pageEntities`)                                                                                                                                                    |
| `src/server/features/content-intelligence/entityExtraction.ts`                       | `extractEntities(bodyText)` — truncate 8000 chars, `generateText()` + `openRouterCostUsd`, Zod parse response (`.catch` defaults), `isOpenRouterAvailable()`                          |
| `src/server/features/content-intelligence/entityExtraction.test.ts`                  | 10 unit tests (JSON parsing, markdown fences, truncation, caps, error handling, availability check)                                                                                   |
| `src/server/features/content-intelligence/repositories/PageEntityRepository.ts`      | `replaceForAudit`, `listForAudit`, `getForPage`, `clearForAudit` (mirip ContentScoreRepository)                                                                                       |
| `src/server/features/content-intelligence/services/ContentIntelligenceService.ts`    | `extractEntitiesForAudit(auditId)` — batch 5 concurrent, best-effort per page, cost logging; `getEntitiesForAudit(auditId, projectId)` — ownership-checked, JSON parsed ke typed view |
| `src/server/workflows/siteAuditWorkflowPhases.ts`                                    | `runEntityExtractionPhase` — pgStep, best-effort (try/catch swallow), dipanggil setelah `runContentScoringPhase`                                                                      |
| `src/types/schemas/content-intelligence.ts`                                          | `pageEntitiesInputSchema`                                                                                                                                                             |
| `src/serverFunctions/content-intelligence.ts`                                        | `getPageEntities` (GET, `[requireProjectContext]`, viewer+)                                                                                                                           |
| `src/client/features/content-intelligence/PageEntitiesView.tsx`                      | Summary cards + per-page table (expandable: entity list dengan type badge + relevance bar, topic list dengan confidence)                                                              |
| `src/client/features/audit/results/ResultsView.tsx`                                  | Tab "Entities" ke-5 (export dropdown di-hide saat entities tab aktif)                                                                                                                 |
| `src/routes/_project/p/$projectId/audit/index.tsx`                                   | `onTabChange` type +1: `"entities"`                                                                                                                                                   |
| `src/types/schemas/audit.ts`                                                         | `auditTabs` +1: `"entities"`                                                                                                                                                          |
| `src/server/mcp/tools/content-intelligence-tools.ts`                                 | MCP tool `get_page_entities` (readOnly, auditId optional → latest)                                                                                                                    |
| `src/server/mcp/server.ts`                                                           | Tool registration                                                                                                                                                                     |

- **Migration**: D1 `drizzle/0041_salty_next_avengers.sql` + PG `drizzle-pg/0018_parallel_zzzax.sql` (`CREATE TABLE page_entities`).
- **Cost control**: truncation 8000 chars/page (~2000 token), batch 5 concurrent, credit feature `content_intelligence` (reuse). Estimasi ~$0.20/audit (100 pages). Cost tracking via `openRouterCostUsd` + console logging (tidak di-track ke credit pool di workflow phase — deferred).
- tsc 0, oxlint 0, brace-balance OK, tests 865 pass + 1 pre-existing flaky.

**Ditunda ke slice berikutnya (Fase 3 lanjutan, YAGNI)**:

- ~~Programmatic content briefs / clusters (Fase 4).~~ ✅ Fase 4 selesai.
- Cost tracking ke credit pool dari workflow phase (saat ini hanya console logging; butuh billing context di workflow).
- Topic clustering across pages (cross-page topic aggregation).
- Entity deduplication/normalization across pages.
- Per-page entity extraction via DataForSEO Content Analysis API (alternative LLM-free approach).
- Topic mapping via `googleCategoriesForKeywordsLive`; competitor auto-discovery via `serpCompetitors`; persisted competitor list per project + report section `content_gap`.

---

## Fase 4 — Content Strategy (LENGKAP, end-to-end)

Topic clusters + content briefs + AI-generated outlines + internal linking suggestions. Membangun fondasi content strategy di atas hasil Fase 3 (content gap keywords + page entities).

### Slice A — Topic Clusters & Content Briefs (CRUD Foundation)

| File                                                                             | Keterangan                                                                                                                                                                                                               |
| -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `src/db/content-strategy.schema.ts` + `src/db/pg/content-strategy.schema.ts`     | Tabel `topic_clusters` (id, projectId, name, description, pillarPageUrl) + `content_briefs` (id, projectId, clusterId nullable, targetKeyword, title, status enum, priorityScore, targetUrl, briefDataJson) dual-dialect |
| `src/db/d1/schema.ts` + `src/db/pg/schema.ts` + `src/db/schema.ts`               | Registrasi barrel (type union + runtime spread + destructure export + flat re-export)                                                                                                                                    |
| `src/types/schemas/content-strategy.ts`                                          | Zod schemas: `createTopicClusterSchema`, `updateTopicClusterSchema`, `createContentBriefSchema`, `updateContentBriefSchema`, `projectBoundIdSchema`, `generatedBriefOutlineSchema`                                       |
| `src/server/features/content-strategy/repositories/ContentStrategyRepository.ts` | CRUD object-pattern (list/get/create/update/delete untuk clusters + briefs, ownership via projectId in WHERE)                                                                                                            |
| `src/server/features/content-strategy/services/ContentStrategyService.ts`        | Service object-pattern: createTopicCluster, getTopicCluster (throws NOT_FOUND), createContentBrief (validates cluster ownership), update/delete                                                                          |
| `src/serverFunctions/content-strategy.ts`                                        | 10 server functions (list/get/create/update/delete untuk clusters + briefs). Array-form middleware `[requireProjectContext]` + `requireProjectRole`.                                                                     |
| `src/server/features/content-strategy/services/ContentStrategyService.test.ts`   | 4 unit tests (create delegation, not-found throw, cluster validation, no-cluster success)                                                                                                                                |
| `src/client/features/content-strategy/StrategyPageView.tsx`                      | Dashboard grid: cluster cards with briefs, empty state CTA, cluster creation modal stub                                                                                                                                  |
| `src/client/features/content-strategy/StrategyParts.tsx`                         | `ClusterCard`, `BriefItem` (Link to detail), `EmptyStrategyState`                                                                                                                                                        |
| `src/routes/_project/p/$projectId/strategy/index.tsx`                            | Route                                                                                                                                                                                                                    |
| `src/client/navigation/items.ts`                                                 | Nav item "Content Strategy" (icon `Target`) di "My Site" group                                                                                                                                                           |

- `db:generate` → D1 `0043_cynical_domino.sql` + PG `0020_tidy_quasimodo.sql`.
- schema-parity test diperluas untuk `content-strategy`.
- tsc 0, oxlint 0 (file production), brace-balance OK.

### Slice B — Programmatic Content Briefs (AI) + Internal Linking

| File                                                               | Keterangan                                                                                                                                                                                                                                                                                                                                                                                                          |
| ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/server/features/content-strategy/services/briefGeneration.ts` | `generateContentBriefOutline(targetKeyword, clusterContext?)` — `generateText()` via OpenRouter, system prompt terstruktur, Zod parse (`generatedBriefOutlineSchema`: searchIntent, primaryKeyword, secondaryKeywords, suggestedTitle, metaDescription, outline h2/h3+keyPoints). `suggestInternalLinks(auditId, keywords, limit)` — LIKE query ke `page_entities` untuk halaman dengan topik/entitas yang overlap. |
| `src/serverFunctions/content-strategy.ts`                          | +`generateBriefAi` server fn: `assertFeatureQuota(orgId, "content_intelligence")` → `generateContentBriefOutline` → `suggestInternalLinks` → update `briefDataJson` + `title` + status="briefing".                                                                                                                                                                                                                  |
| `src/client/features/content-strategy/BriefDetailView.tsx`         | Detail page: brief metadata card (editable), tombol "✨ Generate Outline via AI" (loading + error), outline viewer (meta desc, secondary kw badges, h2/h3 hierarchy + key points), sidebar "Internal Links" dengan suggested URLs                                                                                                                                                                                   |
| `src/routes/_project/p/$projectId/strategy/briefs/$briefId.tsx`    | Route untuk brief detail                                                                                                                                                                                                                                                                                                                                                                                            |
| `src/client/features/content-strategy/StrategyParts.tsx`           | `BriefItem` sekarang clickable (Link ke `/p/$projectId/strategy/briefs/$briefId`)                                                                                                                                                                                                                                                                                                                                   |

- tsc 0, tests 885 pass, brace-balance OK.

---

## Fase 5 — Alerts (LENGKAP, end-to-end)

Monitoring notifikasi berbasis cron: `alert_rules` + Loops email + `AlertWorkflow` dispatch.

| File                                                                           | Keterangan                                                                                                                                                                                                                                                              |
| ------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/db/alerts.schema.ts` + `src/db/pg/alerts.schema.ts`                       | Tabel `alert_rules` dual-dialect (id, projectId, name, metricType `rank_drop`\|`audit_critical`, conditionJson, enabled, frequency `daily`\|`weekly`, nextCheckAt, lastTriggeredAt, recipients, timestamps). Index `(enabled, nextCheckAt)` untuk listDue.              |
| `src/db/schema.ts` + `d1/schema.ts` + `pg/schema.ts` + `schema-parity.test.ts` | Registrasi barrel + parity test                                                                                                                                                                                                                                         |
| `src/types/schemas/alerts.ts`                                                  | Zod: `createAlertRuleSchema`, `updateAlertRuleSchema`, `projectBoundAlertIdSchema`, `alertConditionSchema` (threshold, keyword?, device?)                                                                                                                               |
| `src/server/features/alerts/alertEvaluator.ts`                                 | Pure functions: `evaluateRankDrop(condition, current[], previous[])` → AlertTrigger\|null (bandingkan posisi, null=not ranking=Infinity, filter keyword/device, multi-keyword). `evaluateAuditCritical(condition, criticalIssueCount, auditDate)` → AlertTrigger\|null. |
| `src/server/features/alerts/alertEvaluator.test.ts`                            | 12 unit tests (no data, below threshold, drop trigger, not-ranking trigger, keyword filter, device filter, multi-keyword, audit below/meet/exceed threshold, null date)                                                                                                 |
| `src/server/features/alerts/repositories/AlertRepository.ts`                   | Object-pattern: listForProject, getById, listDue(now), create, update, delete, markTriggered, advanceNextCheck, `computeNextCheckAt(frequency, from)`                                                                                                                   |
| `src/server/features/alerts/services/AlertService.ts`                          | Object-pattern: CRUD dengan NOT_FOUND guards                                                                                                                                                                                                                            |
| `src/server/email/alert-notification.ts`                                       | `sendAlertNotificationEmail` via Loops transactional. Graceful no-op jika `LOOPS_API_KEY`/`LOOPS_TRANSACTIONAL_ALERT_ID` unset. Pola identik `report-delivery.ts`.                                                                                                      |
| `src/server/workflows/AlertWorkflow.ts`                                        | `WorkflowEntrypoint<Cloudflare.Env, AlertParams>`, 4 pgSteps: load-rule → evaluate-condition (rank_drop via RankTrackingRepository snapshots, audit_critical via AuditRepository) → send-notification+markTriggered → advance-schedule                                  |
| `src/server/features/alerts/services/scheduledAlerts.ts`                       | `runScheduledAlerts(env)`: listDue → eager advanceNextCheck (anti-retry-storm) → `ALERT_WORKFLOW.create` → per-item try/catch                                                                                                                                           |
| `src/server.ts`                                                                | `scheduled()` +`runScheduledAlerts`. Re-export `AlertWorkflow`.                                                                                                                                                                                                         |
| `wrangler.jsonc`                                                               | `ALERT_WORKFLOW` binding (`alert-workflow` / `AlertWorkflow`)                                                                                                                                                                                                           |
| `src/serverFunctions/alerts.ts`                                                | 4 server fns: listAlertRules, createAlertRule, updateAlertRule, deleteAlertRule (array-form middleware, role-gated member/manager)                                                                                                                                      |
| `src/client/features/alerts/AlertsPageView.tsx`                                | List alert rules dengan toggle enable/disable, delete, create/edit modal (metric type selector, threshold, frequency, keyword filter, recipients)                                                                                                                       |
| `src/routes/_project/p/$projectId/alerts/index.tsx`                            | Route                                                                                                                                                                                                                                                                   |
| `src/client/navigation/items.ts`                                               | Nav item "Alerts" (icon `Bell`) di "My Site" group                                                                                                                                                                                                                      |

- `db:generate` → D1 `0044_typical_prima.sql` + PG `0021_high_miracleman.sql`.
- Cancellation webhook already wired: `BILLING.SUBSCRIPTION.CANCELLED` → `syncPaypalCustomerStatus` → quota reset (dari Fase SaaS 4).
- tsc 0, tests 908 pass (885 + 23 baru), brace-balance OK.

---

## Fase 7 — PayPal Customer Portal (LENGKAP)

| File                             | Keterangan                                                                                                                                                                                  |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/server/billing/paypal.ts`   | `billingPortal.createSession(subscriptionId)` — PayPal subscription revision URL → redirects to PayPal hosted billing management page.                                                        |
| `src/serverFunctions/billing.ts` | +`getCustomerPortalUrl` server fn: `requireAuthenticatedContext` → gate hosted + `customerHasPaidPlan` → read `paypalSubscriptionId` from DB → `paypal.billingPortal.createSession()` → URL.  |
| `src/routes/_app/billing.tsx`    | +Tombol "Manage Subscription" (icon CreditCard, loading spinner) untuk paid users. Redirect ke PayPal Billing Portal. Cancel via portal → webhook sudah sync quotas.                        |

---

## Fase 8 — Quota Analytics Dashboard (LENGKAP)

Admin dashboard untuk visibilitas platform-wide: distribusi plan tier, MRR estimate, quota usage agregat per feature, daftar organisasi terbaru.

| File                                                   | Keterangan                                                                                                                                                                                                                                                                                                                 |
| ------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/serverFunctions/middleware.ts`                    | +`requirePlatformAdmin` middleware: stacks on `requireAuthenticatedContext`, reads `PLATFORM_ADMIN_USER_IDS` env var (comma-separated user IDs), throws FORBIDDEN jika userId tidak di allowlist.                                                                                                                          |
| `src/server/features/analytics/AnalyticsRepository.ts` | Cross-org aggregates: `getPlanTierDistribution()` (GROUP BY plan_tier), `getMrrEstimate()` (SUM PLAN_PRICES_USD × orgCount per tier), `getQuotaUsageSummary()` (GROUP BY feature, period di usage_quota), `getOrgCount()`, `getRecentOrgs(limit)` (JOIN organization ↔ subscription). `getOverview()` fan-out Promise.all. |
| `src/serverFunctions/analytics.ts`                     | `getAnalyticsOverview` (POST, `[requireAuthenticatedContext, requirePlatformAdmin]`). `checkIsPlatformAdmin` (GET, lightweight boolean untuk route guard — admin IDs tetap server-side).                                                                                                                                   |
| `src/client/features/admin/AdminDashboard.tsx`         | Stat cards (Total Orgs, MRR, Paid Orgs, Paid Rate %), plan distribution bar chart (recharts, tier-colored), quota usage table (feature × period × totalUsed × orgCount), recent orgs table (name, tier badge, status, join date), revenue breakdown per tier.                                                              |
| `src/routes/_app/admin/index.tsx`                      | Route dengan `beforeLoad` guard: `checkIsPlatformAdmin()` → `notFound()` jika non-admin. URL: `/admin`.                                                                                                                                                                                                                    |

- **No migration needed** (query existing `subscription`, `usage_quota`, `organization` tables).
- tsc 0, tests 908 pass, brace-balance OK.
- **Env var baru**: `PLATFORM_ADMIN_USER_IDS` — comma-separated user IDs untuk admin access. Wajib set di production untuk enable admin dashboard.
- **Caveat data**: MRR adalah estimate dari `PLAN_PRICES_USD × plan_tier` (bukan data billing aktual Autumn). Gauge features (projects, rank_tracking count, dll) tidak muncul di `usage_quota` (hanya windowed features). Historical trends tidak tersedia dari DB (hanya current-window).

---

## Fase 6 — Semi-gap, Slice A: SERP Snapshot Persistence (LENGKAP)

Saat rank check berjalan, DataForSEO mengembalikan full SERP (10-100 organic results), tapi sebelumnya `buildRankCheckResult` **mereduksi semua itu menjadi satu baris** — hanya posisi domain target yang disimpan. Seluruh data kompetitor dibuang. Fase ini persist full top-20 SERP composition **tanpa biaya API tambahan** — data sudah di-fetch.

| File                                                                           | Keterangan                                                                                                                                                                                                                                                                                         |
| ------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/db/serp-snapshots.schema.ts` + `src/db/pg/serp-snapshots.schema.ts`       | Tabel `serp_snapshots` dual-dialect (id, runId FK, trackingKeywordId, keyword, device, rank, url, title, description, domain, isTrackedDomain, checkedAt). Index `(runId, trackingKeywordId, device)` + `(trackingKeywordId, rank)`. Unique `(runId, trackingKeywordId, device, rank)`.            |
| `src/db/schema.ts` + `d1/schema.ts` + `pg/schema.ts` + `schema-parity.test.ts` | Registrasi barrel + parity test                                                                                                                                                                                                                                                                    |
| `src/server/lib/dataforseo/serp.ts`                                            | +`extractSerpItems(items, targetDomain, maxItems=20)` pure function (filter organic, mark tracked domain + subdomain, extract rank/url/title/description/domain). +`SerpSnapshotRow` type. `buildRankCheckResult` sekarang juga return `serpItems` array. `RankCheckResult` +optional `serpItems`. |
| `src/server/lib/dataforseo/serp.test.ts`                                       | +6 unit tests untuk `extractSerpItems` (organic filter, tracked domain marking, subdomain match, maxItems limit, null fields, no-match). Updated existing test `toEqual` → `toMatchObject` (serpItems now included).                                                                               |
| `src/server/workflows/rankCheckPaths.ts`                                       | +`mapResultsToSerpSnapshotRows(runId, results)` expands serpItems → insert rows. `checkBatchLive` + `collectQueuedRound` sekarang juga persist SERP snapshots via `SerpSnapshotRepository.insertBatch` (best-effort try/catch, tidak gagalkan run). **Zero additional API cost.**                  |
| `src/server/features/serp-snapshots/SerpSnapshotRepository.ts`                 | `insertBatch(rows)` (onConflictDoNothing), `getLatestForKeyword(trackingKeywordId, device)` (group by checkedAt untuk latest run), `getForRun(runId, keywordId, device)`.                                                                                                                          |
| `src/serverFunctions/serp-snapshots.ts`                                        | `getSerpSnapshot` (GET, `[requireProjectContext]`, viewer+). Returns latest SERP composition untuk keyword+device.                                                                                                                                                                                 |
| `src/client/features/serp-snapshots/SerpSnapshotViewer.tsx`                    | SERP composition viewer: device toggle (desktop/mobile), tracked domain position highlight (success/warning alert), competitor table (rank, title, URL, description, domain badge "You"), external link icons.                                                                                     |

- `db:generate` → D1 `0045_dear_rafael_vega.sql` + PG `0022_rapid_mentallo.sql`.
- tsc 0, tests 918 pass (908 + 10 baru), brace-balance OK.

---

## Transformasi SaaS — Hosted-Only + Tiered Billing (LENGKAP, 7 fase + PayPal)

Mengubah SeoTool.im dari open-source self-host (3 auth mode, BYO API key, credit-pool billing) menjadi **hosted-only SaaS** (Better Auth, 4-tier plan + per-feature quotas + PayPal billing). 7 fase + PayPal migrasi, semua selesai dan terverifikasi.

### Fase 1 — Plan Tier Config & Quota System (LENGKAP)

Foundation: plan tier definitions, quota DB schema, QuotaService, gauge counts.

| File                                                                         | Keterangan                                                                                                                                                                                                                                                        |
| ---------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/shared/plans.ts`                                                        | **Single source of truth**: 4 tier (Free/Lite/Pro/Agency), 11 QuotaFeature, PLAN_LIMITS, QUOTA_FEATURE_PERIODS (daily/monthly/gauge), PLAN_FEATURE_ACCESS (SAM/MCP gates), PAYPAL_PLAN_IDS mapping, `planTierFromPaypalPlanId()`, `creditFeatureToQuotaFeature()` |
| `src/db/quota.schema.ts` + `src/db/pg/quota.schema.ts`                       | Tabel `usage_quota` (per-feature windowed counter, unique on org+feature+period) + `subscription` (org→plan tier, paypal sub id, period end) dual-dialect                                                                                                         |
| `src/server/features/billing/repositories/QuotaRepository.ts`                | `getPlanTier`, `upsertSubscription` (paypalSubscriptionId), `getUsageQuota`, `incrementUsageQuota` (atomic upsert + conditional window reset via SQL CASE), `peekUsageQuota`, `resetUsageQuotaForOrg`                                                               |
| `src/server/features/billing/services/QuotaService.ts`                       | `checkQuota` (no-increment read), `assertQuotaAvailable` (windowed: atomic increment + throw QUOTA_EXCEEDED), `assertGaugeLimit` (live count compare), `getQuotaState` (UI summary), `resetQuotasOnPlanChange`                                                    |
| `src/server/features/billing/services/gaugeCounts.ts`                        | Live-count helpers: `countOrgProjects`, `countOrgSavedKeywords`, `countOrgTrackedKeywords`, `countOrgReports`, `gaugeCount` dispatcher                                                                                                                            |
| `src/server/billing/quota-gate.ts`                                           | **High-level API**: `assertFeatureQuota`, `assertGaugeFeature`, `assertFeatureAccess`, `isFeatureAvailable`                                                                                                                                                       |
| `src/shared/error-codes.ts`                                                  | +`QUOTA_EXCEEDED`, +`PLAN_LIMIT_REACHED` (both non-reportable)                                                                                                                                                                                                    |
| `src/client/lib/error-messages.ts`                                           | User-facing messages untuk QUOTA_EXCEEDED + PLAN_LIMIT_REACHED                                                                                                                                                                                                    |
| `drizzle/0042_flowery_piledriver.sql` + `drizzle-pg/0019_modern_sir_ram.sql` | Migrations (CREATE TABLE usage_quota + subscription)                                                                                                                                                                                                              |
| `src/server/features/billing/services/QuotaService.test.ts`                  | 20 unit tests (tier defs, limits monotonicity, feature access, quota periods, PayPal plan id mapping)                                                                                                                                                             |

### Fase 2 — Hapus Self-Host Mode (LENGKAP)

Simplify auth: hosted-only. `cloudflare_access` & `local_noauth` modes removed.

| File                                                             | Keterangan                                                                                                                                            |
| ---------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/lib/auth-mode.ts`                                           | `getAuthMode()` → selalu `"hosted"`. `isHostedAuthMode()` → selalu `true`. `AUTH_MODES = ["hosted"]`. Compiler tree-shakes dead branches.             |
| `src/middleware/ensure-user/resolve.ts`                          | Hanya panggil `resolveHostedContext`. Hapus CF Access + local_noauth dispatch.                                                                        |
| `src/middleware/ensure-user/cloudflareAccess.ts`                 | No-op stub (throws AUTH_CONFIG_MISSING jika dipanggil)                                                                                                |
| `src/middleware/ensure-user/delegated.ts`                        | No-op stub (throws jika dipanggil)                                                                                                                    |
| `src/lib/auth.ts`                                                | Hapus semua `isHostedAuthMode(env.AUTH_MODE)` branching. Selalu build hosted config.                                                                  |
| `src/server.ts`                                                  | Hapus self-host MCP path + self-host heartbeat. Hanya hosted OAuth provider. SAM agent gate via `assertFeatureAccess`.                                |
| `src/server/mcp/transport.ts`                                    | `handleSelfHostedOpenSeoMcpRequest` → 404 stub.                                                                                                       |
| `src/routes/api/gsc/oauth/callback.ts` + `ga4/oauth/callback.ts` | Hosted-only (self-host OAuth flow dihapus)                                                                                                            |
| `src/server/lib/runtime-env.ts`                                  | `isHostedServerAuthMode()` → selalu true (no Autumn round-trip)                                                                                       |
| `src/server/lib/self-host-telemetry.ts`                          | `deployTarget` hardcoded `"cloudflare"`. Hapus `getAuthMode` import.                                                                                  |
| `src/lib/selfhost-preflight.ts`                                  | `checkAuthMode` hanya validasi hosted config. Deprecated modes → warn.                                                                                |
| `src/env.d.ts`                                                   | Hapus `TEAM_DOMAIN`, `POLICY_AUD`. `AUTH_MODE` jadi generic string.                                                                                   |
| Tests                                                            | `auth-turnstile.test.ts`, `selfhost-preflight.test.ts`, `self-host-telemetry.test.ts`, `transport.test.ts` semua diupdate untuk hosted-only behavior. |

### Fase 3 — Integrate Quota ke Billing Pipeline (LENGKAP)

Hook quota gates ke setiap feature call site.

| Integration Point                                                     | Gate                                                                                            |
| --------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `src/server/lib/dataforseo/client.ts` (`meterDataforseoCall`)         | `assertFeatureQuota` per CreditFeature→QuotaFeature mapping (sebelum API call)                  |
| `src/server/features/projects/services/projects.ts` (`createProject`) | `assertGaugeFeature("projects")`                                                                |
| `src/serverFunctions/keywords.ts` (`saveKeywords`)                    | `assertGaugeFeature("saved_keywords", count)`                                                   |
| `src/serverFunctions/rank-tracking.ts` (`addTrackingKeywords`)        | `assertGaugeFeature("rank_tracking", count)`                                                    |
| `src/serverFunctions/reports.ts` (`createReport`)                     | `assertGaugeFeature("reports")`                                                                 |
| `src/serverFunctions/audit.ts` (`startAudit`)                         | `assertFeatureQuota("site_audit")`                                                              |
| `src/server.ts` (`authorizeSamChat`)                                  | `assertFeatureAccess("samAgent")` → 402 jika free                                               |
| `src/server/features/audit/services/audit-capacity.ts`                | +`getMaxAuditPagesForTier()`, +`getMaxConcurrentAuditsForTier()`, +`planTierToAuditLimitTier()` |

### Fase 4 — PayPal Plan Config + Webhook + Sync (LENGKAP)

| File                                          | Keterangan                                                                                                                                                                    |
| --------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/server/billing/customer-status-model.ts` | Derive `planTier` dari PayPal subscription (`plan_id` + `PAYPAL_PLAN_IDS`). Extract `paypalSubscriptionId`, `currentPeriodEnd`. Maps PayPal statuses (ACTIVE/CANCELLED/etc). |
| `src/server/billing/customer-status-sync.ts`  | `syncPaypalCustomerStatus` → upsert `billing_customer_status` + upsert `subscription` + **reset windowed quotas on tier change** + grant credits + sync to Loops              |
| `src/server/billing/paypal-webhook.ts`        | Handle events: `BILLING.SUBSCRIPTION.CREATED/UPDATED/CANCELLED/EXPIRED/ACTIVATED/SUSPENDED`, `PAYMENT.CAPTURE.COMPLETED`. Semua converge ke `syncPaypalCustomerStatus`.      |
| `src/server/billing/paypal-webhook-verify.ts` | PayPal webhook signature verification via `/v1/notifications/verify-webhook-signature` API.                                                                                    |
| `src/server/billing/subscription.ts`          | `getOrCreateOrganizationCustomer` → lazily create default free-tier subscription row + grant free credits. `customerHasPaidPlan` → baca dari QuotaRepository (local DB).       |
| `src/server/billing/credits.ts`               | Local credits management: `grantMonthlyCredits`, `getCreditBalance`, `deductCredits`, `addTopupCredits`. Menggunakan `usage_quota` table.                                     |
| `src/server/billing/paypal.ts`                | PayPal REST API client: OAuth2 token caching, typed facade untuk subscriptions/billingPlans/billingPortal/webhooks.                                                           |
| `docs/PAYPAL_BILLING.md`                      | Setup guide: 4 plan tiers di PayPal dashboard, webhook events, plan tier resolution flow, credits system                                                                     |

### Fase 5 — UI: Pricing, Billing, Quota Bars, Paywall (LENGKAP)

| File                                             | Keterangan                                                                                                                                                                        |
| ------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/client/features/billing/plan-detection.ts`  | `getCustomerPlanTier()` — resolve PlanTier dari PayPal subs. `getCustomerPlanStatus()` — backward-compat free/paid. Uses `PAYPAL_PLAN_IDS`.                                       |
| `src/client/features/billing/HostedPlanGate.tsx` | `HostedPlanGateState` +`planTier: PlanTier`. Uses `usePlanTier()` hook (local DB, no Autumn).                                                                                    |
| `src/client/features/billing/use-billing.ts`     | Local hooks: `usePlanTier()`, `useIsPaidPlan()`, `useSubscriptionProblemStatus()`. Fetch dari `getQuotaStateSummary`.                                                             |
| `src/client/features/billing/QuotaBar.tsx`       | Komponen: label, used/limit, progress bar (green/yellow/red), reset time, "Unlimited" badge                                                                                       |
| `src/routes/_authenticated.subscribe.tsx`        | **3-tier picker** (Lite $49 / Pro $149 / Agency $499). Radio-style selection. Checkout via `createPaypalSubscription` → redirect ke PayPal approval URL. PostHog events.          |
| `src/routes/_app/billing.tsx`                    | Current plan card + quota usage section (QuotaBar per feature via `getQuotaStateSummary`). Tombol Manage Subscription → PayPal portal. Buy Credits → PayPal one-time payment.       |
| `src/serverFunctions/billing.ts`                 | +`getQuotaStateSummary` server fn. +`getCustomerPortalUrl` → PayPal billing portal via subscription revision URL.                                                                 |
| `src/serverFunctions/paypal-checkout.ts`         | `createPaypalSubscription` (creates PayPal subscription + returns approve URL). `verifyPaypalSubscription` (post-checkout verification). `createPaypalTopup` (one-time payment).  |

### Fase 6 — Landing Page Polish (LENGKAP)

| File                                    | Keterangan                                                                                                                                                                                                   |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `web/src/routes/_marketing/pricing.tsx` | **4-tier comparison table** (Ahrefs-style). Plan cards + feature matrix (4 groups: Projects/Keywords, Audits/Backlinks, AI/Content, Integrations/Tools). Mobile card layout. FAQ updated untuk tiered model. |
| `web/src/components/landing-page.tsx`   | Hero copy: "The SEO platform that grows with you". Open-source section: "Built on open source" (bukan self-host).                                                                                            |

### Fase 7 — VPS Deployment Config (LENGKAP)

| File                         | Keterangan                                                                                                                                                                                            |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `docker-compose.hosted.yaml` | 2 services: `open-seo` (workerd, AUTH_MODE=hosted, DATABASE_PROVIDER=postgres) + `postgres` (17-alpine, healthcheck). Caddy TIDAK termasuk — ditangani oleh gateway-caddy shared (lihat bawah). Volumes: app data + pg data. |
| `gateway-caddy/Caddyfile`    | **Running reverse proxy** untuk SEMUA app di VPS (seotool.im, omniroute, pesat). Marketing static + SaaS proxy routing + auto TLS + security headers + WebSocket. Lihat detail di section "Produksi LIVE" bawah. |
| `Caddyfile`                  | Template standalone (seotool.im only). **STALE** — masih punya bug `/assets/*` collision. Gunakan `gateway-caddy/Caddyfile` sebagai source of truth.                                                  |
| `.env.hosted.example`        | Template: POSTGRES_PASSWORD, BETTER_AUTH_SECRET/URL, GOOGLE_CLIENT_ID/SECRET, TURNSTILE, LOOPS, DATAFORSEO_API_KEY, PAYPAL_CLIENT_ID/SECRET/MODE/WEBHOOK_ID, OPENROUTER_API_KEY, POSTHOG.          |
| `scripts/deploy-vps.sh`      | Deploy script: pre-flight checks (env, placeholders, docker) + compose up --build + health wait loop + summary.                                                                                       |
| `auto-deploy.sh`             | Wrapper untuk CI: backup `.env.hosted` → `git fetch + reset --hard origin/main` → restore `.env.hosted` → `scripts/deploy-vps.sh --build`. Dipanggil oleh GitHub Action.                               |
| `.github/workflows/deploy.yml` | CI/CD: `appleboy/ssh-action` SSH ke VPS → jalankan `auto-deploy.sh`. Trigger: push ke `main`.                                                                                                         |
| `docker-entrypoint.sh`       | Detect `DATABASE_PROVIDER=postgres` → run `db:migrate:pg` (bukan `db:migrate:local`).                                                                                                                 |

---

## Produksi LIVE (seotool.im) — arsitektur gateway-caddy

**VPS**: 148.230.103.98, user `seotool` (uid 1005, docker group, NO sudo). Domain `seotool.im` live dengan TLS.

### Shared gateway-caddy (BUKAN per-app Caddy)

VPS menjalankan **satu container gateway-caddy** (`/opt/gateway/compose.yaml`, root-owned) yang reverse-proxy SEMUA app: seotool.im (marketing + SaaS), api.jetdigitalpro.com (omniroute), pesat.ai subdomain. Container ini terpisah dari `docker-compose.hosted.yaml` (yang hanya open-seo + postgres).

- **Marketing static files** (`/srv/marketing`) adalah writable layer di gateway-caddy, BUKAN volume `marketing_dist`. Di-populate dari pre-built `web/dist/client` (built locally, committed via `!web/dist/` gitignore exception).
- Config source of truth: `gateway-caddy/Caddyfile`. File `/opt/gateway/Caddyfile` di VPS harus mirror ini. Reload: `docker exec gateway-caddy caddy reload --config /etc/caddy/Caddyfile`.

### Bug /assets/* collision (FIXED 2026-08-13, commit d9959dc)

Marketing static site dan SaaS app **sama-sama** serve JS/CSS bundles di `/assets/*`. Caddy matcher `@marketingAssets path /assets/*` lama meng-claim semua `/assets/*` untuk marketing → SaaS lazy-loaded route chunks (mis. `/assets/_auth-*.js` di sign-in page) **404** → "Failed to fetch dynamically imported module".

**Fix**: `/assets/*` di-exclude dari `@marketingAssets`. Ditambah matcher `@marketingAssetFile` dengan `file { root /srv/marketing }` — serve dari marketing HANYA jika file-nya ada di sana; otherwise fall through ke catch-all `handle` yang proxy ke SaaS (`open-seo:3001`). Hash chunk berubah tiap rebuild, jadi verifikasi pakai URL aktual dari SSR HTML.

### CI/CD auto-deploy

Push ke `main` → GitHub Action (`.github/workflows/deploy.yml`) → `appleboy/ssh-action` SSH → `auto-deploy.sh`. **Deployment permission gotcha** (FIXED commit fd5aaf9): `auto-deploy.sh` + `scripts/deploy-vps.sh` wajib executable bit di git (`git update-index --chmod=+x`), else CI error "Permission denied" (exit 126). Repo di VPS sering root-owned (hasil `git reset --hard`); fix ownership via `docker run --rm -v <path>:/repo alpine chown -R 1005:1005 /repo` (docker group = root-equivalent).

---

## QA gap analysis (2026-08-13, plan.md)

Audit lengkap di `plan.md` di repo root. **Product mature untuk classic SEO + STRONG di AI/GEO** (brand lookup, SoV, cited sources, prompt explorer, SAM agent, MCP server). Keyword difficulty, search intent, SERP feature tags (incl. AI Overview/PAA), new/lost backlinks, anchor text SUDAH ada — jangan re-flag.

**P0 broken/unfinished (prioritas tertinggi):**
1. Team invitation emails tidak pernah terkirim (Better Auth org plugin tidak ada `sendInvitationEmail` hook) — `src/client/features/settings/TeamSection.tsx`
2. Content Strategy creation flows masih stub ("Coming soon" alerts) — `src/client/features/content-strategy/StrategyPageView.tsx`
3. OAuth-only users tidak bisa self-delete (deleteAccount requires password) — `src/serverFunctions/account.ts`
4. Credit top-up purchase: `createPaypalTopup` server fn sudah dibuat, perlu wiring ke UI billing page
5. Alert/report emails fail silently (console.error, no throw)

**P1 compliance/trust:** no GDPR data export, no billing transactional/welcome emails, no dunning, no notification center, legal links incomplete in-app.

**P2 competitive SEO gaps:** Google-only (no Bing/Yahoo), no competitor rank tracking, no SoV in rank tracking, no backlink link intersect, no dedicated new/lost backlinks view (data ada), no anchor distribution report (data ada), no sitemap validator/generator, no schema validation audit issue, no crawl budget/log analysis, no on-page SEO checker, no keyword trends/clustering, no disavow/toxic flagging.

**P3 platform:** manager/viewer roles unassignable via UI (RBAC dead code), no trial period, no invoice PDF, no roll-up reports. **P4 local SEO:** geo-grid, GBP audit, citation, review monitoring. **P5 AI/GEO:** AI Overviews rank tracking, AI-bot log analysis, llms.txt, GEO content recs.

---

## Bug lingkungan yang perlu diwaspadai

### Brace-stripping (CRITICAL)

**Harness ini menghapus/mengubah karakter `{`, `}`, `from`, `=` dari tool input secara intermittent** — terutama via `Edit`, `Write`, dan `node -e`. Ini membuat penulisan file TypeScript dengan banyak braces RISIKO tinggi.

**Strategi yang berhasil**:

- **`Write` tool**: bekerja kebanyakan (Fase 1 berhasil), tapi beberapa file ter-corrupt (ga4-tools.ts import).
- **`Edit` tool**: bracket ter-strip dari input → gagal match → error. Alternatif: gunakan `node -e` untuk patch berbasis garis/regex (avoid literal braces di input).
- **Verifikasi**: setiap file baru WAJIB di-verify brace balance via `node` (`f.match(/{/g).length` vs `f.match(/}/g).length`).
- **Char-code workaround**: `String.fromCharCode(123)` untuk `{`, `125` untuk `}` — kadang berhasil untuk import statements, tapi rumit untuk file besar.

### Array-form middleware (TanStack version skew)

react-start 1.168 + react-router 1.170 + router-core 1.171. Single-arg `.middleware(X)` tipe-nya regresi → cascade error di SEMUA server function. **Fix**: `.middleware([X])` (array form). Sudah di-migrasi ke 22 file. TIDAK boleh kembali ke single-arg.

### Self-host auth stubs (post-SaaS transform)

`src/middleware/ensure-user/cloudflareAccess.ts` dan `delegated.ts` sekarang **no-op stubs** yang throw `AUTH_CONFIG_MISSING` jika dipanggil. Jangan hapus file ini — beberapa test masih mock-import mereka. Compiler tree-shakes dead branches karena `getAuthMode()` selalu return `"hosted"`.

### Quota mock pattern di tests

File yang import `subscription.ts` atau `quota-gate.ts` di test WAJIB mock `@/server/billing/quota-gate` dan `@/server/features/billing/repositories/QuotaRepository` (karena import chain → `db` → D1 runtime yang tidak tersedia di vitest). **Diperluas sesi 2026-08-08**: file yang transitively import `@/server/mcp/context` (→ `@/server/billing/subscription`) juga WAJIB mock ini, contohnya `transport.test.ts`, `client.test.ts` (dataforseo), dan `GscService.test.ts`. Tanpa mock, test timeout (5s) karena promise hang di D1 runtime yang tidak ada di vitest. Pattern:

```typescript
vi.mock("@/server/billing/quota-gate", () => ({
  assertFeatureQuota: vi.fn().mockResolvedValue(undefined),
  assertGaugeFeature: vi.fn().mockResolvedValue(undefined),
  assertFeatureAccess: vi.fn().mockResolvedValue(undefined),
}));
vi.mock("@/server/features/billing/repositories/QuotaRepository", () => ({
  QuotaRepository: { getPlanTier: vi.fn().mockResolvedValue("free"), ... },
}));
```

### Supastarter folder

Folder `Supastarter/` di repo ini tidak terkait SeoTool.im. tsc errors dari folder ini adalah pre-existing. Selalu gunakan `grep -v "Supastarter"` saat cek tsc output.

### prettier-plugin-tailwindcss & ci:check (pre-existing)

`pnpm ci:check` step pertama `prettier --check .` **GAGAL pre-existing** di env ini:

- `prettier-plugin-tailwindcss` tidak ter-install (direferensikan hanya oleh nested `.prettierrc` di `Supastarter/`).
- 6 file `src/` lama (GA4/reports/dashboard, bukan milik fase aktif) punya format drift.
- **Verifikasi format kode sendiri**: `pnpm exec prettier --check "<file>"` per-file. Jangan format 6 file lama itu (broad cleanup, out of scope kecuali diminta).
- Gate lain (`tsc`, `oxlint`, `knip`, `test:ci`) jalankan terpisah untuk konfirmasi.

---

## PayPal Integration Guide (2026-08-13)

Panduan lengkap untuk setup dan integrasi PayPal Billing Plans di SeoTool.im.

### Arsitektur

```
User → Subscribe Page → createPaypalSubscription (server fn)
  → PayPal API: POST /v1/billing/subscriptions
  → Redirect user ke PayPal approval URL
  → User approves → PayPal fires BILLING.SUBSCRIPTION.CREATED webhook
  → /api/paypal/webhook → verifyWebhookSignature → syncPaypalCustomerStatus
  → Upsert subscription table + grant credits + sync Loops CRM
```

### Key Files

| File | Purpose |
|---|---|
| `src/server/billing/paypal.ts` | PayPal REST API client (OAuth2 + typed facade) |
| `src/server/billing/credits.ts` | Local credits management (monthly + topup pools) |
| `src/server/billing/paypal-webhook.ts` | Webhook handler (events → sync) |
| `src/server/billing/paypal-webhook-verify.ts` | Webhook signature verification |
| `src/serverFunctions/paypal-checkout.ts` | Checkout server functions |
| `src/client/features/billing/use-billing.ts` | Local React hooks for billing state |

### Setup Steps

#### 1. PayPal Developer Dashboard

1. Go to https://developer.paypal.com/dashboard/applications
2. Create **Products** (one per tier):
   - SeoTool Lite ($49/mo)
   - SeoTool Pro ($149/mo)
   - SeoTool Agency ($499/mo)
3. Create **Billing Plans** for each product:
   - Plan IDs: `lite-plan`, `pro-plan`, `agency-plan` (must match `PAYPAL_PLAN_IDS` in `src/shared/plans.ts`)
   - Billing cycle: Monthly
   - Auto-bill outstanding: Yes
   - Payment failure threshold: 3
4. Create **Webhook**:
   - URL: `https://yourdomain.com/api/paypal/webhook`
   - Events: `BILLING.SUBSCRIPTION.CREATED`, `BILLING.SUBSCRIPTION.UPDATED`, `BILLING.SUBSCRIPTION.CANCELLED`, `BILLING.SUBSCRIPTION.EXPIRED`, `BILLING.SUBSCRIPTION.ACTIVATED`, `BILLING.SUBSCRIPTION.SUSPENDED`, `PAYMENT.CAPTURE.COMPLETED`
   - Save the **Webhook ID**

#### 2. Environment Variables

```bash
# .env.hosted
PAYPAL_CLIENT_ID=your-client-id
PAYPAL_CLIENT_SECRET=your-client-secret
PAYPAL_MODE=sandbox  # or "live" for production
PAYPAL_WEBHOOK_ID=your-webhook-id
```

#### 3. Database Migration

The migration renames `autumn_subscription_id` → `paypal_subscription_id` in the `subscription` table:

```bash
# D1 (SQLite)
pnpm drizzle-kit push

# Postgres
pnpm drizzle-kit push --config=drizzle-pg.config.ts
```

Migration files:
- `drizzle/0047_rename_autumn_to_paypal.sql`
- `drizzle-pg/0024_rename_autumn_to_paypal.sql`

### Credits System

PayPal has no native credits/balance. Credits are managed locally:

| Tier | Monthly Credits | Top-up Available |
|---|---|---|
| Free | 100 | No |
| Lite | 5,000 | Yes |
| Pro | 25,000 | Yes |
| Agency | 100,000 | Yes |

Credits are stored in `usage_quota` table with special feature names:
- `usage_credits` — monthly pool (granted on plan creation/renewal)
- `topup_credits` — one-time purchase pool (rolls over)

### Checkout Flow

1. User clicks "Subscribe to [Plan]" on `/subscribe`
2. `createPaypalSubscription` server function is called
3. Server creates PayPal subscription via API
4. User is redirected to PayPal approval URL
5. User approves subscription on PayPal
6. PayPal fires `BILLING.SUBSCRIPTION.CREATED` webhook
7. Webhook handler verifies signature and calls `syncPaypalCustomerStatus`
8. Local DB is updated: subscription tier, credits granted, quotas reset
9. User is redirected back to app with `?checkout=success`
10. App polls `getQuotaStateSummary` until subscription appears

### Webhook Events

| Event | Action |
|---|---|
| `BILLING.SUBSCRIPTION.CREATED` | Sync subscription, grant credits |
| `BILLING.SUBSCRIPTION.UPDATED` | Sync tier changes, reset quotas if changed |
| `BILLING.SUBSCRIPTION.CANCELLED` | Sync to free tier, reset quotas |
| `BILLING.SUBSCRIPTION.EXPIRED` | Sync to free tier |
| `BILLING.SUBSCRIPTION.ACTIVATED` | Sync subscription status |
| `BILLING.SUBSCRIPTION.SUSPENDED` | Sync to past_due status |
| `PAYMENT.CAPTURE.COMPLETED` | Handle top-up credit purchase |

### Customer Portal

PayPal's customer portal is accessed via the subscription revision URL:
- `POST /v1/billing/subscriptions/{id}/revise`
- Redirects to PayPal's hosted billing management page
- User can: update payment method, cancel subscription, view invoices

### Testing

1. Use PayPal sandbox mode (`PAYPAL_MODE=sandbox`)
2. Create sandbox products and plans in PayPal developer dashboard
3. Use PayPal sandbox test accounts for checkout testing
4. Webhooks can be tested via PayPal dashboard → Webhooks → Send test event

### Troubleshooting

- **Webhook not received**: Check webhook URL is accessible, verify `PAYPAL_WEBHOOK_ID` matches
- **Signature verification fails**: Ensure `PAYPAL_WEBHOOK_ID` is set correctly in env
- **Subscription not syncing**: Check webhook logs in PayPal dashboard → Webhooks → Events
- **Credits not granted**: Check `credits.ts` logs, verify subscription status is `ACTIVE`

---

## Quality gate yang wajib dijalankan

```bash
# Type check (abaikan Supastarter)
pnpm exec tsc --noEmit 2>&1 | grep -v "Supastarter" | grep -c "error TS"
# Harus 0

# Tests
pnpm test
# Harus: 918 pass (baseline 908 + 10 SERP extract tests)

# Lint (file baru/berubah)
pnpm exec oxlint <files> --type-aware

# Format
pnpm exec prettier --write "src/path/to/file.ts"

# Migrations (jika schema berubah)
pnpm db:generate  # D1 + PG

# Route regen (jika route baru ditambah)
# Jalankan `pnpm exec vite --port 7331` sebentar, lalu Ctrl+C
```

---

## Roadmap: Fase berikutnya

| Fase     | Fitur                                                         | Depends On                            | Catatan                                                                                                                                                                                                                                              |
| -------- | ------------------------------------------------------------- | ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 3a       | **Content Intelligence — Content-Quality Scoring** ✅         | `audit_pages`                         | DONE. Skor deterministik 0-100 per halaman dari sinyal crawl. Tabel `content_scores`.                                                                                                                                                                |
| 3b       | **Content Intelligence — Content Gap (Entity/Topic Gap)** ✅  | DataForSEO Labs `domain_intersection` | DONE. Domain-level keyword gap vs 1–3 kompetitor, di-cluster jadi topics. R2-cached (no migration). Credit feature `content_intelligence`.                                                                                                           |
| 3c       | **Content Intelligence — Entity Extraction (Topical/LLM)** ✅ | OpenRouter (`generateText`)           | DONE. Per-page entity/topic extraction via LLM. Tabel `page_entities`. Best-effort workflow phase. Graceful skip tanpa OPENROUTER_API_KEY.                                                                                                           |
| **SaaS** | **Transformasi Hosted-Only + Tiered Billing** ✅              | —                                     | DONE (7 fase). Hosted-only auth, 4-tier plan (Free/Lite/Pro/Agency), per-feature quotas, PayPal webhook sync, VPS deploy config.                                                                                                                      |
| 4        | **Content Strategy** ✅                                       | Fase 3                                | DONE (2 slice). Topic clusters + content briefs (Slice A, CRUD). Programmatic AI content briefs + internal linking (Slice B, OpenRouter).                                                                                                            |
| 5        | **Alerts** ✅                                                 | Rank/Audit data                       | DONE (Slice A). `alert_rules` + `alertEvaluator` (rank_drop + audit_critical) + `AlertWorkflow` cron dispatch + Loops email. GSC/GA4 alerts deferred.                                                                                                |
| 6        | **Semi-gap** ✅ (Slice A)                                     | —                                     | DONE (Slice A). SERP snapshot persistence — full top-20 SERP composition persisted per rank check, zero extra API cost. Competitor table + tracked domain highlight. Domain first-class entity (Slice B) + Local SEO persistence (Slice C) deferred. |
| 7        | **PayPal Customer Portal** ✅                                 | PayPal SDK                            | DONE. `getCustomerPortalUrl` server fn + "Manage Subscription" button di billing page. Cancellation via PayPal portal → webhook sync.                                                                                                                 |
| 8        | **Quota Analytics Dashboard** ✅                              | QuotaService                          | DONE. Admin dashboard: plan distribution, MRR estimate, quota usage summary, recent orgs. `requirePlatformAdmin` middleware (env-var allowlist). Route `/admin`.                                                                                     |

---

## Lingkungan dev

```bash
pnpm dev:agents          # Portless dev server (http://open-seo.localhost:1355)
pnpm ci:check            # prettier + knip + tsc x2 + oxlint
pnpm test:ci             # vitest run --reporter=dot
```

**Env vars yang perlu diketahui**:

- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` — OAuth (social login + GSC + GA4)
- `BETTER_AUTH_SECRET` — token encryption (≥32 chars, required)
- `BETTER_AUTH_URL` — public URL deployment (cookies, callbacks)
- `LOOPS_API_KEY` / `LOOPS_TRANSACTIONAL_*` — email delivery (verification, reset, reports)
- `DATABASE_PROVIDER` — `postgres` (hosted SaaS) atau `d1` (dev fallback)
- `AUTH_MODE` — selalu `hosted` (mode lain dihapus; nilai deprecated di-ignore dengan warning)
- `DATAFORSEO_API_KEY` — base64 dari `login:password` DataForSEO
- `PAYPAL_CLIENT_ID` / `PAYPAL_CLIENT_SECRET` — billing (PayPal Subscriptions)
- `PAYPAL_MODE` — `sandbox` (dev) atau `live` (production)
- `PAYPAL_WEBHOOK_ID` — webhook ID dari PayPal dashboard (after creating webhook endpoint)
- `OPENROUTER_API_KEY` — AI agent (SAM, onboarding chat, entity extraction)
- `TURNSTILE_SECRET_KEY` / `TURNSTILE_SITE_KEY` — signup captcha
- `POSTGRES_PASSWORD` — DB password (Docker Compose VPS deploy)
- `PLATFORM_ADMIN_USER_IDS` — comma-separated user IDs untuk admin dashboard access (`/admin`)

**Deploy VPS**: Push ke `main` → GitHub Action auto-deploy (`auto-deploy.sh`). Manual: `bash auto-deploy.sh` atau `./scripts/deploy-vps.sh --build`. Lihat `docker-compose.hosted.yaml` + `.env.hosted.example` + section "Produksi LIVE" di atas.
