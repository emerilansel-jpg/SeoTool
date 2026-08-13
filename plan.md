# QA Audit & Gap Analysis — SeoTool.im

> Dibuat 2026-08-13. Hasil audit menyeluruh atas SaaS SeoTool.im (dahulu OpenSEO):
> inventaris fitur, temuan bug, dan daftar fitur yang missing vs standar industri SEO SaaS 2026.
> Dipakai sebagai dasar roadmap pengembangan.

---

## 1. Ringkasan Eksekutif

SeoTool.im adalah SEO SaaS yang **sudah matang** untuk kategori klasik. Arsitekturnya solid
(Cloudflare Workers + TanStack Start + Drizzle + Better Auth + Autumn/Stripe), dengan engine data
DataForSEO yang lengkap dan integrasi AI/GEO yang justru **lebih maju dari rata-rata kompetitor**.

**Skor per kategori (Have / Partial / Missing):**

| Kategori | Status | Catatan |
|---|---|---|
| Keyword Research | ✅ Lengkap | Volume, difficulty, intent, ideas, suggestions, saved lists, tags, export Sheets |
| Rank Tracking | 🟡 Kuat, ada gap | Daily, scheduled, lokasi, device, SERP snapshot + feature tags. **Tidak ada competitor tracking, SoV, Bing** |
| Site Audit | 🟡 Kuat, ada gap | Crawler + 26 issue + Lighthouse mobile/desktop + content scoring. **Tidak ada schema validation, sitemap validator, log analysis** |
| Backlinks | 🟡 Kuat, ada gap | Summary, rows, referring domains, new/lost, anchor. **Tidak ada link intersect, disavow, toxic flagging** |
| Content Tools | 🟡 Sebagian | Content scoring + entity extraction + content gap + AI briefs. **Flow buat cluster/brief masih stub** |
| AI / GEO (LLM) | ✅ Unggul | Brand lookup, share-of-voice, cited sources, prompt explorer, AI agent (SAM), MCP server |
| Local SEO | 🟡 Sebagian | Maps + Local Finder SERP. **Tidak ada geo-grid, GBP audit, citation, review** |
| Reporting | 🟡 Kuat | White-label, scheduled, email delivery. **Tidak ada widget builder, share link, multi-project roll-up** |
| Platform/SaaS | 🟡 Ada bug serius | Billing, auth, orgs, quotas. **Email undangan tim tidak terkirim, RBAC manager/viewer tidak bisa di-assign, top-up kredit tidak bisa dibeli** |

**Kesimpulan:** Produk tidak "kurang fitur SEO dasar". Prioritas tertinggi adalah **memperbaiki fitur
yang sudah ada tapi rusak** (P0), menutup **gap kepatuhan & kepercayaan** (P1), lalu mengisi
**fitur kompetitif yang sering diminta agency** (P2).

---

## 2. Inventaris Fitur Saat Ini (apa yang SUDAH berfungsi)

Diverifikasi via route files + backend services + DB schema.

**Core data engine:** DataForSEO penuh (Labs, SERP, Backlinks, Business/Local, Google Ads,
Lighthouse, AI Optimization), OpenRouter (LLM), GSC + GA4 (OAuth), Ahrefs DR (free keyless).

**Fitur SaaS (semua real, bukan stub):**
- Keyword Research (difficulty, intent, ideas, suggestions, related, SERP overview)
- Saved Keywords (lists, tags, bulk, export Google Sheets)
- Rank Tracking (domain list, config, manual + scheduled check, history, matrix, SERP feature tags termasuk AI Overview & PAA, snapshot viewer)
- Domain Overview (rank overview, ranked keywords, relevant pages, keyword suggestions, paginated pages)
- Backlinks (summary, rows, referring domains, top pages, history, new/lost counts, anchor text)
- Site Audit (crawl discover, 26 jenis issue, Lighthouse mobile+desktop, content scoring per page, entity extraction)
- Content Intelligence (scores, entities, content gap / domain intersection)
- Content Strategy (topic clusters, AI briefs, brief detail editor)
- AI Search / GEO (brand lookup, share of voice, cited sources, prompt explorer)
- Reports (white-label, scheduled weekly/monthly, sections rank/audit/gsc/ga4/backlinks, email delivery, immutable snapshots)
- Alerts (rank_drop, audit_critical, daily/weekly email)
- SAM AI Agent (Durable Object, full MCP toolset, project memory, plan-gated)
- MCP Server (~30 tools, OAuth, untuk Claude/ChatGPT/Cursor)
- Onboarding (wizard + AI chat agent)
- Billing (Autumn/Stripe, 4 tier Free/Lite/Pro/Agency, 11 quota feature, usage credits, Stripe portal)
- Auth (Better Auth, Google OAuth, 2FA, password reset, email verify, Turnstile, disposable-email block)
- Teams/Orgs (roles owner/admin/manager/member/viewer, invitations)

---

## 3. P0 — Bug Fitur yang Ada tapi RUSAK / Tidak Selesai

Ini prioritas tertinggi: fitur sudah "ada" di UI tapi tidak berfungsi sebagaimana mestinya.

### P0-1. Email undangan tim tidak pernah dikirim ⚠️ BROKEN
- **Lokasi:** `src/client/features/settings/TeamSection.tsx` + `auth-config.ts`
- **Masalah:** Form invite memanggil `authClient.organization.inviteMember` yang membuat baris
  `invitation` di DB, tapi plugin organization tidak punya `sendInvitationEmail` hook. Orang yang
  diundang **tidak menerima email apa pun**. Harus dikasih link accept manual.
- **Dampak:** Fitur inti "tim" rusak untuk semua user.
- **Fix:** Tambah hook `sendInvitationEmail` di Better Auth org config yang kirim email via Loops
  berisi invitation accept URL. (~halaman hari)

### P0-2. Flow pembuatan Content Strategy masih stub ("Coming soon")
- **Lokasi:** `src/client/features/content-strategy/StrategyPageView.tsx:79,114`
- **Masalah:** Tombol "Add brief to cluster" memunculkan `alert(... Coming soon)`, dan modal
  "New Cluster" hanya menampilkan teks "Cluster forms are coming in the next iteraton." tanpa form.
  Membaca cluster/brief yang sudah jadi berfungsi, tapi **membuat baru tidak bisa**.
- **Dampak:** Fitur Content Strategy terlihat setengah jadi. User tidak bisa membuat cluster sendiri.
- **Fix:** Implement form pembuatan cluster (seed keyword/competitor → generate) dan attach-brief.
  Backend brief generation sudah ada (`briefGeneration.ts`), tinggal wire UI.

### P0-3. User OAuth-only tidak bisa hapus akun sendiri
- **Lokasi:** `src/serverFunctions/account.ts` (`deleteAccount` butuh `password: min(1)`)
- **Masalah:** User yang daftar via Google (tidak punya password) tidak bisa melewati gerbang
  password pada account deletion. Jadi **tidak ada jalur self-serve hapus akun** untuk mereka.
- **Dampak:** Pelanggaran hak penghapusan (right to erasure), terutama untuk user EU.
- **Fix:** Izinkan konfirmasi via re-auth sesi / verifikasi email ketika password tidak ada.

### P0-4. Pembelian top-up kredit tidak bisa diakses dari UI
- **Lokasi:** `AUTUMN_SEO_DATA_TOP_UP_PLAN_ID = "credit-top-up"` di `src/shared/billing.ts` (ada),
  tapi **tidak dipakai** di `subscribe.tsx` / `billing.tsx`.
- **Masalah:** Saldo top-up ditampilkan di billing UI (balance feature ID dipakai untuk tampilan),
  tapi tidak ada tombol untuk **membeli** top-up. User yang kehabisan kredit tidak bisa self-serve
  beli lagi, padahal rencana harganya sudah didefinisikan.
- **Dampak:** Hilangnya potensi revenue + frustrasi user yang terkunci kuota.
- **Fix:** Tambah tombol "Buy credits" → `customerQuery.attach({ planId: "credit-top-up" })` di billing page.

### P0-5. Email alert & report gagal secara diam-diam
- **Lokasi:** `src/server/email/alert-notification.ts`, `report-delivery.ts`
- **Masalah:** `sendLoopsEmail` hanya `console.error` saat non-OK, tidak throw. Template salah /
  Loops down → email drop tanpa visibilitas, dan report/alarm tetap dianggap sukses.
- **Fix:** Log ke PostHog/telemetry + tandai delivery record sebagai failed, bukan swallow error.

---

## 4. P1 — Gap Kepatuhan, Trust & Komunikasi

### P1-1. Tidak ada endpoint export data akun (GDPR / data portability)
- **Masalah:** Grep `downloadMyData`/`exportAccount` kosong. Export yang ada hanya keyword/saved-keyword
  (fitur produk), **bukan** "unduh semua data akun saya".
- **Dampak:** Kepatuhan GDPR (hak portabilitas) untuk user EU.
- **Fix:** Server function export semua data user (projects, keywords, reports, dll) ke JSON/ZIP.

### P1-2. Tidak ada email billing transaksional
- **Yang hilang:** email welcome/getting-started setelah signup, struk/invoice, konfirmasi upgrade,
  konfirmasi pembatalan, dan **dunning** (peringatan kartu gagal/expired).
- **Fix:** Tambah event email di Loops saat webhook Autumn (`billing.updated`, `subscription.canceled`)
  trigger, plus welcome email pasca-signup.

### P1-3. Tidak ada handling dunning / gagal bayar in-app
- **Lokasi:** `customer-status-model.ts:82` hanya sebut `past_due` di komentar.
- **Masalah:** `past_due`/`invoice.payment_failed` tidak ada webhook branch, tidak ada grace period,
  tidak ada banner UI. Bergantung 100% pada Stripe/Autumn.
- **Fix:** Handle `subscription.past_due` di webhook + banner "perbarui kartu" di app.

### P1-4. Tidak ada in-app notification center / bell
- **Masalah:** Alert hanya via email. Tidak ada inbox notifikasi in-app (perubahan rank, audit selesai,
  laporan siap). Grep `NotificationCenter` kosong.
- **Fix:** Tambah tabel notifikasi + komponen bell di AppShell.

### P1-5. Link legal tidak lengkap di dalam app
- **Masalah:** Hanya Terms + Privacy di halaman signup. DPA, Cookie Policy, Refund Policy ada di
  `web/content/legal/` tapi **tidak ditautkan** di dalam app (settings, footer).
- **Fix:** Footer legal di settings/app + link DPA/refund/cookie.

---

## 5. P2 — Gap Fitur SEO Kompetitif (vs Ahrefs / Semrush / SE Ranking)

### P2-1. Hanya support mesin pencari Google
- **Masalah:** Rank tracking & keyword hanya Google. Tidak ada Bing, Yahoo, Yandex.
- **Dampak:** Pasar yang butuh pelacakan Bing (USA B2B, beberapa region) tidak terlayani.
- **Catatan:** DataForSEO mendukung Bing, jadi ini murni pekerjaan config + UI.

### P2-2. Tidak ada Rank Tracking kompetitor (side-by-side)
- **Masalah:** Grep `competitor` di rank-tracking kosong. Tidak bisa tambah domain kompetitor untuk
  dilacak berdampingan di keyword yang sama.
- **Dampak:** Ini salah satu fitur rank tracking yang paling sering diminta agency.
- **Fix:** Tambah kolom competitor domains di rank config + tracking per kompetitor.

### P2-3. Tidak ada Share of Voice / visibility score di rank tracking
- **Masalah:** SoV hanya ada di modul AI (untuk LLM). Rank tracking klasik tidak punya skor agregat
  visibility.
- **Fix:** Hitung SoV dari posisi terlacak (cpc/volume-weighted).

### P2-4. Tidak ada Backlink Link Intersect / gap
- **Masalah:** Grep `intersect` di backlinks kosong. Tidak bisa lihat "situs yang link ke kompetitor tapi tidak ke saya".
- **Fix:** Pakai DataForSEO `backlinks_domain_intersection` (live) atau bandingkan referring domains.

### P2-5. Tidak ada tampilan dedicated "New & Lost backlinks" timeline
- **Status:** Data SUDAH ada (`newBacklinks`/`lostBacklinks`/`firstSeen`/`isLost` di baris).
  Tidak ada view grafik/historis new vs lost.
- **Fix:** Tambah tab/chart new & lost over time (data sudah ada, tinggal UI + query historis).

### P2-6. Tidak ada report distribusi anchor text
- **Status:** Data anchor ada per baris. Tidak ada agregasi distribusi anchor text.
- **Fix:** Tambah aggregate anchor distribution view.

### P2-7. Tidak ada validator/generator/submitter sitemap
- **Status:** Sitemap hanya **dikonsumsi** untuk crawl discovery, bukan divalidasi/dibuat/dikirim.
- **Fix:** Sitemap validator (cek error, lastmod, orphan URL) + saran submit ke GSC.

### P2-8. Tidak ada validasi structured data / schema sebagai audit issue
- **Status:** Structured data diekstrak di page-analyzer, tapi **tidak ada** issue detector untuk
  schema invalid/missing. Katalog `audit-issues.ts` (26 jenis) tidak punya tipe schema.
- **Fix:** Tambah reporter `missing-schema` / `invalid-schema` / saran JSON-LD per tipe halaman.

### P2-9. Tidak ada analisis crawl budget / log file
- **Masalah:** Tidak ada ingestion log server / analisis perilaku bot.
- **Catatan:** Ini fitur enterprise (Botify/Conductor). Bisa jadi tier Agency differentiator.

### P2-10. Tidak ada On-Page SEO Checker (rekomendasi per-URL prioritas)
- **Masalah:** Audit memberi daftar issue, tapi tidak ada "ide perbaikan per halaman berurutan
  berdasarkan estimasi dampak traffic".
- **Fix:** Gabungkan audit issue + data GSC (page value) → antrian rekomendasi prioritas.

### P2-11. Tidak ada keyword trends / seasonality (kurva 12 bulan)
- **Fix:** DataForSEO Labs memberi 12-month interest. Tampilkan kurva.

### P2-12. Tidak ada keyword clustering otomatis (group by SERP overlap)
- **Status:** Topic clusters ada di Content Strategy, tapi itu manual/AI-generated, bukan auto-cluster
  by SERP overlap untuk keyword research.
- **Fix:** Pakai `keyword_clusters` DataForSEO atau SERP-overlap grouping.

### P2-13. Tidak ada disavow file generator & toxic link flagging
- **Fix:** Flag spam score per backlink + ekspor file disavow Google.

### P2-14. Tidak ada PPC competitor insights (paid keywords)
- **Catatan:** Kompetitor seperti SpyFu fokus di sini. Opsional untuk positioning organik murni.

### P2-15. Tidak ada SERP volatility / historical SERP viewer
- **Status:** SERP snapshot di-capture saat rank check, tapi tidak ada skor volatilitas atau viewer historis lintas-tanggal.

---

## 6. P3 — Gap Platform / SaaS

| ID | Gap | Catatan |
|---|---|---|
| P3-1 | Role `manager` & `viewer` tidak bisa di-assign via UI | `TeamSection` hanya tampilkan member/admin/owner. Tangga RBAC di `rbac.ts` jadi dead code. |
| P3-2 | Tidak ada trial period / free trial | `trial` tidak ditemukan di plans/billing. Hilangkan friksi upgrade. |
| P3-3 | Tidak ada invoice/PDF in-app | Hanya lewat Stripe portal. |
| P3-4 | Tidak ada coupon / promo code surface | Didelegasikan ke Stripe tanpa UI. |
| P3-5 | Tidak ada multi-project aggregation roll-up report | Report per-project, tidak ada ringkasan lintas project (penting Agency). |
| P3-6 | Tidak ada annotations di grafik | Tidak bisa tandai event (launch/algo update) di timeline. |
| P3-7 | Tidak ada integrasi Looker Studio / WordPress / Slack / Zapier | Hanya GSC/GA4 + MCP. |
| P3-8 | Tidak ada embeddable lead-gen audit widget | Kompetitor (SE Ranking/SEOptimer) pakai ini untuk akuisisi lead. |
| P3-9 | Tidak ada SSO/SAML (enterprise) | Opsional, untuk segmen enterprise. |
| P3-10 | Tidak ada audit log / activity history | Pelacakan aksi user untuk kepatuhan. |
| P3-11 | Tidak ada multi-language UI localization | UI English only. |
| P3-12 | Gauge quota tampil `used:0` di summary | Verifikasi billing UI benar-benar hitung live count, atau bar usage menyesatkan. |

---

## 7. P4 — Gap Local SEO

Status saat ini: hanya Local SERP (Maps + Local Finder) via DataForSEO. Tidak ada suite local lengkap.

| ID | Gap |
|---|---|
| P4-1 | Geo-grid heatmap ranking (grid kota/region) |
| P4-2 | Google Business Profile audit (kelengkapan, post, review sync) |
| P4-3 | Citation / listing management (NAP consistency) |
| P4-4 | Review monitoring & response aggregate |
| P4-5 | Multi-location management |
| P4-6 | Local competitor research |

---

## 8. P5 — Gap AI / GEO (produk sudah unggul, ini sisa pengaya)

Catatan: modul AI Search (brand lookup, SoV LLM, cited sources, prompt explorer) + SAM agent + MCP
sudah **menempatkan SeoTool di atas mayoritas kompetitor**. Sisa gap:

| ID | Gap |
|---|---|
| P5-1 | Google AI Overviews / AI Mode **rank tracking** spesifik (berbeda dari LLM mentions) |
| P5-2 | AI-bot crawl analysis (GPTBot / OAI-SearchBot / PerplexityBot dari log) |
| P5-3 | Generator & manager llms.txt (agent-readiness) |
| P5-4 | GEO content optimization recommendations (struktur jawaban, entity coverage untuk citation) |
| P5-5 | Brand sentiment & description audit (bagaimana LLM mendeskripsikan brand) |

---

## 9. Roadmap Prioritas + Estimasi Effort

Estimasi relatif (S = ≤1 hari, M = 2-4 hari, L = 1-2 minggu, XL = >2 minggu).

### Sprint 1 — Stabilisasi (perbaiki yang rusak) — P0
| Item | Effort | Alasan |
|---|---|---|
| P0-1 Email undangan tim | M | Fitur inti rusak |
| P0-2 Form Content Strategy (cluster + attach brief) | M | Fitur terlihat setengah jadi |
| P0-3 Account deletion untuk OAuth user | S | Kepatuhan + trust |
| P0-4 Tombol beli top-up kredit | S | Revenue hilang |
| P0-5 Error handling email alert/report | S | Silent failure |

### Sprint 2 — Kepatuhan & Trust — P1
| Item | Effort | Alasan |
|---|---|---|
| P1-1 Endpoint export data akun (GDPR) | M | Kepatuhan EU |
| P1-2 Email billing transaksional + welcome | M | Profesionalisme |
| P1-3 Dunning / gagal bayar in-app | M | Cegah churn |
| P1-4 In-app notification center | L | Retensi |
| P1-5 Footer legal lengkap | S | Trust |

### Sprint 3 — Fitur kompetitif "quick win" — P2 (prioritas diminta agency)
| Item | Effort | Catatan |
|---|---|---|
| P2-1 Dukungan Bing | M | DataForSEO sudah dukung |
| P2-2 Competitor rank tracking | L | Paling sering diminta |
| P2-3 Share of Voice rank tracking | M | Data sudah ada |
| P2-5 New & lost backlinks view | M | Data sudah ada, tinggal UI |
| P2-7 Sitemap validator | M | |
| P2-8 Schema validation audit issue | M | Ekstraksi sudah ada |

### Sprint 4+ — Pengaya & differentiator
P2 sisa (link intersect, on-page checker, keyword clustering/trends, disavow), P3 (RBAC roles, trial,
roll-up report), P4 (Local SEO suite), P5 (AI Overviews tracking, llms.txt, GEO recommendations).

---

## 10. Ringkasan Satu-Halaman: semua gap berurutan

**Rusak / Wajib diperbaiki (P0):** email undangan tim · form Content Strategy · hapus akun OAuth ·
beli top-up kredit · silent email failure.

**Kepatuhan (P1):** export data akun · email billing + welcome · dunning · notification center ·
footer legal.

**SEO kompetitif (P2):** Bing · competitor rank tracking · SoV · link intersect · new/lost backlinks
view · anchor distribution · sitemap validator · schema validation · crawl budget/log · on-page
checker · keyword trends · keyword clustering · disavow/toxic · PPC insights · SERP volatility.

**Platform (P3):** RBAC manager/viewer · trial · invoice PDF · coupon · roll-up report · annotations ·
integrasi (Looker/Slack/Zapier) · lead-gen widget · SSO · audit log · i18n · fix gauge quota.

**Local SEO (P4):** geo-grid · GBP audit · citation · review · multi-location.

**AI/GEO (P5):** AI Overviews tracking · AI-bot log analysis · llms.txt · GEO content recs ·
brand sentiment audit.

---

*Lihat juga: memory proyek (`MEMORY.md`) untuk arsitektur & gotcha teknis yang relevan saat
mengimplementasi item di atas.*
