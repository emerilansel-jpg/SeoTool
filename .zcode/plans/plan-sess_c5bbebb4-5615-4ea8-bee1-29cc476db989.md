# Plan: Homepage + Marketing Page In-App dengan Hard Paywall

Default yang diambil (pertanyaan tidak dijawab): **hard paywall** (free tier tidak bisa memakai tools sampai berlangganan) dan funnel **sign-up → onboarding → bayar → tools**.

## Konteks hasil eksplorasi

- `/` hari ini: `_app/index.tsx` (auth-gated, auto-redirect ke proyek terakhir) + middleware `unauthenticated-redirect.ts` yang mengarahkan pengunjung tanpa session ke `/sign-in`. Tidak ada landing page di dalam aplikasi.
- Mesin billing sudah lengkap: PayPal Subscriptions (`createPaypalSubscription`), halaman `/subscribe` berfungsi penuh (pilih plan → PayPal → polling → redirect kembali), `customerHasPaidPlan(orgId)` ada di `src/server/billing/subscription.ts`, harga/kuota single source of truth di `src/shared/plans.ts`.
- Bug yang sudah ada (bagian tsc error P2): `AuditService.ts` dan `OnboardingChatAgent.ts` mengimpor `customerHasManagedAccess` yang sudah tidak diekspor (sisa migrasi PayPal) — harus dibereskan sebagai bagian pekerjaan paywall.
- `DESIGN.md` melarang gaya marketing `.itc-*`/webfont di aplikasi → landing memakai token DaisyUI (`seotool`/`seotool-dark`).

## Bagian A: Landing publik di `/` + `/pricing`

1. **`src/client/features/marketing/LandingPage.tsx`** (baru) — komponen landing memakai token DaisyUI: navbar (logo, link Pricing, Sign in, tombol Get started), hero (headline + subcopy + CTA ke `/sign-up`), strip metrik, grid fitur (8 tools asli aplikasi: keyword research, rank tracking, site audit, backlinks, AI visibility, content intelligence, reports, MCP/SAM), section pricing, CTA band, footer (link legal ke situs marketing seotool.im). Pengunjung yang sudah login melihat tombol "Dashboard" di navbar (tanpa auto-redirect, standar SaaS).
2. **`src/client/features/marketing/PricingSection.tsx`** (baru) — kartu 4 tier yang **mengimpor `PLAN_PRICES_USD` + `PLAN_LIMITS` dari `src/shared/plans.ts`** (tidak menduplikasi angka, beda dengan situs web/ yang menyalin manual). Dipakai bersama oleh landing dan halaman `/pricing`.
3. **`src/routes/index.tsx`** (baru, publik tanpa guard) → render LandingPage. **`src/routes/pricing.tsx`** (baru, publik) → PricingSection + FAQ (5 item diporting dari marketing web/) + CTA `/sign-up?redirect=/subscribe`.
4. **Hapus `src/routes/_app/index.tsx`** — wajib, karena bentrok path `/` dengan `index.tsx` baru. Perilaku "buka proyek terakhir" tidak dipindahkan; setelah login user mendarat di `/projects` (standar SaaS, halaman sudah ada). Porting efek `PAYMENT_REQUIRED → /subscribe` ke `projects.tsx`.
5. **`src/middleware/unauthenticated-redirect.ts`** — ujung `/` jadi publik: kasus khusus `pathname === "/"` (bukan prefix) + tambah `/pricing` ke `PUBLIC_PATH_PREFIXES`.
6. **Tujuan default setelah login** `/` → `/projects`: helper kecil di `src/lib/auth-redirect.ts` (mis. `appEntryOrDefault(redirect)`) dipakai di `_auth.tsx` (sudah-login) dan handler sukses sign-in/sign-up. Halaman marketing tetap bisa dikunjungi user login tanpa dilempar.

## Bagian B: Hard paywall (server + klien)

7. **Perbaiki impor rusak dulu**: ganti `customerHasManagedAccess` → `customerHasPaidPlan` di `AuditService.ts` dan `OnboardingChatAgent.ts` (mengurangi 2 dari 14 error tsc P2).
8. **`src/middleware/paid-plan-gate.ts`** (baru, function middleware) — didaftarkan di `globalServerFunctionMiddleware` (`src/serverFunctions/middleware.ts`) setelah `ensureUserMiddleware`:
   - Lewati bila bukan hosted mode atau `BYPASS_AUTH` aktif (pola sama dengan `ensure-user/hosted.ts`), supaya self-host dan E2E tidak terkunci.
   - **Allowlist via `serverFnMeta.filename`/`.name`** (API terverifikasi tersedia di middleware versi ini): billing, paypal-checkout, notifications, onboarding, exports baca-saja projects (`getProjects`, `getProjectAccess`, `getArchivedProjects`), fungsi akun/konfigurasi (mis. `getSeoApiKeyStatus`), query plan tier.
   - Semua server function tools lainnya (keywords, domain, audit, backlinks, rank-tracking, ai-search, content-_, reports, sam, serp-_) → bila `!customerHasPaidPlan(orgId)` lempar `AppError("PAYMENT_REQUIRED")`.
9. **`src/client/features/billing/use-paid-plan-guard.ts`** (baru) — mirror `useHostedAuthRouteGuard`: hosted + bukan E2E + data loaded + `!useIsPaidPlan().isPaid` → navigate `SUBSCRIBE_ROUTE` dengan `{ redirect: path saat ini }`. Dipasang di `_app/route.tsx` setelah auth gate lolos (onboarding tetap di jalur `_authenticated`, tidak terblokir).
10. **`/subscribe`**: sudah mendukung `?redirect` + polling checkout; hanya tambah link "Back to homepage". Pricing publik me-link `/sign-up?redirect=/subscribe&plan=…` supaya setelah daftar langsung ke halaman bayar.

## Urutan funnel final

Anonim: `/` landing → Get started → `/sign-up` → (verify-email, bypass di dev) → onboarding wizard → `/projects` → **redirect `/subscribe`** → bayar PayPal → kembali ke `/projects` → tools terbuka.

## Verifikasi

- Dev: `/` menampilkan landing anonim; `/pricing` publik; user login free di `/projects` dilempar ke `/subscribe`; setelah `subscription.planTier` di D1 lokal diganti ke `pro` (via wrangler d1 execute) tools terbuka.
- `tsc --noEmit` (14 error P2 → 12 setelah fix impor), oxlint file baru, playwright spec keyword (E2E tetap hijau), regenerasi routeTree otomatis saat dev berjalan.
- Copy tanpa em-dash, tema DaisyUI selalu sinkron light/dark.

## Catatan produksi (di luar scope ini)

Caddy production tetap menyajikan situs marketing statis untuk `/`; landing in-app berlaku untuk dev dan origin aplikasi. Membuat prod `/` menunjukkan landing in-app adalah keputusan deploy terpisah (ubah allowlist `@marketingRoutes` di gateway-caddy), bisa dikerjakan nanti bila diminta.

## File yang berubah

Baru: `src/routes/index.tsx`, `src/routes/pricing.tsx`, `src/client/features/marketing/LandingPage.tsx`, `src/client/features/marketing/PricingSection.tsx`, `src/middleware/paid-plan-gate.ts`, `src/client/features/billing/use-paid-plan-guard.ts`.
Ubah: `src/middleware/unauthenticated-redirect.ts`, `src/serverFunctions/middleware.ts`, `src/routes/_app/route.tsx`, `src/lib/auth-redirect.ts`, `src/routes/_auth.tsx`, `src/routes/_auth.sign-in.tsx`, `src/routes/_auth.sign-up.tsx`, `src/routes/_app/projects.tsx`, `src/routes/_authenticated.subscribe.tsx`, `src/server/features/audit/services/AuditService.ts`, `src/server/features/onboarding/OnboardingChatAgent.ts`.
Hapus: `src/routes/_app/index.tsx`.
