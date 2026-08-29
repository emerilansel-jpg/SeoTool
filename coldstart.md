# Coldstart — JetDigitalSEO (SeoTool.im)

Dokumen konteks untuk melanjutkan pengembangan di percakapan baru.

Terakhir diperbarui: 2026-08-29. Versi aplikasi: `0.1.4`. Commit aplikasi production: `98b2383`. Commit teratas `origin/main`: `bf3090c` (rebrand surface, MENUNGGU deploy).

> **STATUS AUTHORITATIVE:** release v0.1.4 dan hotfix entitlement sudah di-commit, dipush ke `origin/main`, dan live di `https://seotool.im` pada commit `98b2383`. Folder `.playwright-mcp/` dan `.testsprite/` adalah artefak lokal dan sekarang sudah di-gitignore; jangan di-commit.

---

## Sesi 2026-08-29: penyelesaian rebrand + kanal deploy rusak (2026-08-29)

**Commit `bf3090c` (`fix: finish seotool rebrand on user-facing surfaces`) sudah di `origin/main` tapi BELUM live di production** karena kanal deploy otomatis rusak (lihat bawah). Isi perubahan:

- Semua referensi GitHub `every-app/open-seo` yang user-visible diarahkan ke repo publik `emerilansel-jpg/SeoTool` (terverifikasi ada dan public via `git ls-remote` anonim, HEAD-nya mengikuti main): perintah `npx skills add` + clone manual di halaman `/ai`, link GitHub Issues di `/support`, link docs setup di `AuthConfigErrorCard`, `GSC_SELF_HOSTED_SETUP_DOCS_URL` (`docs/SELF_HOSTING_GOOGLE_SEARCH_CONSOLE.md` ada di repo), dan `GA4_SELF_HOSTED_SETUP_DOCS_URL` (doc GA4 tidak ada di repo, diarahkan ke section auth `SELF_HOSTING_CLOUDFLARE.md`). Sisa `open-seo`/`openseo` di src kini hanya infra ID yang disengaja (HMAC salt `openseo:ga4:`/`openseo:gsc:`, localStorage legacy `openseo:lastProjectId`, URL dev portless `open-seo.localhost`, nama package) plus fixture URL test.
- `.gitignore`: `.testsprite/` dan `.playwright-mcp/` di-ignore (artefak TestSprite sensitif, pernah bocor password di trace).
- `e2e/admin-billing.spec.ts`: test pertama diberi `test.setTimeout(120_000)` — Playwright 1.59 menghapus `timeout` dari `TestDetails` (TS2353 kalau dipakai di options). Full E2E lokal **22/22 pass** setelah fix; sebelumnya 21/22 karena flake cold-start compile (42s vs default 45s).
- Gates: tsc 0 error, oxlint 0, prettier bersih.

**Kanal deploy GitHub Actions RUSAK**: workflow "Deploy to VPS" gagal di SSH handshake (`unable to authenticate, attempted methods [none password]`) untuk `bf3090c`, `98b2383`, `05225e2`, dan `fc6e3b7` — secret `VPS_PASSWORD` di GitHub sudah tidak diterima server VPS. Deploy sukses terakhir via Actions: `8e2bf1d` (2026-08-24). Semua release sejak itu dideploy manual dari mesin operator. **Agent berikutnya: jangan asumsikan push main = live.** Untuk deploy `bf3090c`, user perlu jalankan `bash auto-deploy.sh` sebagai `seotool` di VPS (atau update secret `VPS_PASSWORD`). SSH password dari mesin lokal juga tidak tersedia untuk agent (fail2ban + password berubah).

**Verifikasi production (98b2383, sehat)**: `/api/health` 200 `{"status":"ok"}`, landing/pricing/sign-in 200, `/ai` 307 untuk anonim. GUI test via in-app browser dengan sesi owner: `/ai` render penuh (MCP URL `https://seotool.im/mcp`, 4 setup guide, 7 skills, 36 tools), Dashboard project render dengan data nyata (audit 46 halaman, Backlink Pulse 425 ref domains snapshot hari ini, Content Quality avg 87), `/billing` render plan Agency + quota limits. Catatan: pricing di marketing site (`web/`, statis) masih menampilkan kartu legacy Lite/Pro/Agency sedangkan `/subscribe` in-app hanya menawarkan Free + All Access untuk customer baru — inkonsistensi konten marketing yang perlu penyelarasan di sesi berikutnya. Screenshot IAB mengalami throttling (`browser screenshot activity capture failed for guest`) setelah beberapa panggilan; bukti memakai DOM snapshot.

**TestSprite 2026-08-29: inconclusive** — 3 run (Billing, Backlinks, retry Billing) gagal/blocked semuanya di timeout sisi runner (goto 15s, scroll_into_view 15s, click 10s) padahal site merespons cepat via curl dan browser lokal. Jangan catat sebagai regresi produk; rerun saat runner sehat. Plan test baru untuk halaman AI & MCP sudah didraft di `.testsprite/ai-mcp-page-plan.json` (lokal, gitignored) — buat test-nya SETELAH `bf3090c` live supaya tidak menguji build lama.

---

## Release v0.1.4 live dan terverifikasi (2026-08-28)

- Release feature commit: `fc6e3b7` (`release: v0.1.4`). Hotfix subscribe: `05225e2` (`fix: return paid subscribers to workspace`). Hotfix Keyword Pro legacy paid access: `98b2383` (`fix: honor legacy paid access in keyword pro`). `origin/main`, branch `codex/v0.1.4`, dan production sekarang berada di `98b2383`.
- Backup Postgres sebelum migrasi tersimpan di VPS: `/home/seotool/backups/openseo-pre-v0.1.4-20260828.dump`; `pg_restore --list` berhasil.
- Journal migrasi Postgres yang stale sudah diaudit dan direkonsiliasi. Migration `0032` yang benar-benar belum ada diterapkan manual; schema/index `0026`–`0033` diverifikasi, hash journal diisi dari file release, lalu deploy menerapkan `0034`, `0035`, dan `0036`. Journal dan schema production sekarang konsisten sampai `0036`.
- Container `jetdigitalseo-open-seo-1` dan `jetdigitalseo-postgres-1` healthy. External smoke terakhir: `/api/health`, `/`, dan `/sign-in` `200`; route authenticated mengarahkan anonymous user ke sign-in dengan benar.
- Outer `gateway-caddy` sempat direstart `gateway-watchdog.timer` setiap ~30 detik. Ada dua cacat infra: compose healthcheck memanggil admin API `127.0.0.1:2019` padahal Caddy memakai `admin off`, dan watchdog origin selalu gagal karena tidak mempercayai root CA internal serta route host-network masih memakai upstream Docker DNS `omniroute:20128`. Production diperbaiki menjadi healthcheck `http://127.0.0.1:80/`, upstream `127.0.0.1:20128`, dan watchdog `curl --cacert /opt/gateway/caddy-local-root.crt`. Caddy/Bash tervalidasi; gateway bertahan healthy selama lebih dari dua siklus watchdog, restart count 0, OmniRoute origin `307`, dan SeoTool health OK. Backup: `/opt/gateway/compose.yaml.bak-20260828-healthcheck`, `/opt/gateway/Caddyfile.bak-20260828-watchdog`, dan `/usr/local/bin/gateway-watchdog.sh.bak-20260828`. Ketiga file aktif berada di VPS dan bukan file repo `gateway-caddy/docker-compose.yml` (yang mengelola inner `seotool-caddy`).
- Akun QA `qa@tester.com` dan akun owner `alfu13.sf@gmail.com` diberi legacy Pro sementara 30 hari untuk live testing. Entitlement owner berakhir 2026-09-27; ini bukan PayPal membership dan harus dibatalkan/dikembalikan ke Free setelah pengujian bila tidak lagi diperlukan. Owner juga sudah diverifikasi masuk `PLATFORM_ADMIN_USER_IDS` production, tanpa mencatat user ID rahasia di dokumen ini.
- Review complexity, security, billing/metering, local static checks, build, unit/integration test, migration test, dan seluruh E2E sudah hijau.
- Blocker review yang sudah diperbaiki dan diuji:
  1. checkout PayPal sekarang memakai claim/lease atomik sebelum provider call, attach CAS, orphan cancellation, dan seat cleanup; request yang kalah tidak membuat subscription;
  2. membership pending dengan remote PayPal `ACTIVE`/`SUSPENDED` disinkronkan dan memblokir checkout pengganti; remote 404 melepas reservation stale;
  3. pelepasan cohort seat memakai `seatReleaseToken`, sehingga cancel + webhook paralel hanya decrement sekali;
  4. stale creation/approval lease direkonsiliasi eksplisit oleh `KeywordProCheckoutReconciler`;
  5. pembuatan checkout account-wide sekarang owner-only;
  6. `PAYMENT.SALE.COMPLETED` dideduplikasi oleh payment ledger sebelum refill monthly credits;
  7. qualification, referred reward, referrer commission, dan cap 12 cycle memakai shared-row locking/status claim agar retry/concurrency hanya memberi reward sekali;
  8. seluruh DataForSEO call hosted sekarang melakukan reservasi credit atomik sebelum provider dispatch, lalu settle/refund berdasarkan cost aktual; request concurrent dengan saldo sama hanya mengirim pemenang;
  9. lifecycle/grace access disatukan di `shared/subscription-access.ts`, cohort keys memakai source-of-truth bersama, dan service besar dipecah menjadi lifecycle + checkout reconciler.
- Temuan tambahan saat E2E juga sudah diperbaiki:
  - lazy DataForSEO loader tidak lagi menyimpan in-flight Promise global yang dapat bocor lintas request Cloudflare;
  - live SERP pre-authorization dinaikkan ke ceiling konservatif, sedangkan sisa hold tetap direfund dari cost provider aktual;
  - cold-start admin dan test performance dengan CPU throttle memakai timeout readiness eksplisit 30 detik, bukan timeout global yang longgar.
- Follow-up non-blocking: pipeline multi-call Keyword Research Pro belum memiliki checkpoint per stage; retry setelah late failure masih dapat mengulang provider spend. Tambahkan durable stage checkpoints sebelum menaikkan ukuran batch atau menjalankan jobs asynchronous besar.
- Warning non-blocking yang masih terlihat: export `ReportsLayout` dari route mengurangi code splitting, Better Auth menyarankan plugin `tanstack-start-cookies` diletakkan terakhir, dan production build melaporkan beberapa chunk besar/static+dynamic import lama.

---

## Hotfix production dan QA Keyword Research Pro (2026-08-29)

- Root cause paywall palsu: `/subscribe` sudah mengakui legacy paid subscription sebagai entitlement valid, tetapi halaman dan server function Keyword Research Pro hanya memeriksa membership All Access. Akibatnya user legacy Pro diarahkan ke upgrade meskipun subscription masih aktif.
- Commit `98b2383` menambahkan resolver entitlement bersama di `src/shared/keyword-pro-membership.ts`. Keyword Pro sekarang menerima admin, All Access aktif/grace, atau legacy paid subscription aktif/grace. Server function dan UI memakai keputusan yang sama agar tidak drift.
- Unit entitlement matrix dan focused tests lulus: **20/20**. `pnpm ci:check` lulus dengan 0 warning/error pada 1.013 file. Production build client + SSR + final typecheck lulus. Focused Playwright untuk Keyword Pro/Backlinks/checkout lulus setelah memperbaiki satu locator test yang stale.
- Production diuji dengan akun QA legacy Pro: tab Pro terbuka tanpa paywall, limit Basic 25 dan Full + backlinks 10 tampil, Standard +30% dan BYOK +10% tersedia, serta mobile 375 px tidak overflow.
- Satu run nyata keyword `seo tools` berhasil memakai DataForSEO Standard di Indonesia. UI menghasilkan satu row: volume 1.300, KGR 0,538, allintitle 700, weak SERP 7/10, score 66, opportunity Easy; tidak ada console error.
- TestSprite fresh agent run `c8a8ba53-5f16-43ed-bb71-0528286ae208` lulus **18/18 execution steps** untuk login → project → Keyword Research → Pro Analysis → Full + backlinks. Assertion yang benar-benar tereksekusi memverifikasi mode Pro tetap terbuka, input keyword, opsi Standard/BYOK, dan tombol Run research. Trace tidak cukup eksplisit untuk membuktikan limit 10, estimated total, atau status enabled tombol; gunakan manual production QA dan focused E2E untuk cakupan tersebut. Dashboard: `https://www.testsprite.com/dashboard-v3/o/36e7342e-bce4-517f-b052-b785f2b2a6fc/projects/fd742ab8-7eb2-4e29-8cfb-0acbf64e0b6b/test-cases/07c712ea-86e5-4f25-b067-228e8422bdd6`.
- Gate 0 regresi fitur yang dapat diuji lulus untuk Keyword Pro, Local Map UI, Backlinks Live UI, Billing, mobile, dan isolasi `/admin` bagi non-admin. Full application Gate 0 **belum dapat dinyatakan selesai**: PayPal belum memiliki credential/product/plans/webhook, OpenPageRank belum memiliki API key, dan scan Local Map berbayar tidak dijalankan pada QA ini.
- TestSprite pernah menyalin password QA ke deskripsi trace. State autentikasi lokal sudah dihapus, tetapi credential QA/VPS wajib dirotasi dan artefak TestSprite harus diperlakukan sensitif. Jangan menaruh password atau session state di commit/dokumen.

---

## Handoff terbaru — All Access, Keyword Research Pro merge, referral global, dan Backlinks hybrid (2026-08-28)

### Arsitektur produk yang sudah diimplementasikan

Masukan Pak Nell dikoreksi menjadi arsitektur berikut:

1. **Keyword Research Pro bukan produk/route terpisah.** Ia adalah mode upgrade dari Keyword Research yang sudah ada.
2. **Membership progresif berlaku untuk seluruh SeoTool.im**, bukan hanya Keyword Research Pro.
3. **Referral adalah user/account mengundang user lain**, dengan reward di level akun, bukan referral khusus satu fitur.
4. **Pemakaian provider berbayar tetap credit-based**: Standard memakai credential platform dan dikenakan biaya provider +30%; BYOK memakai credential user secara request-scoped dan SeoTool mengenakan service fee 10% dari biaya provider.
5. **Backlinks memiliki dua kedalaman data**:
   - Basic Snapshot: agregat domain murah via OpenPageRank, tanpa mengarang link/page/anchor/spam detail.
   - Live Detailed: DataForSEO dengan data individual links, referring domains, top pages, anchors, spam, dan history.

### Status implementasi live

#### 1. Membership All Access dan PayPal

- Checkout baru berada di `/subscribe` dan hanya menawarkan **Free + All Access** untuk customer baru. UI plan picker lama dihapus (`src/client/features/billing/PlanPickerGrid.tsx`). Legacy Free/Lite/Pro/Agency tetap dipertahankan di backend/admin untuk existing subscribers dan quota compatibility.
- Server functions account-level baru: `src/serverFunctions/membership.ts` (`getMembershipStatus`, `createMembershipCheckout`, `verifyMembershipCheckout`, `cancelMembership`).
- `paidPlanGateMiddleware` sudah diubah agar `src/serverFunctions/membership.ts` selalu dapat dipanggil user free-tier. Nama file allowlist lama `keyword-pro-membership.ts` sudah dihapus.
- Checkout marker baru: `membership:{organizationId}:{cohortKey}`. Parser tetap menerima marker legacy `krp:*`.
- Cohort baru:
  - Founder 10: **$29/bulan** (10 slot)
  - Early 20: **$39/bulan** (20 slot)
  - Growth 50: **$49/bulan** (50 slot)
  - Public: **$59/bulan** (unlimited)
- Harga terkunci selama membership tidak terputus. `ACTIVE` memiliki akses; `SUSPENDED` mendapat grace 14 hari dari `currentPeriodEnd`; `CANCELLED`/`EXPIRED` kehilangan lock.
- Aktivasi membership menyinkronkan tabel subscription utama ke internal entitlement `pro`, mengisi PayPal subscription id, dan memberikan monthly credits sesuai konfigurasi Pro. Renewal `PAYMENT.SALE.COMPLETED` menyegarkan monthly credits.
- Cancel dari Billing memanggil PayPal, menandai membership cancelled, dan langsung menurunkan subscription lokal ke `free`; webhook tetap menjadi reconciliation path.
- **Perbaikan entitlement kritis:** pembuatan customer/quota tidak lagi meng-upsert subscription `free` setiap kali DataForSEO/chat dipakai. Sekarang hanya membuat row Free jika belum ada (`createFreeSubscriptionIfMissing`), sehingga subscription berbayar tidak dapat tertimpa secara tidak sengaja. Penentuan akses juga memakai status efektif bersama (`active`/`trialing`, atau grace 14 hari untuk `past_due`/`suspended`), bukan hanya nama tier yang tersimpan.
- Checkout mencegah subscription ganda: membership All Access aktif/suspended dan legacy paid plan aktif sama-sama mengarahkan user kembali ke Billing. Portal PayPal tetap dapat dibuka setelah grace berakhir untuk recovery/cancellation selama PayPal subscription id masih ada.
- PayPal product setting baru adalah `PAYPAL_ALL_ACCESS_PRODUCT_ID`. Admin → Pricing membuat product `SeoTool.im All Access` dan plan immutable per cohort. Setting lama `PAYPAL_KRP_PRODUCT_ID` tidak lagi dipakai checkout baru.
- Admin Pricing sekarang menjelaskan bahwa tier lama adalah **Legacy plan tiers**, sedangkan progressive cohort adalah **All Access membership cohorts**.
- Kapasitas cohort terbatas sekarang memakai **reservasi kursi atomik** (`plan_config.reserved_seats` + `keyword_pro_memberships.seat_reserved`), bukan count-then-check. Dua checkout simultan tidak dapat mengambil slot terakhir yang sama; checkout yang kalah otomatis mencoba cohort berikutnya. Kursi dilepas kembali jika pembuatan PayPal/upsert gagal, checkout pending menjadi terminal, webhook membatalkan membership, atau user cancel.

**Catatan kompatibilitas data:** tabel fisik masih bernama `keyword_pro_memberships`, `keyword_pro_referral_*`, dan key cohort masih berprefix `krp_`. Ini sengaja untuk menghindari migrasi destruktif pada release ini; semantik aplikasinya sekarang account-wide. Audit pre-deploy tidak menemukan member/config live pada cohort lama. Key baru adalah `krp_growth_50`.

#### 2. Referral account-wide

- Referral panel dipindahkan ke `/billing`; link share berbentuk `/subscribe?ref=CODE`.
- Referred account mendapat **5.000 credits** setelah activation.
- Referrer mendapat **20% nilai membership dalam credits** selama maksimum 12 successful billing cycles. Top-up dan pemakaian API tidak menghasilkan referral reward.
- Proteksi yang sudah ada/ditambah:
  - organization tidak dapat mereferensikan dirinya sendiri;
  - account dengan shared member/team overlap ditolak;
  - first valid attribution wins (pending attribution tidak dapat ditimpa code lain);
  - PayPal sale id unique/idempotent;
  - reward baru qualified setelah membership ACTIVE.
- Grant 5.000 credits dan komisi renewal sekarang dilakukan sebagai perubahan database atomik bersama status referral. Commission memakai state `pending → credited`; retry sale yang berhenti di tengah melanjutkan commission pending tanpa menggandakan credits. Batas 12 cycle dihitung dari commission berstatus `credited`, sehingga concurrent retry tidak dapat melewati cap.
- Storage referral masih organization-based karena account billing dan quota juga organization-based. UX-nya user-to-user; reward masuk ke organization milik referrer.

#### 3. Keyword Research Pro digabung ke Keyword Research

- Sidebar hanya memiliki satu item **Keyword Research**.
- Route utama `/p/$projectId/keywords` sekarang memiliki tab **Discover** dan **Pro Analysis** (`KeywordResearchViewTabs.tsx`).
- Route legacy `/p/$projectId/keyword-research-pro` hanya redirect ke `/p/$projectId/keywords?view=pro`, sambil meneruskan query kompatibel.
- Membership/checkout card khusus KRP dihapus (`KeywordResearchProAccess.tsx` dan server function `keyword-pro-membership.ts`). Pro Analysis dapat dipakai oleh admin, All Access aktif/grace, atau legacy paid subscription aktif/grace. User tanpa salah satu entitlement tersebut melihat CTA ke `/subscribe` dengan redirect kembali ke mode Pro.
- Limit pipeline:
  - Pro Core/Basic tanpa backlink: maksimum **25 keywords/run**.
  - Full + backlinks: maksimum **10 keywords/run** karena biaya dan jumlah competitor URL jauh lebih besar.
- Standard +30% dan BYOK +10% tetap tersedia. BYOK credential hanya berada di state browser/request dan tidak disimpan.
- Pipeline KGR + live `allintitle` + weak SERP + optional DataForSEO bulk backlink competition tetap memakai implementasi sebelumnya (`KeywordResearchProService`).

#### 4. Backlinks Basic vs Live

- URL/search state baru: `provider=live`; default tanpa param adalah `basic`.
- Basic memakai `OpenPageRankBacklinksService.ts`:
  - endpoint modern bulk OpenPageRank dengan fallback endpoint legacy;
  - cache R2 24 jam;
  - hanya memetakan authority dan referring-domain aggregate yang benar-benar diberikan provider;
  - source=`openpagerank`, mode=`basic`, confidence=`low`;
  - individual links, referring pages, anchors, spam, broken links, top pages, dan history tetap `null`/kosong, bukan angka palsu;
  - health/toxic score tidak dibuat karena data tidak memenuhi minimum faktor.
- Live memakai DataForSEO existing dengan source=`dataforseo`, mode=`live`, confidence=`high` dan semua detail tabs.
- Live Backlinks kini memiliki pemilih Standard +30% atau BYOK +10%. Credential BYOK request-scoped, tidak masuk URL/cache/DB.
- Basic mode menyembunyikan detailed tabs dan menjelaskan keterbatasan data secara eksplisit.
- Admin → API Keys memiliki setting editable/secret baru `OPENPAGERANK_API_KEY`.

### File baru penting

- `src/serverFunctions/membership.ts`
- `src/shared/subscription-access.ts`
- `src/server/features/keywords/repositories/KeywordProReferralRewardRepository.ts`
- `src/server/features/keywords/repositories/KeywordProCohortSeatRepository.ts`
- `src/server/features/keywords/repositories/KeywordProMembershipPaymentRepository.ts`
- `src/server/features/keywords/services/KeywordProCheckoutReconciler.ts`
- `src/server/features/keywords/services/KeywordProSubscriptionLifecycle.ts`
- `src/server/features/keywords/services/KeywordProConfigService.test.ts`
- `src/server/features/keywords/services/KeywordProMembershipService.test.ts`
- `src/client/features/billing/BillingSubscriptionCards.tsx`
- `src/client/features/keywords/page/KeywordResearchViewTabs.tsx`
- `src/server/features/backlinks/services/OpenPageRankBacklinksService.ts`
- `src/server/features/backlinks/services/openPageRankOverview.ts`
- `src/server/features/backlinks/services/OpenPageRankBacklinksService.test.ts`
- `src/server/billing/credit-reservations.ts`
- `src/server/billing/credit-reservations.test.ts`
- `src/server/lib/dataforseo/metering.ts`
- `src/server/lib/dataforseo/cost-ceiling.ts`
- `src/server/lib/dataforseo/cost-ceiling.test.ts`
- `src/types/schemas/keyword-research-pro.test.ts`
- `e2e/keyword-pro-backlinks-modes.spec.ts`
- `e2e/fixtures/seed.sql`
- `drizzle/0057_keyword_pro_cohort_seats.sql` + snapshot `0057`
- `drizzle-pg/0034_keyword_pro_cohort_seats.sql` + snapshot `0034`
- `drizzle/0058_keyword_pro_checkout_safety.sql` + snapshot `0058`
- `drizzle-pg/0035_keyword_pro_checkout_safety.sql` + snapshot `0035`
- `drizzle/0059_usage_credit_reservations.sql` + snapshot `0059`
- `drizzle-pg/0036_usage_credit_reservations.sql` + snapshot `0036`

### File yang sengaja dihapus

- `src/client/features/billing/PlanPickerGrid.tsx` — checkout customer baru tidak lagi memilih Lite/Pro/Agency.
- `src/client/features/keywords-pro/KeywordResearchProAccess.tsx` — membership tidak lagi khusus KRP.
- `src/serverFunctions/keyword-pro-membership.ts` — diganti server functions account-level `membership.ts`.

### Verifikasi yang sudah dilakukan

| Check                                                  | Hasil                                                                                                                                                                                                                                                         |
| ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm ci:check`                                        | ✅ pass pada source terbaru: Prettier, knip, root TypeScript, `badseo` TypeScript, dan oxlint type-aware **0 warning / 0 error pada 1.013 file**.                                                                                                             |
| Production Vite build (client + SSR + final typecheck) | ✅ pass; hanya warning non-blocking chunk size/static+dynamic imports lama.                                                                                                                                                                                   |
| Full Vitest                                            | ✅ **128/128 files, 1.125/1.125 tests** pass. Termasuk real libsql concurrency untuk credit reservation, payment replay, seat release, referral qualification/commission, checkout race, lifecycle PayPal, migration, dan DataForSEO error settlement/refund. |
| Migration generation                                   | ✅ D1 through `0059` + PG through `0036`; kedua generator menghasilkan `No schema changes`.                                                                                                                                                                   |
| Local D1 migration                                     | ✅ `0058` dan `0059` diterapkan ke D1 E2E lokal dan fixture berhasil di-seed.                                                                                                                                                                                 |
| Focused Playwright regression                          | ✅ **7/7 pass**: seluruh Admin/Billing, throttled Domain Overview performance, dan keyword navigation lintas request.                                                                                                                                         |
| Full Playwright E2E                                    | ✅ **22/22 pass** dalam satu run (7,6 menit): Admin analytics/pricing/API keys, Billing, Local Map Rank, All Access/referral, KRP merge, Backlinks Basic/Live Standard/BYOK, 25-route dashboard audit, dan mobile.                                            |
| `git diff --check`                                     | ✅ bersih; warning CRLF Windows saja.                                                                                                                                                                                                                         |
| TestSprite production                                  | ✅ Backlinks Explorer run `3660bc7b-b934-449e-a9ca-8f024d921459` **passed 7/7**. Fresh Keyword Pro agent run `c8a8ba53-5f16-43ed-bb71-0528286ae208` **passed 18/18 execution steps**; lihat catatan scope assertion pada bagian hotfix 2026-08-29.            |

### Langkah WAJIB untuk agent berikutnya

1. **Jangan reset artefak user.** `.playwright-mcp/` dan `.testsprite/runs/` untracked; jangan commit. Source aplikasi production sudah berada di `98b2383`.
2. Semua quality gate release hijau: 1.125 Vitest, CI static checks, production build, migration apply/generate, 7 focused Playwright, 22 full Playwright E2E, production smoke, dan TestSprite Backlinks 7/7. Jika ada perubahan lanjutan, rerun gate yang proporsional.
3. Reservasi cohort dan usage credits sudah atomik. Pertahankan `reserved_seats`/`seat_reserved`, checkout lease/CAS, payment ledger, serta reserve/settle/refund paths saat mengubah checkout, cancel, webhook, atau provider calls.
4. **PayPal production belum dapat dipakai** karena credential/plan belum dikonfigurasi. Admin harus mengisi semua `PAYPAL_*`, membuat product/plans lewat Admin → Pricing, mendaftarkan `https://seotool.im/api/paypal/webhook`, lalu menguji lifecycle checkout → ACTIVE → renewal → cancel. Jangan mengklaim payment gateway operational sebelum flow ini lulus dengan sandbox/live credential resmi.
5. **Backlinks Basic belum dapat dipakai** karena `OPENPAGERANK_API_KEY` belum tersedia. Backlinks Live/DataForSEO sudah memiliki credential platform. Isi key melalui Admin → API Keys lalu uji Basic Snapshot live.
6. Akun owner `alfu13.sf@gmail.com` mempunyai Pro sementara sampai 2026-09-27 agar fitur dapat diuji tanpa menunggu PayPal. Jangan salah menganggap entitlement manual ini sebagai bukti checkout/webhook PayPal.
7. TestSprite plan Keyword Pro sudah diperbarui dan fresh agent run lulus, tetapi generated assertion hanya membuktikan sebagian intent plan. Jangan mengklaim TestSprite memverifikasi limit 10 atau estimated total; gunakan focused Playwright/manual QA untuk dua hal itu.
8. Rotasi credential QA/VPS sebelum pengujian berikutnya karena password pernah terekspos pada TestSprite trace dan percakapan. Jangan menyimpan password atau cookie state di repo.

---

## Identitas project

**SeoTool.im** (`package.json: open-seo` v0.1.4) — SEO SaaS dashboard (Semrush/Ahrefs alternative). Cloudflare Workers + TanStack Start, Postgres (primary) / D1 (SQLite, dev fallback), hosted-only. Production `98b2383` menawarkan Free + progressive All Access untuk customer baru sambil mempertahankan legacy tiers untuk existing subscriber/quota compatibility.

**Transformasi SaaS (2026-08-08)**: Project ini dulunya open-source self-host (3 auth mode, BYO API key, credit-pool billing). Sekarang **hosted-only** — `cloudflare_access` dan `local_noauth` auth modes dihapus, hanya `hosted` (Better Auth). Billing model berubah dari single-plan + credit pool → **4 tier dengan per-feature quotas** (Ahrefs-style).

**Dark Command Center + Conversion UX (2026-08-16)**: Marketing site redesign ke dark theme (near-black canvas, cyan data-glow `#00e5ff`, orange CTA `#ff5600`). Ditambah conversion UX: hero URL analyzer, metric tooltips, pricing toggle, structured data. Semua CSS-only animations (PageSpeed-safe), `prefers-reduced-motion` guards.

**Rebrand OpenSEO → SeoTool.im (2026-08-17)**: Semua user-facing + internal code identifiers cleaned (themes, localStorage, MCP commands, env examples, docs, marketing). Hanya infra IDs yang tersisa (DB names, Hyperdrive, HMAC salts). Commit `1343430`.

**In-App Landing Page + Hard Paywall (2026-08-19)**: SaaS app kini punya homepage publik di `/` (landing page DaisyUI) dan halaman pricing publik di `/pricing`. Hard paywall: server function gate (`paidPlanGateMiddleware`) + client guard (`usePaidPlanGuard`) — user free-tier tidak bisa memakai tools sampai berlangganan. E2E bypass tetap jalan (BYPASS_AUTH). Funnel: sign-up → onboarding → /projects → /subscribe → bayar → tools terbuka.

**Production Deploy + Caddy Re-architecture (2026-08-19/20)**: Seluruh P2 batch + landing/paywall deployed ke VPS (commit `751d389`, migrations D1 0048 + PG 0025). Ingress di-re-arsitektur menjadi inner `seotool-caddy` pada `127.0.0.1:8080` di belakang outer Caddy host-network. Nama outer container dan source config berubah lagi setelah deploy awal; gunakan topologi verified 2026-08-26 di bagian "Produksi LIVE".

**Dashboard UI/UX QA & Container Layout Standardization (2026-08-20/21)**: Audit E2E menyeluruh pada 25 rute dashboard (`qa-dashboard-audit.spec.ts`). Redesign search bar Content Gap dan Link Intersect menjadi form horizontal 1 baris yang ramping dengan instant presets. Standarisasi seluruh wrapper rute dengan kontainer `max-w-7xl mx-auto space-y-4` dan padding `px-4 py-4 pb-24 overflow-auto md:px-6 md:py-6 md:pb-8`.

**VPS Caddy Assets & Fresh Startup Build Fix (2026-08-21)**: Perbaikan Caddyfile root (`@marketingAssetFile`) agar request `/assets/*` milik SPA app tidak ditelan oleh direktori marketing; perbaikan `docker-entrypoint.sh` untuk selalu mengompilasi build baru saat container start; verified live di `https://seotool.im` (commit `f969bb3`).

**Local Map Rank Tracker Rebuild (2026-08-24)**: Pipeline GMB Grid dibangun ulang dari pencarian Google Business Profile sampai workflow scan, persistence, scheduler, kuota, serta UI hasil. Implementasi memakai DataForSEO Maps SERP, mendukung scan manual/terjadwal, dan menyimpan snapshot per titik (commit `6206027`).

**Hosted PayPal + Admin Fixes (2026-08-24/25)**: Checkout PayPal hosted, top-up, webhook, admin pricing/settings, dan platform-admin guard diperkuat (`8114af9`). Agregasi analytics Postgres di `/admin` diperbaiki (`8e2bf1d`). Penemuan GA4 property sekarang menangani pagination, account summaries, dan pesan error/empty state dengan benar (`8481324`).

**Keyword Research Pro (2026-08-28, production v0.1.4)**: Pro Analysis sudah digabung ke `/p/$projectId/keywords?view=pro`; route terpisah lama hanya menjadi redirect kompatibel. Membership/referral sudah dipromosikan menjadi account-wide All Access.

**Production Deploy 2026-08-28/29**: Commit `98b2383` live di VPS. Container app/Postgres healthy, migration journal konsisten sampai PG `0036`, DataForSEO credential tersedia, dan public health melalui Cloudflare `200`. PayPal belum aktif karena setting/plan belum dikonfigurasi; OpenPageRank Basic belum aktif karena API key belum tersedia.

---

## Tech stack

| Layer      | Teknologi                                                                                                                                                                                    |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Framework  | TanStack Start (SSR) + TanStack Router/Query/Form, React 19, Vite 7                                                                                                                          |
| Runtime    | Cloudflare Workers (workerd) + Wrangler 4                                                                                                                                                    |
| DB         | Drizzle ORM, dual-backend: Postgres (hosted SaaS, primary) / D1 (SQLite, dev fallback)                                                                                                       |
| Auth       | Better Auth **hosted-only** (email/password + Google OAuth + Turnstile captcha). Self-host modes (`cloudflare_access`, `local_noauth`) dihapus.                                              |
| Data SEO   | `dataforseo-client` (metered), GSC (first-party, gratis)                                                                                                                                     |
| AI         | Cloudflare Agents SDK, OpenRouter, MCP SDK (36 tools)                                                                                                                                        |
| Billing    | Production: Free + progressive All Access untuk signup baru; legacy tiers dipertahankan; top-up/local credits dan referral account-wide. PayPal/OpenPageRank production belum dikonfigurasi. |
| Quota      | `QuotaService` — 11 features (daily/monthly/gauge windows), atomic upsert enforcement                                                                                                        |
| UI         | Tailwind v4 + DaisyUI v5, lucide-react, recharts, jspdf (client PDF)                                                                                                                         |
| Email      | Loops (transactional)                                                                                                                                                                        |
| Analytics  | PostHog                                                                                                                                                                                      |
| Deploy VPS | Docker Compose (workerd + Postgres 17) di belakang inner `seotool-caddy` dan outer `gateway-caddy` host-network; public TLS melalui Cloudflare                                               |

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
- **Request middleware**: gating request-scoped (redirect, headers) pakai `createMiddleware().server()` type `request` di `src/start.ts` requestMiddleware array. BEFORELOAD TIDAK punya akses ke Request di versi Start ini (serverContext kosong).
- **Hard paywall**: `paidPlanGateMiddleware` (function middleware) di `globalServerFunctionMiddleware` setelah `ensureUserMiddleware`. Allowlist via `serverFnMeta.filename`/`.name`. Lewati untuk self-host dan E2E (`BYPASS_AUTH`).

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

| File                             | Keterangan                                                                                                                                                                                   |
| -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/server/billing/paypal.ts`   | `billingPortal.createSession(subscriptionId)` — PayPal subscription revision URL → redirects to PayPal hosted billing management page.                                                       |
| `src/serverFunctions/billing.ts` | +`getCustomerPortalUrl` server fn: `requireAuthenticatedContext` → gate hosted + `customerHasPaidPlan` → read `paypalSubscriptionId` from DB → `paypal.billingPortal.createSession()` → URL. |
| `src/routes/_app/billing.tsx`    | +Tombol "Manage Subscription" (icon CreditCard, loading spinner) untuk paid users. Redirect ke PayPal Billing Portal. Cancel via portal → webhook sudah sync quotas.                         |

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
| `src/server/features/billing/repositories/QuotaRepository.ts`                | `getPlanTier`, `upsertSubscription` (paypalSubscriptionId), `getUsageQuota`, `incrementUsageQuota` (atomic upsert + conditional window reset via SQL CASE), `peekUsageQuota`, `resetUsageQuotaForOrg`                                                             |
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

| File                                          | Keterangan                                                                                                                                                                   |
| --------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/server/billing/customer-status-model.ts` | Derive `planTier` dari PayPal subscription (`plan_id` + `PAYPAL_PLAN_IDS`). Extract `paypalSubscriptionId`, `currentPeriodEnd`. Maps PayPal statuses (ACTIVE/CANCELLED/etc). |
| `src/server/billing/customer-status-sync.ts`  | `syncPaypalCustomerStatus` → upsert `billing_customer_status` + upsert `subscription` + **reset windowed quotas on tier change** + grant credits + sync to Loops             |
| `src/server/billing/paypal-webhook.ts`        | Handle events: `BILLING.SUBSCRIPTION.CREATED/UPDATED/CANCELLED/EXPIRED/ACTIVATED/SUSPENDED`, `PAYMENT.CAPTURE.COMPLETED`. Semua converge ke `syncPaypalCustomerStatus`.      |
| `src/server/billing/paypal-webhook-verify.ts` | PayPal webhook signature verification via `/v1/notifications/verify-webhook-signature` API.                                                                                  |
| `src/server/billing/subscription.ts`          | `getOrCreateOrganizationCustomer` → lazily create default free-tier subscription row + grant free credits. `customerHasPaidPlan` → baca dari QuotaRepository (local DB).     |
| `src/server/billing/credits.ts`               | Local credits management: `grantMonthlyCredits`, `getCreditBalance`, `deductCredits`, `addTopupCredits`. Menggunakan `usage_quota` table.                                    |
| `src/server/billing/paypal.ts`                | PayPal REST API client: OAuth2 token caching, typed facade untuk subscriptions/billingPlans/billingPortal/webhooks.                                                          |
| `docs/PAYPAL_BILLING.md`                      | Setup guide: 4 plan tiers di PayPal dashboard, webhook events, plan tier resolution flow, credits system                                                                     |

### Fase 5 — UI: Pricing, Billing, Quota Bars, Paywall (LENGKAP)

| File                                             | Keterangan                                                                                                                                                                       |
| ------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/client/features/billing/plan-detection.ts`  | `getCustomerPlanTier()` — resolve PlanTier dari PayPal subs. `getCustomerPlanStatus()` — backward-compat free/paid. Uses `PAYPAL_PLAN_IDS`.                                      |
| `src/client/features/billing/HostedPlanGate.tsx` | `HostedPlanGateState` +`planTier: PlanTier`. Uses `usePlanTier()` hook (local DB, no Autumn).                                                                                    |
| `src/client/features/billing/use-billing.ts`     | Local hooks: `usePlanTier()`, `useIsPaidPlan()`, `useSubscriptionProblemStatus()`. Fetch dari `getQuotaStateSummary`.                                                            |
| `src/client/features/billing/QuotaBar.tsx`       | Komponen: label, used/limit, progress bar (green/yellow/red), reset time, "Unlimited" badge                                                                                      |
| `src/routes/_authenticated.subscribe.tsx`        | **3-tier picker** (Lite $49 / Pro $149 / Agency $499). Radio-style selection. Checkout via `createPaypalSubscription` → redirect ke PayPal approval URL. PostHog events.         |
| `src/routes/_app/billing.tsx`                    | Current plan card + quota usage section (QuotaBar per feature via `getQuotaStateSummary`). Tombol Manage Subscription → PayPal portal. Buy Credits → PayPal one-time payment.    |
| `src/serverFunctions/billing.ts`                 | +`getQuotaStateSummary` server fn. +`getCustomerPortalUrl` → PayPal billing portal via subscription revision URL.                                                                |
| `src/serverFunctions/paypal-checkout.ts`         | `createPaypalSubscription` (creates PayPal subscription + returns approve URL). `verifyPaypalSubscription` (post-checkout verification). `createPaypalTopup` (one-time payment). |

### Fase 6 — Landing Page Polish (LENGKAP)

| File                                    | Keterangan                                                                                                                                                                                                   |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `web/src/routes/_marketing/pricing.tsx` | **4-tier comparison table** (Ahrefs-style). Plan cards + feature matrix (4 groups: Projects/Keywords, Audits/Backlinks, AI/Content, Integrations/Tools). Mobile card layout. FAQ updated untuk tiered model. |
| `web/src/components/landing-page.tsx`   | Hero copy: "The SEO platform that grows with you". Open-source section: "Built on open source" (bukan self-host).                                                                                            |

### Fase 7 — VPS Deployment Config (LENGKAP)

| File                                                     | Keterangan                                                                                                                                                                                                                                                      |
| -------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `docker-compose.hosted.yaml`                             | 2 services: `open-seo` (workerd, AUTH_MODE=hosted, DATABASE_PROVIDER=postgres) + `postgres` (17-alpine, healthcheck). Caddy TIDAK termasuk — ditangani oleh seotool-caddy dedicated + pesat forward (lihat "Produksi LIVE" bawah). Volumes: app data + pg data. |
| `gateway-caddy/docker-compose.yml` + `Caddyfile.seotool` | **Config ingress seotool.im yang aktif** (2026-08-20): seotool-caddy binds 127.0.0.1:8080, network jetdigitalseo_default. Semua routing seotool.im (marketing static + proxy SaaS) di sini. Ada juga `deploy.sh` + `MANUAL-DEPLOY.md`.                          |
| `gateway-caddy/Caddyfile` + root `Caddyfile`             | **STALE sebagai source outer gateway**. Outer Caddy aktif membaca `/opt/gateway/Caddyfile`; file repo ini jangan disalin ke sana tanpa review karena juga memuat konfigurasi domain lain.                                                                       |
| `.env.hosted.example`                                    | Template: POSTGRES_PASSWORD, BETTER_AUTH_SECRET/URL, GOOGLE_CLIENT_ID/SECRET, TURNSTILE, LOOPS, DATAFORSEO_API_KEY, PAYPAL_CLIENT_ID/SECRET/MODE/WEBHOOK_ID, OPENROUTER_API_KEY, POSTHOG.                                                                       |
| `scripts/deploy-vps.sh`                                  | Deploy script: pre-flight checks (env, placeholders, docker) + compose up --build + health wait loop + summary.                                                                                                                                                 |
| `auto-deploy.sh`                                         | Wrapper untuk CI: backup `.env.hosted` → `git fetch + reset --hard origin/main` → restore `.env.hosted` → `scripts/deploy-vps.sh --build`. Dipanggil oleh GitHub Action.                                                                                        |
| `.github/workflows/deploy.yml`                           | CI/CD: `appleboy/ssh-action` SSH ke VPS → jalankan `auto-deploy.sh`. Trigger: push ke `main`.                                                                                                                                                                   |
| `docker-entrypoint.sh`                                   | Detect `DATABASE_PROVIDER=postgres` → run `db:migrate:pg` (bukan `db:migrate:local`).                                                                                                                                                                           |

---

## Update 2026-08-24–26: Local Map, admin, GA4, dan Keyword Research Pro

### Local Map Rank Tracker (`6206027`)

- Route utama tetap `/p/$projectId/gmb-grid`.
- `GmbProfileSearch` menggantikan autocomplete lama. User memilih GBP yang jelas sebelum scan dibuat.
- Alur backend mengikuti pola server function → `GmbGridService` → `GmbGridRepository` → `GmbGridWorkflow`.
- DataForSEO Maps SERP diproses per grid point. Run menyimpan total/completed/failed/found points, SoLV, average rank, biaya, serta error per titik.
- Hanya satu run aktif per config. Scheduler menjalankan config yang sudah jatuh tempo.
- Schema reliability: D1 `0055_gmb_grid_reliability.sql`, PG `0032_gmb_grid_reliability.sql`.
- Unit/integration coverage ada di `src/server/features/gmb-grid/gmb-grid.test.ts`, `src/server/lib/dataforseo/serp.test.ts`, dan `e2e/gmb-grid.spec.ts`.

### Hosted PayPal, admin, dan GA4 (`8114af9`, `8e2bf1d`, `8481324`)

- Checkout subscription dan top-up dipindah ke service teruji (`paypal-checkout-service.ts`); webhook menyimpan event dan menyinkronkan subscription/credits secara idempotent.
- Admin dapat mengelola runtime settings, pricing, PayPal plan IDs, dan menjalankan live configuration test tanpa membuat charge.
- Platform admin memakai server-side allowlist dan guard yang sama untuk route serta server functions.
- Error `Unable to load analytics data` di Postgres diperbaiki dengan agregasi timestamp yang kompatibel dan error state yang tetap menampilkan detail berguna.
- GA4 property discovery sekarang mencoba Admin API pagination lalu account summaries fallback. Empty state membedakan account tanpa property dari kegagalan API.

### Keyword Research Pro (`b2bd639`)

Route: `/p/$projectId/keyword-research-pro`.

Mode riset:

- Basic: keyword metrics, KGR/allintitle, intent, dan weak-SERP signals.
- Full: semua hasil Basic ditambah bulk backlink competition. User memilih mode ini karena backlink lookup lebih mahal.

Mode billing DataForSEO:

- Standard memakai credential platform dan membebankan raw provider cost +30%.
- BYOK memakai credential request-scoped milik user dan hanya membebankan service fee +10%. Credential tidak disimpan.

Progressive membership:

| Cohort     |   Kapasitas |   Default |
| ---------- | ----------: | --------: |
| Founder 10 |          10 | $19/bulan |
| Early 20   |          20 | $29/bulan |
| Growth 45  |          45 | $39/bulan |
| Scale 75   |          75 | $49/bulan |
| Public     | Tanpa batas | $59/bulan |

Harga cohort terkunci selama subscription tetap aktif. Perubahan harga admin membuat PayPal plan baru untuk pembeli berikutnya; plan member lama tidak diubah.

Referral:

- Organisasi yang direferensikan mendapat 5.000 credits setelah qualification.
- Referrer mendapat 20% nilai pembayaran membership dalam credits, maksimal 12 bulan per referral.
- `paypal_sale_id` unik mencegah komisi ganda saat webhook di-replay.

Komponen utama:

| Area              | File                                                                                  |
| ----------------- | ------------------------------------------------------------------------------------- |
| UI                | `src/client/features/keywords-pro/*`, route `keyword-research-pro.tsx`                |
| Server functions  | `keyword-research-pro.ts`, `keyword-pro-membership.ts`, `admin-keyword-pro.ts`        |
| Services          | `KeywordResearchProService`, `KeywordProMembershipService`, `KeywordProConfigService` |
| Repository/schema | `KeywordProRepository`, dual schema `keyword-research-pro.schema.ts`                  |
| DataForSEO        | `backlinks-bulk.ts`, tambahan di `serp.ts`, `client.ts`, `core.ts`                    |
| Billing/webhook   | `paypal-webhook.ts`, `subscription.ts`, admin pricing/settings                        |
| Migrations        | D1 `0056_keyword_research_pro.sql`, PG `0033_keyword_research_pro.sql`                |

### QA baseline terbaru

- Vitest: 121 files, 1.069 tests pass.
- TypeScript: pass.
- Oxlint: 0 error.
- Vite client + SSR production build: pass.
- Local Playwright smoke untuk KRP: pass tanpa console error. Test tidak menjalankan paid DataForSEO research.
- Production smoke: `/api/health` `200`; KRP dan `/admin` memberi `307` ke sign-in untuk anonymous user; GET PayPal webhook memberi `405` + `Allow: POST`.
- DataForSEO production auth check: `200`.

### Status production yang belum selesai

PayPal source code sudah siap, tetapi checkout production belum aktif. Pada deploy 2026-08-26:

- `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`, `PAYPAL_MODE`, dan `PAYPAL_WEBHOOK_ID` tidak ada di container maupun `app_settings`.
- Belum ada row `plan_config` untuk cohort `krp_*`, dan `PAYPAL_KRP_PRODUCT_ID` belum dibuat.
- Admin harus mengisi credential live, mendaftarkan `https://seotool.im/api/paypal/webhook`, mengaktifkan event subscription + `PAYMENT.CAPTURE.COMPLETED` + `PAYMENT.SALE.COMPLETED`, lalu klik **Set up PayPal plans** dan **Test PayPal configuration**.
- Jangan menyimpan atau menyalin Client Secret ke dokumen/repo/chat.

Postgres migration journal juga tertinggal di `0025`, walaupun schema `0026`–`0033` sudah di-hot-apply/fallback secara bertahap. Pada deploy terakhir `drizzle-kit migrate` exit 1 tanpa detail; script hanya me-replay DDL GMB. KRP `0033` diterapkan manual via `psql` dan keempat tabel diverifikasi. Sebelum migration baru setelah `0033`, rekonsiliasi `drizzle.__drizzle_migrations` dengan schema aktual. Jangan menandai journal sebagai applied tanpa audit tiap migration.

---

## Produksi LIVE (seotool.im): arsitektur dua lapis Caddy (verified 2026-08-26)

**VPS**: `148.230.103.98`, user deploy `seotool` (docker group, tidak punya sudo). Jangan simpan password VPS di repo atau dokumen ini. Domain live melalui Cloudflare.

### Topologi ingress (VERIFIED WORKING 2026-08-26)

```
Cloudflare
  → gateway-caddy :80/:443 (host network, /opt/gateway/Caddyfile)
    → 127.0.0.1:8080 (seotool-caddy, plain HTTP)
      → /srv/marketing (static marketing)
      → open-seo:3001 (SaaS app, Host localhost)
```

- **gateway-caddy** memiliki public 80/443. File aktif `/opt/gateway/Caddyfile` di-bind ke `/etc/caddy/Caddyfile`; admin API dimatikan. Blok `seotool.im:443` memakai `tls internal` dan proxy ke `127.0.0.1:8080`. `www` redirect ke apex.
- **seotool-caddy** berasal dari `gateway-caddy/docker-compose.yml`, bind `127.0.0.1:8080:80`, dan join network `jetdigitalseo_default`. Source routing SeoTool ada di `gateway-caddy/Caddyfile.seotool`.
- **open-seo** dan **postgres** dikelola `docker-compose.hosted.yaml`. App dipublish hanya ke `127.0.0.1:3001`; Postgres hanya ke `127.0.0.1:5432`.
- Marketing files berada di volume `marketing_files:/srv/marketing` dan tetap perlu disalin jika output marketing berubah.

### Gotchas infra VPS

1. Outer `gateway-caddy` wajib memuat domain `seotool.im`. Pada 2026-08-26 file `/opt/gateway/Caddyfile` hanya berisi `api.jetdigitalpro.com`; hasilnya Cloudflare `525`. Fix: tambahkan blok TLS/proxy SeoTool, validasi dengan `caddy validate`, lalu `docker restart gateway-caddy`.
2. `/opt/gateway/Caddyfile` root-owned. User `seotool` tidak punya sudo, tetapi punya Docker access. Buat backup dan gunakan container sementara untuk copy file hanya setelah config tervalidasi. Perubahan outer gateway dapat memengaruhi domain lain.
3. Outer Caddy memakai host network. Backend harus publish port loopback; jangan mencoba menghubungkan outer Caddy ke Docker bridge.
4. Port 8080 hanya untuk loopback. Public traffic tetap memakai 80/443.
5. Inner Caddy wajib mengirim `header_up Host localhost` ke `open-seo:3001`; Vite preview menolak Host lain.
6. Auto-deploy me-recreate inner `seotool-caddy`, tetapi tidak menjamin blok domain outer masih ada. Setelah deploy, selalu cek public HTTPS, bukan hanya `127.0.0.1:3001`.
7. Cloudflare `525` berarti TLS handshake origin gagal. `522` berarti koneksi ke origin/port timeout.
8. Marketing prerender perlu build yang menghasilkan `web/dist/client`; jika marketing content berubah, copy output ke volume `seotool-caddy`.

### Bug /assets/\* collision (FIXED 2026-08-13, tetap relevan)

Marketing static site dan SaaS app sama-sama serve JS/CSS bundles di `/assets/*`. Fix di `Caddyfile.seotool`: `/assets/*` di-exclude dari `@marketingAssets`, ditambah matcher `@marketingAssetFile` (`file { root /srv/marketing }`) — serve dari marketing HANYA jika file ada; otherwise fall through ke proxy SaaS.

### CI/CD auto-deploy

Normal path: push `main` → GitHub Action → SSH → `auto-deploy.sh`. Pada outage GitHub Actions 2026-08-26, deploy dijalankan langsung sebagai `seotool` dengan `bash auto-deploy.sh`.

`auto-deploy.sh` melakukan fetch/reset ke `origin/main`, rebuild/recreate app, menjalankan `scripts/migrate-pg.sh`, lalu me-recreate inner Caddy. Script migration saat ini selalu exit 0 setelah fallback, walaupun `drizzle-kit` gagal. Baca `MIGRATE_EXIT_CODE` dan verifikasi tabel/kolom baru lewat Postgres.

Deploy checklist:

1. Push commit dan pastikan HEAD VPS sama dengan commit target.
2. Jalankan `bash auto-deploy.sh`; tunggu app dan Postgres healthy.
3. Periksa output migration. Jika Drizzle gagal, audit schema sebelum replay SQL atau menyentuh migration journal.
4. Verifikasi `http://127.0.0.1:3001/api/health` dan `http://127.0.0.1:8080/api/health` dengan Host `seotool.im`.
5. Verifikasi `https://seotool.im/api/health` melalui Cloudflare. Cek route fitur, `/admin`, dan contract endpoint seperti PayPal webhook.
6. Periksa log `open-seo`, `seotool-caddy`, dan `gateway-caddy` setelah smoke test.

---

## Deploy 2026-08-19/20 — P2 batch + landing/paywall ke production (LENGKAP, verified)

Deploy ~494 files (P2 features, landing + paywall, marketing content) ke VPS via CI/CD + re-arsitektur ingress.

### Yang dideploy (commit `751d389`)

- Semua P2 features + in-app landing/hard paywall + e2e-helpers + docs (DESIGN.md, GROWTH-PLAN.md).
- **Migrations** (generated via `drizzle-kit generate --custom` — generate biasa butuh TTY, prompt konflik): D1 `drizzle/0048_slim_katie_power.sql` (searchEngine column + serp_volatility_snapshots table) + PG `drizzle-pg/0025_chunky_silver_sable.sql` (sama). Auto-applied oleh docker-entrypoint saat container start.
- **Type fixes (12 error → 0)**: `getQuotaStateSummary` sekarang return `{ planTier, quotas }` (bukan bare array); `BillingUsageEvent.properties` dipersempit ke serializable union + `as BillingUsageEvent[]` assertion di client; `BAD_REQUEST` → `VALIDATION_ERROR` (BAD_REQUEST tidak ada di error-codes.ts).
- **Test fixes**: `customer-status-model.test.ts` (isPaying mengikuti PayPal status ACTIVE, bukan plan tier); `dataforseo/client.test.ts` (`deductCredits` mock wajib return `{ monthlyDeducted, topupDeducted }` — destructuring di subscription.ts); `page-reporters.test.ts` (healthy page fixture `hasStructuredData: true` karena reporter missing-structured-data baru).
- **Marketing rebuild** dengan prerender HTML (55 file index.html) — commit `6995e2f`. WAJIB build tanpa DOCKER_BUILD=1.
- **Infra**: `gateway-caddy/docker-compose.yml` + `Caddyfile.seotool` + `deploy.sh` + `MANUAL-DEPLOY.md` (commits `fb8415f`..`a0b67c4`).

### Test baseline BARU

`pnpm test:ci`: **943-944 pass**, 2 pre-existing failures: (1) `promptExplorer.test.ts` suite gagal import (cloudflare:workers transitive ke d1/client — pre-existing mock infra issue); (2) `dataforseo/client.test.ts` "skips billing in non-hosted mode" flaky saat full-suite (pass saat solo — mock isolation). tsc **0 error**.

### Debug saga ingress (untuk pembelajaran)

Urutan masalah saat re-arsitektur: config seotool hilang dari pesat Caddyfile → 525 → buat seotool-caddy dedicated :4443 → cloud firewall block non-standard ports → 522 → pindah ke 127.0.0.1:8080 behind pesat → Vite Host header 403 → `tls internal` broken under auto_https off → file certs → sed -i inode bind-mount → restart pesat-caddy → **VERIFIED**: `{"status":"ok"}` end-to-end, homepage + /pricing 200.

---

## QA gap analysis (2026-08-13, plan.md)

Audit lengkap di `plan.md` di repo root. **Product mature untuk classic SEO + STRONG di AI/GEO** (brand lookup, SoV, cited sources, prompt explorer, SAM agent, MCP server). Keyword difficulty, search intent, SERP feature tags (incl. AI Overview/PAA), new/lost backlinks, anchor text SUDAH ada — jangan re-flag.

**IMPLEMENTATION STATUS (2026-08-13):**

- **Sprint 1 (P0) DONE + verified**: team invite email (Better Auth `sendInvitationEmail` org hook + `/accept-invitation` route), Content Strategy create forms (cluster + brief), OAuth-only account deletion, Buy-Credits top-up button, alert/report email PostHog visibility.
- **Sprint 2 (P1) DONE + verified**: GDPR data export (`exportAccountData`), welcome email (`sendHostedWelcomeEmail`), dunning banner (`BillingStatusBanner`), legal footer (LegalFooter), in-app notification center (`notifications` table + bell in Sidebar).
- **Sprint 3 (P2 partial) DONE + verified**: P2-3 SoV in rank tracking, P2-5 New/lost backlinks view, P2-11 Keyword trends, P2-2 SERP competitors view, P2-8 Schema validation audit issue.
- **ALL Sprint 1-3 DEPLOYED** (commit `5a0b3e0`): 47 files changed, 13,287 insertions. VPS auto-deploy, health check OK.

**Remaining P2 items — ALL IMPLEMENTED (2026-08-18):**

- ✅ P2-1: Bing support — `searchEngine` column on `rank_tracking_configs` (default "google"), `bing-serp.ts` fetchers, workflow dispatch to Bing/Google, Zod schema `searchEngine` field
- ✅ P2-4: Link intersect — `backlinks/domain_intersection/live` DataForSEO endpoint, `LinkIntersectService` (R2 cache 12h), `LinkIntersectView` (target + 1-3 competitors form + results table), MCP tool `get_link_intersect`
- ✅ P2-6: Anchor distribution — New "Anchors" tab on Backlinks page, `fetchAnchors` DataForSEO fetcher, `AnchorsTable` component, filters/sort/export support
- ✅ P2-7: Sitemap validator — Standalone page, `fetchAndParseSitemap` (XML parse + sitemap index recursion), `validateSitemapUrls` (URL validation, duplicates, lastmod, priorities), R2 cache 1h, MCP tool `validate_sitemap`
- ✅ P2-9: Crawl budget/log analysis — `accessLogParser.ts` (Apache/Nginx auto-detect), `filterBotTraffic` (20+ bot patterns), `analyzeCrawlBudget` (bot types, top URLs, wasted budget), MCP tool `analyze_crawl_budget`
- ✅ P2-10: On-page SEO checker — Standalone page, uses existing `page-analyzer.ts` (zero API cost), `onPageAnalysis.ts` (7 categories: title, meta, headings, images, links, content, technical, each scored A-F), MCP tool `check_onpage_seo`
- ✅ P2-12: Keyword clustering — `clusteringEngine.ts` (Jaccard SERP-overlap, hierarchical agglomerative clustering), `KeywordClusteringService` (R2 cache 24h, max 20 keywords), MCP tool `cluster_keywords`
- ✅ P2-13: Disavow/toxic link flagging — New "Toxic" tab on Backlinks page, `identifyToxicLinks` (spam threshold 70), `generateDisavowFile` (Google format), client-side `.txt` download
- ✅ P2-15: SERP volatility — New table `serp_volatility_snapshots` (dual-dialect), `volatilityCalculation.ts` (normalized std dev 0-100, categories: low/moderate/high/extreme), `SerpVolatilityService` (compute from rank_snapshots), MCP tool `get_serp_volatility`
- ❌ P2-14: PPC integration — Kecualikan (butuh Google Ads API, produk terpisah)

| File                                                                                         | Keterangan                                                                                                                               |
| -------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| **P2-1 Bing Support**                                                                        |                                                                                                                                          |
| `src/server/lib/dataforseo/bing-serp.ts`                                                     | `fetchBingRankCheckSerp`, `postBingRankCheckTasks`, `fetchBingRankCheckTaskResult` (mirror Google)                                       |
| `src/server/lib/dataforseo/serp.ts`                                                          | Export `serpSnapshotItemSchema` (sebelumnya private)                                                                                     |
| `src/server/lib/dataforseo/sections.ts`                                                      | +3 Bing fetcher exports                                                                                                                  |
| `src/server/lib/dataforseo/client.ts`                                                        | +`bingRankCheck`, `bingRankCheckTaskPost` di `serp` namespace                                                                            |
| `src/db/app.schema.ts` + `src/db/pg/app.schema.ts`                                           | +`searchEngine` column on `rankTrackingConfigs` (default "google")                                                                       |
| `src/types/schemas/rank-tracking.ts`                                                         | +`searchEngine` di create/update schemas                                                                                                 |
| `src/server/features/rank-tracking/repositories/RankTrackingRepository.ts`                   | +`searchEngine` di select                                                                                                                |
| `src/server/features/rank-tracking/services/`                                                | Dispatch ke Bing/Google berdasarkan config                                                                                               |
| `src/server/workflows/rankCheckPaths.ts`                                                     | `checkBatchLive` + `postRankCheckTasks` dispatch berdasarkan `searchEngine`                                                              |
| `src/server/workflows/RankCheckWorkflow.ts`                                                  | +`searchEngine` di params                                                                                                                |
| `src/server/features/rank-tracking/services/rankCheckRunGuards.ts`                           | +`searchEngine` di config pick + workflow params                                                                                         |
| **P2-4 Link Intersect**                                                                      |                                                                                                                                          |
| `src/server/lib/dataforseo/backlinks-intersect.ts`                                           | `fetchBacklinksDomainIntersection` via `backlinksApi().domainIntersectionLive()`                                                         |
| `src/server/features/link-intersect/services/linkIntersectTypes.ts`                          | Zod cache/view schemas                                                                                                                   |
| `src/server/features/link-intersect/services/LinkIntersectService.ts`                        | R2-cached 12h (pattern: ContentGapService)                                                                                               |
| `src/serverFunctions/link-intersect.ts`                                                      | `getLinkIntersect` server fn                                                                                                             |
| `src/client/features/link-intersect/LinkIntersectView.tsx`                                   | Form + results table                                                                                                                     |
| `src/client/features/link-intersect/LinkIntersectParts.tsx`                                  | Summary cards                                                                                                                            |
| `src/routes/_project/p/$projectId/link-intersect.tsx`                                        | Route                                                                                                                                    |
| `src/server/mcp/tools/get-link-intersect.ts`                                                 | MCP tool `get_link_intersect`                                                                                                            |
| **P2-6 Anchor Distribution**                                                                 |                                                                                                                                          |
| `src/server/lib/dataforseo/backlinks.ts`                                                     | +`fetchAnchors`, `anchorsItemSchema`, `AnchorsItem` type                                                                                 |
| `src/server/features/backlinks/services/backlinksOverviewSchema.ts`                          | +`anchorRowSchema`, `anchorsPageResultSchema`                                                                                            |
| `src/server/features/backlinks/services/backlinksServiceData.ts`                             | +`profileAnchorsPage`, `mapAnchorsRows`                                                                                                  |
| `src/server/features/backlinks/services/BacklinksService.ts`                                 | +`profileAnchorsPage` method                                                                                                             |
| `src/server/features/backlinks/services/backlinksApiFilters.ts`                              | +`buildAnchorsOrderBy`, `buildAnchorsApiFilters`                                                                                         |
| `src/types/schemas/backlinks.ts`                                                             | +"anchors" tab, sort fields, filters, page request                                                                                       |
| `src/serverFunctions/backlinks.ts`                                                           | +`getBacklinksAnchors` server fn                                                                                                         |
| `src/client/features/backlinks/AnchorsTable.tsx`                                             | New table component                                                                                                                      |
| `src/client/features/backlinks/BacklinksPageSections.tsx`                                    | +anchors tab                                                                                                                             |
| `src/client/features/backlinks/BacklinksPageContent.tsx`                                     | +`anchorsPage` prop                                                                                                                      |
| `src/client/features/backlinks/BacklinksPage.tsx`                                            | +`anchorsQuery` wiring                                                                                                                   |
| `src/client/features/backlinks/useBacklinksPageData.ts`                                      | +anchors query                                                                                                                           |
| `src/client/features/backlinks/backlinksPageTypes.ts`                                        | +`AnchorRow`, `BacklinksAnchorsData`                                                                                                     |
| `src/client/features/backlinks/backlinksFilterTypes.ts`                                      | +anchors filter types                                                                                                                    |
| `src/client/features/backlinks/useBacklinksFilters.ts`                                       | +anchors filter state                                                                                                                    |
| `src/client/features/backlinks/BacklinksFilterPanel.tsx`                                     | +anchors filter panel                                                                                                                    |
| `src/client/features/backlinks/export.ts`                                                    | +anchors export                                                                                                                          |
| `src/client/features/backlinks/export.test.ts`                                               | +`anchors: []` ke semua fixtures                                                                                                         |
| `src/server/lib/dataforseo/index.ts`                                                         | +`AnchorsItem` type export                                                                                                               |
| **P2-7 Sitemap Validator**                                                                   |                                                                                                                                          |
| `src/server/lib/sitemap/sitemapTypes.ts`                                                     | Zod schemas: SitemapUrl, SitemapIssue, ValidationReport                                                                                  |
| `src/server/lib/sitemap/fetchSitemap.ts`                                                     | `fetchAndParseSitemap` (XML parse, sitemap index recursion, max depth 2)                                                                 |
| `src/server/lib/sitemap/validateSitemap.ts`                                                  | `validateSitemapUrls` (URL format, duplicates, lastmod, priorities, sample HEAD)                                                         |
| `src/server/features/sitemap-validation/services/SitemapValidationService.ts`                | R2-cached 1h                                                                                                                             |
| `src/serverFunctions/sitemap-validation.ts`                                                  | `validateSitemapFn` server fn                                                                                                            |
| `src/client/features/sitemap-validation/SitemapValidationView.tsx`                           | Form + validation report                                                                                                                 |
| `src/routes/_project/p/$projectId/sitemap-validator.tsx`                                     | Route                                                                                                                                    |
| `src/server/mcp/tools/validate-sitemap.ts`                                                   | MCP tool `validate_sitemap`                                                                                                              |
| **P2-9 Crawl Budget**                                                                        |                                                                                                                                          |
| `src/server/lib/log-parser/logParserTypes.ts`                                                | Zod schemas: AccessLogEntry, CrawlBudgetReport                                                                                           |
| `src/server/lib/log-parser/accessLogParser.ts`                                               | `parseAccessLogLines` (Apache/Nginx auto-detect), `filterBotTraffic` (20+ bots), `analyzeCrawlBudget`                                    |
| `src/server/features/crawl-budget/services/CrawlBudgetService.ts`                            | `analyzeFromLogs`                                                                                                                        |
| `src/serverFunctions/crawl-budget.ts`                                                        | `analyzeCrawlBudgetFn` server fn                                                                                                         |
| `src/client/features/crawl-budget/CrawlBudgetView.tsx`                                       | Log upload form + results dashboard                                                                                                      |
| `src/routes/_project/p/$projectId/crawl-budget.tsx`                                          | Route                                                                                                                                    |
| `src/server/mcp/tools/analyze-crawl-budget.ts`                                               | MCP tool `analyze_crawl_budget`                                                                                                          |
| **P2-10 On-Page SEO Checker**                                                                |                                                                                                                                          |
| `src/server/features/on-page-checker/services/onPageTypes.ts`                                | Zod: OnPageReport, OnPageCategoryScore, OnPageIssue                                                                                      |
| `src/server/features/on-page-checker/services/onPageAnalysis.ts`                             | `analyzeOnPage` — 7 category scorers (title/meta/headings/images/links/content/technical)                                                |
| `src/server/features/on-page-checker/services/OnPageCheckerService.ts`                       | `checkOnPageSeo` — fetch URL + reuse `page-analyzer.ts`, R2 cache 6h                                                                     |
| `src/serverFunctions/on-page-checker.ts`                                                     | `checkOnPageSeoFn` server fn                                                                                                             |
| `src/client/features/on-page-checker/OnPageCheckerView.tsx`                                  | URL input + score gauge + category cards + issues list                                                                                   |
| `src/routes/_project/p/$projectId/on-page-checker.tsx`                                       | Route                                                                                                                                    |
| `src/server/mcp/tools/check-onpage-seo.ts`                                                   | MCP tool `check_onpage_seo`                                                                                                              |
| **P2-12 Keyword Clustering**                                                                 |                                                                                                                                          |
| `src/server/features/keyword-clustering/services/clusteringEngine.ts`                        | `extractSerpDomains`, `computeSerpOverlap` (Jaccard), `buildSimilarityMatrix`, `clusterKeywords` (agglomerative), `generateClusterLabel` |
| `src/server/features/keyword-clustering/services/clusteringTypes.ts`                         | Zod: Cluster, ClusteringResult                                                                                                           |
| `src/server/features/keyword-clustering/services/KeywordClusteringService.ts`                | `getKeywordClusters` — fetch SERPs, R2 cache 24h, max 20 keywords                                                                        |
| `src/serverFunctions/keyword-clustering.ts`                                                  | `getKeywordClustersFn` server fn                                                                                                         |
| `src/client/features/keyword-clustering/KeywordClusteringView.tsx`                           | Textarea input + cluster cards + similarity bars                                                                                         |
| `src/routes/_project/p/$projectId/keyword-clustering.tsx`                                    | Route                                                                                                                                    |
| `src/server/mcp/tools/cluster-keywords.ts`                                                   | MCP tool `cluster_keywords`                                                                                                              |
| **P2-13 Toxic Links**                                                                        |                                                                                                                                          |
| `src/server/features/backlinks/services/toxicLinks.ts`                                       | `identifyToxicLinks` — spam threshold 70, top toxic domains                                                                              |
| `src/server/features/backlinks/services/generateDisavow.ts`                                  | `generateDisavowFile` — Google disavow format                                                                                            |
| `src/client/features/backlinks/ToxicLinksTable.tsx`                                          | Table + download disavow button                                                                                                          |
| `src/client/features/backlinks/disavowExport.ts`                                             | Client-side `.txt` download                                                                                                              |
| `src/types/schemas/backlinks.ts`                                                             | +"toxic" tab, spam score sort default                                                                                                    |
| `src/client/features/backlinks/BacklinksPageSections.tsx`                                    | +toxic tab                                                                                                                               |
| `src/client/features/backlinks/BacklinksPageContent.tsx`                                     | +`toxicPage` prop                                                                                                                        |
| `src/client/features/backlinks/BacklinksPage.tsx`                                            | +`toxicQuery` wiring                                                                                                                     |
| `src/client/features/backlinks/useBacklinksPageData.ts`                                      | +toxic query (reuses getBacklinksRows with minSpamScore:70)                                                                              |
| `src/client/features/backlinks/export.ts`                                                    | +toxic tab export + filename                                                                                                             |
| **P2-15 SERP Volatility**                                                                    |                                                                                                                                          |
| `src/db/serp-volatility.schema.ts` + `src/db/pg/serp-volatility.schema.ts`                   | Table `serp_volatility_snapshots` dual-dialect (id, projectId, date, volatilityScore, keywordsSampled, avgPositionChange, topMoversJson) |
| `src/db/d1/schema.ts` + `src/db/pg/schema.ts` + `src/db/schema.ts` + `schema-parity.test.ts` | Barrel registration + parity test                                                                                                        |
| `src/server/features/serp-volatility/services/volatilityCalculation.ts`                      | `calculateVolatilityScore` (normalized std dev 0-100), `identifyTopMovers` (top 5), `categorizeVolatility` (low/moderate/high/extreme)   |
| `src/server/features/serp-volatility/repositories/SerpVolatilityRepository.ts`               | `getLatestForProject`, `upsertForProjectDate`, `getForProjectDateRange`                                                                  |
| `src/server/features/serp-volatility/services/SerpVolatilityService.ts`                      | `computeVolatility` (from rank_snapshots), `getVolatilityTrend`, `getLatestVolatility`                                                   |
| `src/serverFunctions/serp-volatility.ts`                                                     | `getSerpVolatility` (GET) + `computeSerpVolatility` (POST)                                                                               |
| `src/client/features/serp-volatility/SerpVolatilityView.tsx`                                 | Score gauge + summary + top movers + trend                                                                                               |
| `src/client/features/serp-volatility/VolatilityChart.tsx`                                    | Table with CSS bar chart                                                                                                                 |
| `src/routes/_project/p/$projectId/serp-volatility.tsx`                                       | Route                                                                                                                                    |
| `src/server/mcp/tools/get-serp-volatility.ts`                                                | MCP tool `get_serp_volatility`                                                                                                           |

**New nav items**: Sitemap Validator, On-Page SEO, Keyword Clustering, Link Intersect (Research group) + Crawl Budget, SERP Volatility (My Site group). **New backlinks tabs**: Anchors, Toxic.

**P3 platform:** manager/viewer roles unassignable via UI (RBAC dead code), no trial period, no invoice PDF, no roll-up reports. **P4 local SEO:** geo-grid, GBP audit, citation, review monitoring. **P5 AI/GEO:** AI Overviews rank tracking, AI-bot log analysis, llms.txt, GEO content recs.

**Pending user action:** Loops.so template IDs belum di-set di VPS. User perlu buat 2 template manual di Loops dashboard: "Team Invitation" (Account Management group) dan "Welcome" (Notifications group). Set `LOOPS_TRANSACTIONAL_TEAM_INVITE_ID` dan `LOOPS_TRANSACTIONAL_WELCOME_ID` di `.env.hosted` lalu restart container.

---

## Dark Command Center Redesign (2026-08-16, LENGKAP)

Marketing site redesign ke dark theme. Near-black canvas (`#0a0b14`), dot-grid background, cyan data-glow (`#00e5ff`), orange CTA (`#ff5600`). Typography: Space Grotesk (display) + Inter (body) + JetBrains Mono (data). CSS-only animations (PageSpeed-safe), `prefers-reduced-motion` guards, `content-visibility: auto` on below-fold sections.

| File                                           | Keterangan                                                                                                              |
| ---------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `web/src/styles/app.css`                       | Dark palette `@theme` tokens, Space Grotesk font, `color-scheme: dark`                                                  |
| `web/src/routes/_marketing/index.tsx`          | Font preload (Space Grotesk wght 500/600/700)                                                                           |
| `web/src/routes/_marketing.tsx`                | Dark glassmorphic nav, dark mobile menu, body bg `#0a0b14`                                                              |
| `web/src/components/landing-page.css`          | Complete rewrite (~800 lines): dot-grid hero, cyan glow, glass cards, staggered animations, reveal classes              |
| `web/src/components/landing-page.tsx`          | Hero with floating live-data cards, `LiveMetrics` section (IntersectionObserver count-up), dark feature cards, CTA band |
| `web/src/routes/_marketing/pricing.tsx`        | Dark pricing cards, cyan gradient border on featured tier, orange CTA buttons                                           |
| `web/src/routes/_marketing/features/index.tsx` | Dark feature cards with cyan hover glow                                                                                 |
| `web/src/components/site-footer.tsx`           | Dark footer with theme-aware text colors                                                                                |
| `web/src/components/newsletter-signup.tsx`     | Dark form inputs, cyan focus ring, orange button                                                                        |
| `web/src/routes/__root.tsx`                    | `data-theme="dark"` for fumadocs components                                                                             |

**Commit**: `d85a798` + `a99ee84` (marketing dist rebuild).

---

## Conversion UX (2026-08-16, LENGKAP)

Hero URL analyzer (instant audit CTA), metric tooltips (explaining SEO terms), pricing toggle (monthly/annual), structured data (JSON-LD for rich snippets). All integrated into Dark Command Center design.

**Commit**: `67715ec`.

---

## Rebrand OpenSEO → SeoTool.im (2026-08-17, LENGKAP)

Semua user-facing + internal code identifiers cleaned. Termasuk: file references (`openseo-fact-sheet.md` → `seotool-fact-sheet.md`), URLs (`app.openseo.so` → `app.seotool.im`), MCP commands (`openseo` → `seotool`), variable names, build artifacts (`.openseo-build-env` → `.seotool-build-env`), docs, release notes, marketing content, Loops source tag.

Hanya infra IDs yang tersisa (DB names, Hyperdrive binding, `OPENSEO_TELEMETRY_DISABLED`, HMAC salts).

**Commit**: `1343430` (27 files, 39 insertions / 39 deletions).

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

| File                                          | Purpose                                          |
| --------------------------------------------- | ------------------------------------------------ |
| `src/server/billing/paypal.ts`                | PayPal REST API client (OAuth2 + typed facade)   |
| `src/server/billing/credits.ts`               | Local credits management (monthly + topup pools) |
| `src/server/billing/paypal-webhook.ts`        | Webhook handler (events → sync)                  |
| `src/server/billing/paypal-webhook-verify.ts` | Webhook signature verification                   |
| `src/serverFunctions/paypal-checkout.ts`      | Checkout server functions                        |
| `src/client/features/billing/use-billing.ts`  | Local React hooks for billing state              |

### Setup Steps

#### 1. PayPal Developer Dashboard

1. Go to https://developer.paypal.com/dashboard/applications
2. Create **Products** (one per base tier):
   - SeoTool Lite ($49/mo)
   - SeoTool Pro ($149/mo)
   - SeoTool Agency ($499/mo)
3. Create **Billing Plans** for each product:
   - Simpan plan ID melalui `/admin` pricing. `lite-plan`, `pro-plan`, dan `agency-plan` hanya fallback constants di `src/shared/plans.ts`.
   - Billing cycle: Monthly
   - Auto-bill outstanding: Yes
   - Payment failure threshold: 3
4. Create **Webhook**:
   - URL production: `https://seotool.im/api/paypal/webhook`
   - Events: `BILLING.SUBSCRIPTION.CREATED`, `BILLING.SUBSCRIPTION.UPDATED`, `BILLING.SUBSCRIPTION.CANCELLED`, `BILLING.SUBSCRIPTION.EXPIRED`, `BILLING.SUBSCRIPTION.ACTIVATED`, `BILLING.SUBSCRIPTION.SUSPENDED`, `PAYMENT.CAPTURE.COMPLETED`, `PAYMENT.SALE.COMPLETED`
   - Save the **Webhook ID**

#### 2. Environment Variables

```bash
# .env.hosted
PAYPAL_CLIENT_ID=your-client-id
PAYPAL_CLIENT_SECRET=your-client-secret
PAYPAL_MODE=sandbox  # or "live" for production
PAYPAL_WEBHOOK_ID=your-webhook-id
```

Untuk hosted production, nilai yang disimpan dari `/admin` masuk ke `app_settings` dan mengoverride env. Secret bersifat write-only di UI. Setelah empat setting tersimpan:

1. Simpan plan ID dan harga base tiers di admin pricing.
2. Klik **Set up PayPal plans** untuk membuat product dan lima progressive plan KRP.
3. Klik **Test PayPal configuration**. Test ini read-only: mengambil semua active plans dan mencocokkan harga tanpa membuat charge.

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

| Tier   | Monthly Credits | Top-up Available |
| ------ | --------------- | ---------------- |
| Free   | 100             | No               |
| Lite   | 5,000           | Yes              |
| Pro    | 25,000          | Yes              |
| Agency | 100,000         | Yes              |

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

| Event                            | Action                                     |
| -------------------------------- | ------------------------------------------ |
| `BILLING.SUBSCRIPTION.CREATED`   | Sync subscription, grant credits           |
| `BILLING.SUBSCRIPTION.UPDATED`   | Sync tier changes, reset quotas if changed |
| `BILLING.SUBSCRIPTION.CANCELLED` | Sync to free tier, reset quotas            |
| `BILLING.SUBSCRIPTION.EXPIRED`   | Sync to free tier                          |
| `BILLING.SUBSCRIPTION.ACTIVATED` | Sync subscription status                   |
| `BILLING.SUBSCRIPTION.SUSPENDED` | Sync to past_due status                    |
| `PAYMENT.CAPTURE.COMPLETED`      | Handle top-up credit purchase              |
| `PAYMENT.SALE.COMPLETED`         | Renewal sync + KRP referral commission     |

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

## In-App Landing Page + Hard Paywall (LENGKAP, end-to-end)

Landing page publik di `/` (DaisyUI, bukan `.itc-*` webfont), pricing publik di `/pricing` (import harga dari `src/shared/plans.ts`), dan hard paywall server+client yang memblokir tools untuk user free-tier.

### Bagian A: Landing + Pricing Publik

| File                                                | Keterangan                                                                                                                                                                                                                 |
| --------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/client/features/marketing/MarketingChrome.tsx` | Navbar (logo, Pricing, Sign in/Dashboard, Get started) + Footer (Product, Resources, Legal links ke seotool.im). `useMarketingSession()` hook.                                                                             |
| `src/client/features/marketing/LandingPage.tsx`     | Full landing: Hero (badge, h1, CTAs, 4 stat cards), FeatureGrid (8 fitur: Keyword Research, Rank Tracking, Site Audit, Backlinks, AI Visibility, Content Intelligence, Reports, SAM+MCP), PricingBlock, CtaBand.           |
| `src/client/features/marketing/PricingSection.tsx`  | Kartu 3 tier (Lite/Pro/Agency), impor `PLAN_PRICES_USD` + `PLAN_TIER_LABELS` + `MONTHLY_CREDIT_GRANTS` dari single source of truth. `signedIn` prop menentukan CTA (`/sign-up?redirect=/subscribe` vs `/subscribe?plan=`). |
| `src/routes/index.tsx`                              | Route `/` publik, render `LandingPage`                                                                                                                                                                                     |
| `src/routes/pricing.tsx`                            | Route `/pricing` publik, render `PricingSection` + FAQ (5 item) + CTA                                                                                                                                                      |
| `src/middleware/unauthenticated-redirect.ts`        | Exempt `pathname === "/"` (exact) + `"/pricing"` prefix                                                                                                                                                                    |
| `src/lib/auth-redirect.ts`                          | `DEFAULT_APP_ENTRY = "/projects"` (default post-login, bukan `/`); `normalizeAuthRedirect` fallback diubah dari `"/"` ke `"/projects"`                                                                                     |
| `src/lib/auth-redirect.test.ts`                     | Test expectations diperbarui: `"/projects"` sebagai default                                                                                                                                                                |
| `src/routes/_auth.tsx`                              | `getCurrentAuthRedirect` → default `/projects` (via auth-redirect)                                                                                                                                                         |
| `src/routes/_authenticated.subscribe.tsx`           | +Link "Back to homepage" (`to="/"`) di bawah subheading                                                                                                                                                                    |

**Hapus**: `src/routes/_app/index.tsx` (auto-redirect proyek lama, bentrok path dengan `routes/index.tsx`).

### Bagian B: Hard Paywall

| File                                                    | Keterangan                                                                                                                                                        |
| ------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/middleware/paid-plan-gate.ts`                      | Function middleware: hosted + !BYPASS_AUTH → allowlist (`ALWAYS_ALLOWED_FILES` + `ALWAYS_ALLOWED_FUNCTIONS`) → `customerHasPaidPlan(orgId)` → `PAYMENT_REQUIRED`. |
| `src/serverFunctions/middleware.ts`                     | `globalServerFunctionMiddleware = [errorHandlingMiddleware, ensureUserMiddleware, paidPlanGateMiddleware]`                                                        |
| `src/client/features/billing/use-paid-plan-guard.ts`    | Client guard: hosted + !E2E + `!isPaid` → navigate `/subscribe?redirect=...`. Mirror `useHostedAuthRouteGuard`.                                                   |
| `src/routes/_app/route.tsx`                             | +`usePaidPlanGuard()` setelah auth gate; spinner saat pending                                                                                                     |
| `src/routes/_app/projects.tsx`                          | +PAYMENT_REQUIRED → /subscribe redirect (port dari \_app/index.tsx)                                                                                               |
| `src/server/features/audit/services/AuditService.ts`    | Fix: `customerHasManagedAccess` → `customerHasPaidPlan` (broken import)                                                                                           |
| `src/server/features/onboarding/OnboardingChatAgent.ts` | Fix: `customerHasManagedAccess` → `customerHasPaidPlan` (broken import)                                                                                           |

### Bagian C: E2E Fix

| File                                      | Keterangan                                                                              |
| ----------------------------------------- | --------------------------------------------------------------------------------------- |
| `e2e/e2e-helpers.ts`                      | Shared `getE2EProjectId(page)`: navigasi `/projects`, extract project ID dari link href |
| `e2e/keyword-research-navigation.spec.ts` | `getProjectId` → `getE2EProjectId`                                                      |
| `e2e/debug-domain.spec.ts`                | Inline redirect → `getE2EProjectId`                                                     |
| `e2e/domain-overview-test-utils.ts`       | Inline redirect → `/projects` + extract link                                            |

- tsc: 12 error (14 P2 lama - 2 fix impor), semua billing/paypal
- unit tests: `auth-redirect.test.ts` 10/10 pass
- E2E: keyword-research 3/3 pass, domain-overview 5/5 pass
- Browser: `/` render landing page (hero, fitur, pricing, CTA), `/pricing` render pricing + FAQ
- Funnel: anonim `/` → Get started → `/sign-up` → onboarding → `/projects` → `/subscribe` → bayar → tools

---

## Admin Quota Bypass, DataForSEO Fixes & Direct OpenAI GPT-4o (2026-08-21) (LENGKAP)

Perbaikan komprehensif untuk pengujian fitur dashboard oleh platform admin, perbaikan mapping kuota DataForSEO, dan integrasi direct OpenAI API.

### Ringkasan Perubahan

| File                                                              | Keterangan                                                                                                                                                                                                                                                                                               |
| ----------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/server/features/billing/services/QuotaService.ts`            | **Platform Admin Quota Bypass**: `getPlanTier()` mengembalikan tier `"agency"` untuk organisasi milik platform admin. Implementasi awal memakai owner-email lookup; sejak `8114af9`, authority berasal dari runtime allowlist, bukan email yang di-hardcode.                                             |
| `src/server/features/billing/repositories/QuotaRepository.ts`     | +`getOwnerEmail(organizationId)` helper untuk membaca email pemilik organisasi (member dengan role `"owner"`).                                                                                                                                                                                           |
| `src/server/lib/dataforseo/client.ts`                             | **DataForSEO Mapping Fix**: `rankedKeywords` dan `relevantPages` di-meter secara eksplisit dengan credit feature `"domain_overview"`. Mencegah keyword suggestions jatuh ke default `"site_audit"` yang kuotanya kecil (1/bulan pada free) sehingga tidak lagi memicu error _"Couldn't fetch keywords"_. |
| `src/shared/billing-credit-features.ts`                           | Default fallback untuk path DataForSEO yang tidak terpetakan diubah dari `"site_audit"` (bulanan) menjadi `"keyword_research"` (harian).                                                                                                                                                                 |
| `src/server/lib/openrouter.ts`                                    | **Direct OpenAI GPT-4o Support**: Mendukung env var `OPENAI_API_KEY`. Jika diatur, AI diarahkan langsung ke `https://api.openai.com/v1` dengan model default `gpt-4o` (tanpa melalui OpenRouter). Opsi `reasoning` dilepas untuk gateway non-OpenRouter agar tidak memicu error API.                     |
| `src/server/features/sam/SamChatAgent.ts`                         | SAM agent membaca `OPENAI_API_KEY` dan memprioritaskan direct OpenAI GPT-4o jika tersedia.                                                                                                                                                                                                               |
| `src/shared/admin-settings.ts`                                    | +Pengaturan `OPENAI_API_KEY` di admin API keys page. Label `DATAFORSEO_API_KEY` diperbaiki menjadi _"Base64 of email:password (from DataForSEO dashboard)"_ untuk menghindari kebingungan format credential.                                                                                             |
| `src/middleware/paid-plan-gate.ts`                                | +`disconnectGa4` dan `disconnectGsc` ditambahkan ke `ALWAYS_ALLOWED_FUNCTIONS` agar lifecycle disconnect tidak diblokir paywall.                                                                                                                                                                         |
| `src/env.d.ts`                                                    | +Type definitions untuk `OPENAI_API_KEY` dan `OPENAI_MODEL`.                                                                                                                                                                                                                                             |
| `src/shared/billing-credit-features.test.ts`                      | Unit regression test untuk pemetaan credit feature DataForSEO.                                                                                                                                                                                                                                           |
| `src/server/features/billing/services/QuotaService.admin.test.ts` | Unit regression test untuk platform-admin agency tier override.                                                                                                                                                                                                                                          |

### Status VPS

- Commit `4e86cba` dideploy dan berjalan sehat di VPS (`148.230.103.98`).
- Database PostgreSQL: subscription organisasi admin telah diupdate ke plan tier `agency` pada deploy tersebut.
- Environment VPS memakai `PLATFORM_ADMIN_USER_IDS`; nilai aktual tidak boleh dicatat di repo atau coldstart.

---

## Dashboard UI/UX QA, Container Standardization & VPS Fixes (2026-08-20/21) (LENGKAP)

Pembersihan UI/UX menyeluruh dan standardisasi layout pada seluruh fitur dashboard agar konsisten dengan Domain Overview / Keyword Research, serta perbaikan deployment container VPS.

### Bagian A: Visual QA & Form Redesign

| File                                                          | Keterangan                                                                                                                                            |
| ------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `e2e/qa-dashboard-audit.spec.ts`                              | Test suite Playwright 25-route QA capturing screenshots (`test-results/qa-screenshots/`). Part 1 (1-13) & Part 2 (14-25).                             |
| `src/client/features/content-intelligence/ContentGapView.tsx` | Redesign form: Search bar horizontal 1 baris ramping (Domain input, Competitors input, Search button), Quick presets chip, empty state card terpusat. |
| `src/client/features/link-intersect/LinkIntersectView.tsx`    | Redesign form: Search bar horizontal 1 baris ramping (Domain input, Competitors input, Search button), Quick sets presets, empty state card terpusat. |
| `src/client/features/serp-volatility/SerpVolatilityView.tsx`  | Penyelarasan internal spacing (`space-y-4`), styling gauge turbulence index, dan action card.                                                         |

### Bagian B: Standarisasi Layout Kontainer Rute (`max-w-7xl mx-auto`)

Sebelumnya, sejumlah rute seperti `link-intersect`, `content-gap`, dan `serp-volatility` me-render langsung ke `Outlet` tanpa wrapper padding dan max-width sehingga meregang tanpa batas (_edge-to-edge_) pada monitor ultra-wide.

Semua rute distandarisasi menggunakan wrapper pola:

```tsx
<div className="px-4 py-4 pb-24 overflow-auto md:px-6 md:py-6 md:pb-8">
  <div className="mx-auto max-w-7xl space-y-4">
    <div>
      <h1 className="text-2xl font-semibold">{Title}</h1>
      <p className="text-sm text-base-content/70">{Description}</p>
    </div>
    <{FeatureView} projectId={projectId} />
  </div>
</div>
```

| File Diperbaiki                                        | Keterangan                                                                                            |
| ------------------------------------------------------ | ----------------------------------------------------------------------------------------------------- |
| `src/routes/_project/p/$projectId/link-intersect.tsx`  | Ditambahkan wrapper standar `px-4 py-4 md:px-6 md:py-6 pb-24 md:pb-8` + `max-w-7xl mx-auto space-y-4` |
| `src/routes/_project/p/$projectId/content-gap.tsx`     | Ditambahkan wrapper standar `px-4 py-4 md:px-6 md:py-6 pb-24 md:pb-8` + `max-w-7xl mx-auto space-y-4` |
| `src/routes/_project/p/$projectId/serp-volatility.tsx` | Ditambahkan wrapper standar `px-4 py-4 md:px-6 md:py-6 pb-24 md:pb-8` + `max-w-7xl mx-auto space-y-4` |

### Bagian C: Perbaikan VPS Production Deploy & Routing Caddy

1. **Root Cause CSS Hilang/Broken di VPS**: Root `Caddyfile` mencocokkan `@marketingAssets path /assets/*` dan menyajikannya dari `/srv/marketing`. Ini mengakibatkan chunk Vite client dan file stylesheet Tailwind/DaisyUI milik aplikasi SaaS (`open-seo:3001`) ter-intercept dan menghasilkan HTTP 404 / broken styling.
2. **Solusi Routing Caddy (`Caddyfile`)**:
   - Mengubah `@marketingAssets` menjadi `@marketingAssetFile` dengan `file { root /srv/marketing }` (hanya serve static marketing jika file benar-benar ada di direktori marketing, sisanya di-proxy ke app).
   - Menambahkan header `header_up Host localhost` pada blok reverse proxy.
3. **Build Caching Issue (`docker-entrypoint.sh`)**:
   - Menghapus mekanisme hashing env yang sebelumnya me-skip `pnpm run build` jika file `.env.hosted` tidak berubah, memastikan setiap kali container di-recreate/start, kode terbaru selalu ter-compile segar.
4. **Deploy Script (`scripts/deploy-vps.sh`)**:
   - Menambahkan flag `--force-recreate` pada pemanggilan Docker Compose.

---

## QA Re-Audit (2026-08-24) — Independent audit + fixes (LENGKAP)

Audit independen setelah sesi QA sebelumnya (2026-08-23) yang menghasilkan verdict "READY WITH RISKS". Karena grader sekaligus yang memperbaiki bug, diperlukan audit baru.

### Temuan & Fix yang Diimplementasikan (commit `bcc552f`)

| #   | Temuan                                                   | Severity          | Status         | File Diubah                                                                             |
| --- | -------------------------------------------------------- | ----------------- | -------------- | --------------------------------------------------------------------------------------- |
| F1  | OG/meta tags tidak render di SSR                         | HIGH (SEO)        | Fix workaround | `web/src/routes/__root.tsx` — default OG tags di root `head()`                          |
| F2  | HTTP tidak redirect ke HTTPS (Location header `http://`) | HIGH (Security)   | Fix app-level  | `src/middleware/unauthenticated-redirect.ts` — force HTTPS origin                       |
| F3  | E2E UUID fixture invalid (RFC 4122)                      | HIGH (QA)         | Fixed          | `src/server/features/projects/services/projects.ts`, `e2e/qa-dashboard-audit.spec.ts`   |
| F4  | Anonymous 404 → redirect ke sign-in                      | MEDIUM (UX)       | Fixed          | `src/middleware/unauthenticated-redirect.ts` — `AUTHENTICATED_ROUTE_PREFIXES` allowlist |
| F5  | Account deletion terjebak onboarding                     | MEDIUM (UX)       | Fixed          | `src/client/features/onboarding/useOnboardingRedirect.ts`, `src/routes/_app/route.tsx`  |
| F6  | 2 oxlint errors di test files                            | MEDIUM (CI)       | Fixed          | `src/middleware/ensureUser.test.ts`, `src/middleware/paid-plan-gate.test.ts`            |
| F7  | 2 HIGH dependency vulns (undici, nanoid)                 | MEDIUM (Security) | Fixed          | `package.json` — pnpm overrides                                                         |
| F10 | Tidak ada security.txt                                   | LOW               | Fixed          | `web/public/.well-known/security.txt` (baru)                                            |

### Detail Fix

**F1 — OG/meta tags**: `buildPageSeo()` di `web/src/lib/seo.ts` dipanggil di child route `head()` tapi TanStack Router SSR `HeadContent` tidak me-render meta tags dari child routes. Workaround: default OG tags (title, description, og:image, twitter:card, canonical) ditambahkan ke root route `head()` di `web/src/routes/__root.tsx`. Per-page OG tags tetap di child routes untuk client-side navigation.

**F2 — HTTPS redirect**: `unauthenticated-redirect.ts:78` menggunakan `url.origin` yang merefleksikan protokol incoming (HTTP di belakang Cloudflare). Fix: `url.origin.replace(/^http:/, "https:")`. Cloudflare "Always Use HTTPS" juga perlu di-enable di dashboard (manual step).

**F3 — E2E UUID**: UUID `00000000-0000-0000-0000-000000000001` bukan RFC 4122 valid (version nibble harus 1-8). Zod v4 `z.string().uuid()` reject. Fix: ubah ke `00000000-0000-4000-8000-000000000001` (valid v4). Root cause domain overview E2E failures (8 specs).

**F4 — Anonymous 404**: Middleware redirect SEMUA non-public path ke sign-in, termasuk path yang tidak ada. Fix: tambah `AUTHENTICATED_ROUTE_PREFIXES` list — hanya redirect path yang dikenal sebagai app routes (`/projects`, `/settings`, `/billing`, `/admin`, `/p/`, `/subscribe`, `/onboarding`, dll). Unknown paths fall through ke 404 handler.

**F5 — Account deletion trap**: `useOnboardingRedirect()` tidak punya exemption untuk `/settings`. User yang belum selesai onboarding di-redirect terus ke `/onboarding` dan tidak bisa hapus akun. Fix: tambah `ONBOARDING_EXEMPT_PATHS = ["/onboarding", "/settings", "/billing"]` + skip spinner di `_app/route.tsx` untuk exempt paths.

**F6 — oxlint errors**: `// oxlint-disable-next-line` tidak work untuk multi-line type assertions. Fix: ganti ke file-level `// oxlint-disable typescript-eslint(no-unsafe-type-assertion)` di kedua test file.

**F7 — Dependency vulns**: `pnpm overrides` untuk `undici >=7.29.0` dan `nanoid >=3.3.18`. 0 HIGH vulnerabilities remaining.

### Temuan yang BELUM di-fix (perlu tindakan manual)

| #        | Temuan                                                | Severity | Alasan Belum Fix                                                                                                                                 |
| -------- | ----------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| F8       | Tidak ada error monitoring (Sentry/PostHog)           | MEDIUM   | Butuh setup Sentry DSN + source maps upload                                                                                                      |
| F9       | Tidak ada incident response runbook                   | LOW      | Butuh dokumentasi manual                                                                                                                         |
| OG-SSR   | OG tags via `head()` child routes tidak render di SSR | HIGH     | Framework limitation — workaround di root route sudah dipasang, tapi per-page OG tags (title/description berbeda per halaman) belum SSR-rendered |
| HTTPS-CF | Cloudflare "Always Use HTTPS" belum di-enable         | HIGH     | Manual step di Cloudflare dashboard                                                                                                              |

### Status CI/CD

| Check                           | Status                                                                          |
| ------------------------------- | ------------------------------------------------------------------------------- |
| `pnpm run ci:check`             | ✅ GREEN (prettier + knip + tsc + oxlint all pass)                              |
| `pnpm run test:ci`              | ✅ 994/994 pass                                                                 |
| `pnpm audit --audit-level=high` | ✅ 0 HIGH vulnerabilities                                                       |
| E2E (`npx playwright test`)     | ⚠️ 8/16 pass (domain-overview-filters masih gagal — UUID fix perlu deploy dulu) |
| Deploy VPS                      | ✅ `bcc552f` deployed via GitHub Actions                                        |

### Baseline pada audit 2026-08-24

Saat commit `bcc552f`, `pnpm test:ci` menghasilkan **994 pass**, 0 fail dan `pnpm ci:check` GREEN. Baseline terbaru setelah Keyword Research Pro ada di bagian update 2026-08-24–26: **1.069 tests pass**.

---

## Quality gate yang wajib dijalankan

```bash
# Type check
pnpm exec tsc --noEmit
# Harus: 0 error

# Tests
pnpm test:ci
# Baseline b2bd639: 121 files, 1.069 pass, 0 fail

# CI pipeline (prettier + knip + tsc + oxlint)
pnpm run ci:check
# Harus: GREEN (0 errors)

# Lint (file baru/berubah)
pnpm exec oxlint <files> --type-aware

# Format
pnpm exec prettier --write "src/path/to/file.ts"

# Dependency audit
pnpm audit --audit-level=high
# Harus: 0 HIGH vulnerabilities

# Migrations (jika schema berubah)
# drizzle-kit generate biasa BUTUH interactive TTY (prompt konflik kolom) —
# jika gagal di non-TTY shell, pakai: npx drizzle-kit generate --config <config> --custom
# lalu tulis SQL manual + snapshot/journal otomatis dibuat drizzle-kit
npx drizzle-kit generate --config drizzle.config.ts       # D1
npx drizzle-kit generate --config drizzle-pg.config.ts    # PG

# Route regen (jika route baru ditambah)
# Jalankan `pnpm exec vite --port 7331` sebentar, lalu Ctrl+C

# E2E tests
npx playwright test
# Harus: semua spec yang terpilih pass. Jangan memakai angka 16 sebagai
# baseline karena suite sudah bertambah (GMB Grid, admin billing, KRP smoke).
```

---

## Roadmap: Fase berikutnya

| Fase                  | Fitur                                                         | Depends On                            | Catatan                                                                                                                                                                                                                                                                |
| --------------------- | ------------------------------------------------------------- | ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 3a                    | **Content Intelligence — Content-Quality Scoring** ✅         | `audit_pages`                         | DONE. Skor deterministik 0-100 per halaman dari sinyal crawl. Tabel `content_scores`.                                                                                                                                                                                  |
| 3b                    | **Content Intelligence — Content Gap (Entity/Topic Gap)** ✅  | DataForSEO Labs `domain_intersection` | DONE. Domain-level keyword gap vs 1–3 kompetitor, di-cluster jadi topics. R2-cached (no migration). Credit feature `content_intelligence`.                                                                                                                             |
| 3c                    | **Content Intelligence — Entity Extraction (Topical/LLM)** ✅ | OpenRouter (`generateText`)           | DONE. Per-page entity/topic extraction via LLM. Tabel `page_entities`. Best-effort workflow phase. Graceful skip tanpa OPENROUTER_API_KEY.                                                                                                                             |
| **SaaS**              | **Transformasi Hosted-Only + Tiered Billing** ✅              | —                                     | DONE (7 fase). Hosted-only auth, 4-tier plan (Free/Lite/Pro/Agency), per-feature quotas, PayPal webhook sync, VPS deploy config.                                                                                                                                       |
| 4                     | **Content Strategy** ✅                                       | Fase 3                                | DONE (2 slice). Topic clusters + content briefs (Slice A, CRUD). Programmatic AI content briefs + internal linking (Slice B, OpenRouter).                                                                                                                              |
| 5                     | **Alerts** ✅                                                 | Rank/Audit data                       | DONE (Slice A). `alert_rules` + `alertEvaluator` (rank_drop + audit_critical) + `AlertWorkflow` cron dispatch + Loops email. GSC/GA4 alerts deferred.                                                                                                                  |
| 6                     | **Semi-gap** ✅ (Slice A)                                     | —                                     | DONE (Slice A). SERP snapshot persistence — full top-20 SERP composition persisted per rank check, zero extra API cost. Competitor table + tracked domain highlight. Domain first-class entity (Slice B) + Local SEO persistence (Slice C) deferred.                   |
| 7                     | **PayPal Customer Portal** ✅                                 | PayPal SDK                            | DONE. `getCustomerPortalUrl` server fn + "Manage Subscription" button di billing page. Cancellation via PayPal portal → webhook sync.                                                                                                                                  |
| 8                     | **Quota Analytics Dashboard** ✅                              | QuotaService                          | DONE. Admin dashboard: plan distribution, MRR estimate, quota usage summary, recent orgs. `requirePlatformAdmin` middleware (env-var allowlist). Route `/admin`.                                                                                                       |
| Local SEO             | **Local Map Rank Tracker rebuild** ✅                         | DataForSEO Maps SERP                  | DONE (`6206027`). GBP profile selection, persisted geo-grid run/snapshots, scheduler, workflow, kuota, reliability indexes, dan test coverage. Deployed.                                                                                                               |
| Admin                 | **Hosted PayPal + analytics fixes** ✅                        | PayPal/Postgres                       | DONE (`8114af9`, `8e2bf1d`). Checkout/top-up/webhook services, admin controls, dan analytics aggregation Postgres diperbaiki. Source code deployed; PayPal credential production masih belum diisi.                                                                    |
| GA4                   | **Property discovery fix** ✅                                 | Google Analytics Admin API            | DONE (`8481324`). Pagination + account summaries fallback + empty/error states. Deployed; authenticated production flow belum di-smoke-test pada deploy KRP.                                                                                                           |
| KRP                   | **Keyword Research Pro merged** ✅                            | DataForSEO + PayPal                   | DONE (`fc6e3b7`, hotfix `05225e2` + `98b2383`). Pro Analysis menerima All Access dan legacy paid yang aktif; KGR, allintitle, weak SERP, optional backlink competition, Standard/BYOK billing. Checkout menunggu PayPal setup.                                         |
| QA                    | **QA Sprint 1-3** ✅                                          | All features                          | DONE (commit `5a0b3e0`). 15 features, 47 files. P0 fixes, P1 compliance, P2 partial. Deployed to production.                                                                                                                                                           |
| Billing               | **PayPal Migration** ✅                                       | Autumn/Stripe                         | Source code DONE (`0510bbd`, diperkuat `8114af9`). Production belum operasional sampai `PAYPAL_*`, webhook, base plan, dan KRP cohort plans dikonfigurasi dari `/admin`.                                                                                               |
| Marketing             | **Dark Command Center** ✅                                    | —                                     | DONE (commits `d85a798`, `a99ee84`). Dark theme redesign + conversion UX (hero analyzer, tooltips, pricing toggle, structured data). CSS-only animations.                                                                                                              |
| Cleanup               | **Rebrand OpenSEO → SeoTool.im** ✅                           | —                                     | DONE (commit `1343430`). All user-facing identifiers cleaned. Only infra IDs remain.                                                                                                                                                                                   |
| **P2**                | **P2 Features Batch (9 fitur)** ✅                            | All features                          | DONE (2026-08-18). P2-1 Bing support, P2-4 Link intersect, P2-6 Anchor distribution, P2-7 Sitemap validator, P2-9 Crawl budget, P2-10 On-page checker, P2-12 Keyword clustering, P2-13 Toxic links, P2-15 SERP volatility. ~60 files. 8 MCP tools. P2-14 PPC excluded. |
| **Landing + Paywall** | **In-App Landing Page + Hard Paywall** ✅                     | —                                     | DONE (2026-08-19). Public landing at `/` (DaisyUI), pricing at `/pricing` (import from plans.ts), hard paywall server+client. E2E bypass preserved. Funnel: signup → onboarding → /projects → /subscribe. Fixed broken `customerHasManagedAccess` imports.             |
| **Deploy**            | **Production Deploy + Caddy re-architecture** ✅              | —                                     | Current verified topology: outer `gateway-caddy` → `127.0.0.1:8080` inner `seotool-caddy` → app. Commit `98b2383` live; Cloudflare health `200`; Postgres journal/schema reconciled through `0036`.                                                                    |
| **UI/UX QA**          | **Dashboard UI/UX Audit & Layout Standardization** ✅         | All features                          | DONE (2026-08-20/21). Full 25-route Playwright visual audit, single-line search bar on Content Gap & Link Intersect, standardized `max-w-7xl mx-auto space-y-4` layout container across all routes.                                                                    |
| **VPS Assets Fix**    | **VPS Caddy Asset Routing & Fresh Startup Build** ✅          | —                                     | DONE (2026-08-21, commit `f969bb3`). Fixed `@marketingAssetFile` in Caddyfile to prevent CSS/JS 404s, fixed `docker-entrypoint.sh` for guaranteed fresh build on boot. Verified live at `https://seotool.im`.                                                          |
| **QA Re-Audit**       | **Independent QA Re-Audit + 8 Fixes** ✅                      | All features                          | DONE (2026-08-24, commit `bcc552f`). Historical baseline 994 tests. Baseline setelah KRP: 1.069 tests, typecheck/lint/build pass, local KRP smoke pass.                                                                                                                |

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
- `PAYPAL_ALL_ACCESS_PRODUCT_ID`: runtime setting di `app_settings`, dibuat otomatis oleh admin saat setup All Access plans; bukan secret env wajib. `PAYPAL_KRP_PRODUCT_ID` adalah legacy.
- `OPENPAGERANK_API_KEY` — Basic Backlinks aggregate snapshot; editable sebagai secret di Admin → API Keys
- `OPENROUTER_API_KEY` — AI agent (SAM, onboarding chat, entity extraction)
- `TURNSTILE_SECRET_KEY` / `TURNSTILE_SITE_KEY` — signup captcha
- `POSTGRES_PASSWORD` — DB password (Docker Compose VPS deploy)
- `PLATFORM_ADMIN_USER_IDS` — comma-separated user IDs untuk admin dashboard access (`/admin`)

**Deploy VPS**: Normalnya push `main` → GitHub Action → `auto-deploy.sh`. Outer config aktif ada di `/opt/gateway/Caddyfile` dan perlu `docker restart gateway-caddy` setelah perubahan. Inner routing ada di `gateway-caddy/Caddyfile.seotool`; marketing files berada di volume `seotool-caddy`. Selalu cek migration output, public HTTPS melalui Cloudflare, dan log ketiga container. Bagian "Produksi LIVE" di atas adalah source of truth terbaru; `gateway-caddy/MANUAL-DEPLOY.md` masih memuat langkah lama dan harus dibaca sebagai referensi historis.
