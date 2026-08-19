# Plan: Implementasi GROWTH-PLAN.md — Free Tool AI Visibility + Pillar GEO (design Dark Command Center)

Fokus sesi ini adalah prioritas minggu-1 dari GROWTH-PLAN §8 yang berupa halaman: **free tool AI visibility checker (unggulan, benar-benar berfungsi)** + **index /free-tools** + **pillar GEO + 2 artikel pendukung**. Weekly digest email (backend retensi) ditunda ke sesi berikutnya karena bukan halaman. Semua di `web/` (marketing site), tidak menyentuh `src/` SaaS sama sekali.

## A. Backend free tool di web/ (net-new, pola sudah ada)

1. **`web/src/lib/dfs-ai.ts`** — helper fetch DFS ramping: Basic auth dari `process.env.DATAFORSEO_API_KEY` (nama + format env sama persis dengan app, base64 login:password), POST ke `/v3/ai_optimization/llm_mentions/aggregated_metrics/live`, platform `chat_gpt`, location 2840/en, satu panggilan per cek, AbortController 15 detik, validasi `status_code 20000` + subset schema `total.platform[] {key, mentions, ai_search_volume}` (mirror dari `dataforseoLlmSchemas.ts`).
2. **`web/src/routes/api/ai-visibility.ts`** — route handler POST (pola `api/subscribe.ts`): zod validasi domain (strip protocol/www), **rate limit per-IP in-memory** (5 cek/15 menit) + **cache in-memory 24 jam** per domain (biaya DFS terkendali), respons `{domain, mentions, aiSearchVolume, checkedAt}`. Tanpa `DATAFORSEO_API_KEY` → 503 graceful dan halaman menampilkan fallback CTA ke sign-up (halaman tetap berfungsi di preview).
3. Result gate sesuai GROWTH-PLAN: hasil dasar (jumlah mention ChatGPT + volume + verdict) gratis tanpa login; detail penuh (Google AI Overviews, kompetitor, halaman disitir, tren) = CTA ke `https://seotool.im/sign-up?domain=...`.

## B. Halaman (semua pakai design system `.itc` Dark Command Center dari DESIGN.md)

Shared: `web/src/lib/use-scroll-reveal.ts` (ekstrak hook reveal dari landing-page; homepage tidak disentuh), `web/src/components/free-tools.css` (kelas halaman-specific, scoped `.itc`, pakai custom props `--cyan/--orange/--surface` dll., hormati `prefers-reduced-motion`), link font di tiap `head()` (Space Grotesk/JetBrains Mono/Inter, gotcha font per-route).

1. **`/free-tools/ai-visibility-checker`** — halaman unggulan:
   - Hero: eyebrow FREE TOOL, H1 + sub copy dari GROWTH-PLAN §5 (revisi kecil, tanpa em-dash), form dengan label terlihat, input domain, CTA "Check my AI visibility", trust line.
   - Loading: animasi "AI mention radar" (conic sweep + blip CSS) di atas mock transkrip ChatGPT — elemen visual signature (skill frontend-design: satu elemen memorable).
   - Result panel (`aria-live`, area min-height tetap agar no-CLS): angka mention besar + verdict 3 tier (0 = "ChatGPT never mentions you yet" / low / strong), volume, ring visual, "what the full report adds", CTA orange tunggal, "check another domain".
   - Explainer "What is AI visibility" (~200 kata, link internal ke pillar + feature page), How it works 01/02/03, FAQ 5 pertanyaan + FAQPage JSON-LD, final CTA band.
   - UI/UX checklist (ui-ux-pro-max): focus-visible cyan, target sentuh 44px, error dekat field, kontras aman, reduced-motion, aria-live.
2. **`/free-tools` index** — hero + 7 kartu tool (1 live; 6 "coming soon" dengan label keyword target + link ke feature page terdekat agar tetap berguna), CTA band.
3. **Pillar `/library/ai-search-geo/index.tsx`** — salin pola pillar keyword-research: grid "plays" (2 artikel terbit + placeholder "Next up"), intro longform GEO, FAQ + JSON-LD, CTA. **Deviasi dari GROWTH-PLAN**: pakai `/library/ai-search-geo` bukan `/guides/...` karena `/guides/*` sudah 301 ke `/blogs` dan `/library` adalah rumah pillar yang sudah ter-sitemap + Caddy.
4. **2 artikel spoke** (MDX + route `LibrarySpokePage` + `buildPageSeo(ogType: article)`): "How to appear in ChatGPT results" (~1.200 kata, actionable, CTA ke checker) dan "How to track your AI visibility" (terikat tool). Frontmatter title+description sesuai pipeline library.

## C. Wiring

- `_marketing.tsx`: item "Free Tools" di dropdown header + mobile nav.
- `site-footer.tsx`: kolom Resources dapat entri Free Tools + AI Visibility Checker.
- `web/scripts/generate-sitemap.js`: STATIC_PATHS += `/free-tools`, `/free-tools/ai-visibility-checker` (library auto-scan).
- **Kedua Caddyfile** (`Caddyfile` + `gateway-caddy/Caddyfile`): tambah `/free-tools*` ke marketing matcher (tanpa ini path jatuh ke app dan 404; root Caddyfile punya komentar "Add new marketing routes here").
- `feature-pages.ts`: tambah link checker ke `related[]` halaman fitur ai-brand-visibility.
- Catatan deploy: `DATAFORSEO_API_KEY` perlu ditambahkan ke env deployment web (wrangler secret / compose) — tanpa itu checker fallback 503 dengan CTA signup.

## D. Verifikasi

1. `npx tsc --noEmit` di web/ + `npm run build` (path Docker, tanpa plugin CF).
2. Dev server smoke test: render halaman, validasi form, API 503 tanpa creds, lalu dengan creds asli (dari `.dev.vars` app) → hasil JSON nyata, panggilan ke-2 ter-cache, rate limit terpicu.
3. Prettier file baru; cek nol em-dash di copy English; verifikasi brace.
4. Tidak ada perubahan `src/` SaaS → tidak menambah error tsc/oxlint/vitest pre-existing.

## File

Baru: 2 API/lib, 1 hook, 1 CSS, 6 file route, 2 MDX (~12 file). Modifikasi: nav, footer, sitemap script, 2 Caddyfile, feature-pages.ts (5 file).
