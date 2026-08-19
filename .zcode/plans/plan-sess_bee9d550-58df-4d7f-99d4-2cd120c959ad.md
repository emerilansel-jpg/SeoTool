# Deploy Plan: Push Uncommitted Changes ke VPS Existing

## Context

VPS `148.230.103.98` sudah berjalan dengan SaaS SeoTool.im. Saat ini ada ~100 modified files + ~60 new untracked files (fitur baru: crawl budget, keyword clustering, link intersect, on-page checker, SERP volatility, sitemap validation, toxic links/disavow, marketing content). Perlu di-deploy ke production.

---

## Pre-Flight Checks

### 1. Generate Database Migrations (CRITICAL)

Schema changes tanpa migration = deploy gagal.

```bash
# Generate D1 migration
npx drizzle-kit generate --config drizzle.config.ts

# Generate Postgres migration
npx drizzle-kit generate --config drizzle-pg.config.ts
```

Yang perlu di-migrate:

- `searchEngine` column di `rankTrackingConfigs` (src/db/app.schema.ts)
- `serpVolatilitySnapshots` table baru (src/db/serp-volatility.schema.ts + src/db/pg/serp-volatility.schema.ts)
- Semua schema changes lainnya dari uncommitted work

### 2. Type Check & Lint

```bash
pnpm ci:check
```

Pastikan 0 errors sebelum commit. Ini termasuk prettier, knip, tsc, oxlint.

### 3. Run Tests

```bash
pnpm test:ci
```

Baseline: 918 tests harus pass.

---

## Commit & Push

### 4. Stage All Changes

```bash
git add -A
git status  # verify staging
```

### 5. Commit

```bash
git commit -m "feat: add crawl budget, keyword clustering, link intersect, on-page checker, SERP volatility, sitemap validation, toxic links, marketing content"
```

### 6. Push to Main

```bash
git push origin main
```

Ini akan trigger GitHub Actions `deploy.yml` yang SSH ke VPS dan jalankan `auto-deploy.sh`.

---

## Auto-Deploy Process (GitHub Actions)

Yang terjadi otomatis setelah push:

1. GitHub Action SSH ke VPS sebagai user `seotool`
2. `auto-deploy.sh` backup `.env.hosted`
3. `git fetch && git reset --hard origin/main`
4. Restore `.env.hosted`
5. `scripts/deploy-vps.sh --build` jalankan:
   - `docker compose down` then `up -d --build`
   - Docker build: install deps, run migrations, build vite, start preview server on port 3001

---

## Post-Deploy (Manual Steps)

### 7. Rebuild Marketing Site (Jika Ada Perubahan Marketing)

Marketing files TIDAK auto-deploy. Perlu manual:

```bash
# Local: rebuild marketing
cd web && DOCKER_BUILD=1 npm run build

# Commit new build output
cd ..
git add -f web/dist/client/
git commit -m "chore: rebuild marketing dist"
git push origin main

# SSH ke VPS, copy marketing files
ssh seotool@148.230.103.98
docker cp /home/seotool/JetDigitalSEO/web/dist/client/. gateway-caddy:/srv/marketing/

# Reload Caddy
docker exec gateway-caddy caddy reload --config /etc/caddy/Caddyfile
```

### 8. Verify Deployment

```bash
# Health check
curl -s https://seotool.im/api/health

# Homepage (check dark theme marker)
curl -s https://seotool.im/ | grep "0a0b14"

# Docker status
ssh seotool@148.230.103.98 "docker ps | grep -E 'open-seo|postgres|gateway-caddy'"
```

---

## Rollback Plan

Jika deploy gagal:

```bash
ssh seotool@148.230.103.98
cd /home/seotool/JetDigitalSEO
git log --oneline -5  # cari commit sebelumnya
git reset --hard <commit-hash>
cp .env.hosted.bak .env.hosted 2>/dev/null
docker compose -f docker-compose.hosted.yaml --env-file .env.hosted down
docker compose -f docker-compose.hosted.yaml --env-file .env.hosted up -d --build
```

---

## Known Gotchas

1. **`--env-file` wajib** - tanpa itu POSTGRES_PASSWORD kosong
2. **Marketing files hilang setelah gateway-caddy restart** - perlu `docker cp` lagi
3. **`container_name: open-seo`** harus ada di compose untuk network resolution
4. **POSTGRES username = `openseo`**, bukan `postgres`
5. **Docker compose YAML bisa corrupt** dari SFTP - verify setelah upload
6. **Stale cache** - nuclear fix: `docker compose down -v --rmi all && ./scripts/deploy-vps.sh --build`

---

## Timeline Estimate

| Step                         | Duration       |
| ---------------------------- | -------------- |
| Generate migrations          | 2 min          |
| Type check + lint            | 3-5 min        |
| Run tests                    | 5-10 min       |
| Commit + push                | 1 min          |
| Auto-deploy (GitHub Actions) | 5-10 min       |
| Marketing rebuild + deploy   | 10-15 min      |
| Verification                 | 5 min          |
| **Total**                    | **~30-45 min** |

---

## Execution Order

1. `npx drizzle-kit generate` (both D1 and PG)
2. `pnpm ci:check` - fix any errors
3. `pnpm test:ci` - fix any failures
4. `git add -A && git commit -m "..."`
5. `git push origin main`
6. Monitor GitHub Actions deploy
7. SSH verify: `docker ps`, `curl https://seotool.im/api/health`
8. If marketing changed: rebuild `web/`, `docker cp` to gateway-caddy
9. Final verification
