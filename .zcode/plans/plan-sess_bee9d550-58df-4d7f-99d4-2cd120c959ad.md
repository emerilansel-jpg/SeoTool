# Fix Plan: Multiple Bug Fixes + Admin Access (alfu + emerilansel) + GPT-4o

## A. Immediate: Admin Org Upgrade (DB + env, via SSH)

**Untuk KEDUA admin:**
1. Cari user ID `emerilansel@gmail.com` di DB (user sudah bisa signup setelah fix auth)
2. Tambahkan ke `PLATFORM_ADMIN_USER_IDS` di `.env.hosted` (comma-separated dengan alfu):
   ```
   PLATFORM_ADMIN_USER_IDS=H9Qk2yYXpiVanOgB6KbDcFuypW4pGlZ7,<emerilansel-user-id>
   ```
3. Upgrade org admin ke tier **agency**:
   ```sql
   UPDATE subscription SET plan_tier = 'agency' 
   WHERE organization_id IN (
     SELECT DISTINCT m.organization_id FROM member m 
     JOIN "user" u ON u.id = m.user_id 
     WHERE u.email IN ('alfu13.sf@gmail.com', 'emerilansel@gmail.com')
   );
   ```
4. Recreate container agar env var baru terbaca

Ini langsung membuka semua fitur untuk kedua admin (rank_tracking: 5000, backlink_check: 500/day, content_intelligence: 500/month, keyword_search: unlimited, dll).

## B. Code Fixes

### 1. Credit-feature mapping bug (`src/shared/billing-credit-features.ts`)
Fix: `mapDataforseoPathToCreditFeature` — ketika path kosong/module undefined, jangan default ke "site_audit". Fix mapping untuk `rankedKeywords` → "domain_overview".

### 2. Platform admin quota bypass (`src/server/features/billing/services/QuotaService.ts`)
Add bypass di `getPlanTier()`: return "agency" ketika org owner adalah platform admin. Implementasi:
- Query org owner email via member table (role = 'owner')
- Check `isPlatformAdmin({ userEmail })` — sudah cover alfu13.sf@gmail.com + emerilansel@gmail.com via BUILTIN_PLATFORM_ADMIN_EMAILS + env var
- Cache result (Map by orgId) untuk avoid repeated queries
- Fallback ke DB value jika bukan admin
- Ini membuat DB upgrade (Plan A) redundant dalam jangka panjang — code bypass bekerja otomatis untuk admin baru

### 3. DataForSEO label fix (`src/shared/admin-settings.ts`)
Change: `"API key (login:password)"` → `"Base64 of email:password (from DataForSEO API dashboard)"`

### 4. GPT-4o support (`src/server/lib/openrouter.ts`)
- Add `OPENAI_API_KEY` env var support
- When OPENAI_API_KEY is set: use `https://api.openai.com/v1` as baseURL, key langsung dari env, model default `gpt-4o`
- Drop `reasoning: { effort: "medium" }` option ketika menggunakan non-OpenRouter baseURL (GPT-4o tidak support reasoning effort parameter)
- Fallback ke OpenRouter config ketika OPENAI_API_KEY tidak diset
- Update admin settings page untuk menampilkan field OPENAI_API_KEY

### 5. GA4 disconnect fix
Investigate query invalidation — pastikan `ga4Connection` query key konsisten antara card dan insights page. Fix any key mismatch atau refresh issue.

### 6. Admin settings: add OPENAI field
Add to admin-settings.ts:
- `OPENAI_API_KEY` (secret, optional) — "Set to use GPT-4o directly from OpenAI instead of OpenRouter"

## C. Verification
1. tsc + oxlint + prettier
2. Unit tests (quota + billing)
3. Deploy ke VPS + recreate container (env var baru)
4. Browser test: verify setiap fitur yang sebelumnya broken:
   - Keywords (search jasa seo)
   - Rank tracking
   - Keyword clustering
   - Domain overview
   - Backlinks
   - Content gap
   - Link intersect
   - SERP volatility
5. Verify GA4 disconnect works
6. Verify admin settings menampilkan label yang benar

## D. Env vars yang perlu diisi user (setelah deploy)
```bash
# .env.hosted - tambahkan:
OPENAI_API_KEY=sk-...  # OpenAI key untuk GPT-4o (optional)
```