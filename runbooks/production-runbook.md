# Production Runbook — seotool.im

One page for "the app is down / misbehaving". Owner: platform on-call (see
`PLATFORM_ADMIN_USER_IDS` in `.env.hosted` for who has admin UI access).

## System map

```
Cloudflare edge (TLS, cache, WAF)
  └─ pesat-caddy (host network, owns 80/443)
       └─ seotool-caddy  (gateway-caddy/, binds 127.0.0.1:8080)
            ├─ /srv/marketing static files (web/dist/client)
            └─ reverse_proxy → open-seo:3001 (workerd in Docker)
                 └─ postgres:5432 (docker volume pg_data)
```

Stack lives at `/home/seotool/JetDigitalSEO` on the VPS. Deploy = push to
`main` → GitHub Action `deploy.yml` → `auto-deploy.sh` → `deploy-vps.sh`.

## App down — 1-2-3

1. **Triage from outside**: `curl -i https://seotool.im/api/health`
   - `200 {"status":"ok"}` → app fine, problem is DNS/Cloudflare/Caddy.
   - timeout/5xx → go to step 2 on the VPS.
2. **On the VPS**:
   ```bash
   cd /home/seotool/JetDigitalSEO
   docker compose -f docker-compose.hosted.yaml --env-file .env.hosted ps
   docker compose -f docker-compose.hosted.yaml --env-file .env.hosted logs --since 15m open-seo | tail -100
   docker compose -f docker-compose.hosted.yaml --env-file .env.hosted restart open-seo
   ```
   Postgres crash loop? Check disk full (`df -h`) and
   `logs --since 15m postgres`.
3. **If the latest build is broken — rollback** (pick the last known-good
   commit, e.g. from `git log` or the previous release tag):
   ```bash
   git fetch origin
   git reset --hard <last-good-sha>
   ./scripts/deploy-vps.sh --build
   bash scripts/migrate-pg.sh || true   # only if the rollback includes older migrations
   cd gateway-caddy && docker compose up -d --force-recreate && cd ..
   ```

## Logs, backups, monitoring

| What | Where |
| --- | --- |
| App logs | `docker compose -f docker-compose.hosted.yaml logs -f open-seo` |
| Caddy logs | `docker compose -f gateway-caddy/docker-compose.yml logs seotool-caddy` |
| Errors (granular) | PostHog dashboard → Exceptions (client + server capture already wired) |
| Uptime alerts | External monitor on `https://seotool.im/api/health` (60s interval) — see "Uptime monitor setup" below |
| DB backups | `/var/backups/seotool/openseo-*.dump.gz` (nightly 03:15, kept 14 days), log: `/var/log/seotool-backup.log` |

### Uptime monitor setup (one-time, ~5 min)

Cloudflare dashboard → your zone → **Health Checks** (or UptimeRobot free
tier): create a monitor for `https://seotool.im/api/health`, expect HTTP 200,
interval 60s, notify email + Discord webhook. Without this, nobody learns
about an outage until a user complains.

## Database backup & restore

```bash
# Manual backup any time:
bash scripts/backup-pg.sh

# Verify a dump restores cleanly (safe: restores into a temp DB):
bash scripts/restore-pg.sh /var/backups/seotool/openseo-YYYYMMDD-HHMM.dump.gz

# Real restore (DESTRUCTIVE — replaces prod DB, asks to type RESTORE):
bash scripts/restore-pg.sh /var/backups/seotool/openseo-YYYYMMDD-HHMM.dump.gz --write
```

Cron is installed once via the snippet at the bottom of `auto-deploy.sh`.
Check weekly that `ls -lt /var/backups/seotool/ | head` shows fresh dumps and
run the verify mode on the newest one monthly.

## Auth rate limiting

better-auth limiter is explicit in `src/lib/auth-options.ts` (global
100 req/60s; sign-in/sign-up 3 req/10s; password-reset 3 req/60s per IP via
`cf-connecting-ip`). It is **in-memory per Workers isolate** — a distributed
flood can spread across isolates. Optional hardening at the edge:
Cloudflare dashboard → Security → WAF → **Rate limiting rules**: match
`http.request.uri.path starts_with "/api/auth/"`, threshold e.g. 30 requests
/ 10s per IP, action Block. No app change needed.

## Payments go-live checklist (repeat after price/cohort changes)

1. Sign in as a user whose id is in `PLATFORM_ADMIN_USER_IDS` → `/admin/pricing`.
2. Click **"Set up PayPal plans"** (creates product + per-cohort plans).
3. Verify: `curl -s https://seotool.im/pricing | grep -c 'paypalPlanId:null'`
   must print `0`.
4. Confirm `PAYPAL_MODE` and `PAYPAL_WEBHOOK_ID` in `.env.hosted` point at the
   intended mode (sandbox ≠ live) and the webhook endpoint is subscribed in
   the PayPal dashboard.
5. Run one real (small) checkout in the target mode; verify the webhook row
   appears in `paypal_webhook_events` and the membership activates.

## Third-party quotas — check weekly

| Service | Where to look | Alarm sign |
| --- | --- | --- |
| DataForSEO | dashboard → account usage (or `pnpm billing:usage`) | balance < 1 week of run-rate |
| Loops email | app.loops.so → usage | bounced/limited transactional sends |
| Postgres disk | `df -h` on VPS | > 80% used |
| Cloudflare | zone analytics | 4xx/5xx spike, WAF blocks on real users |

## Env vars that require a redeploy when changed

Keys read at worker init (Google OAuth, Loops, Turnstile, PostHog, Reddit,
`PLATFORM_ADMIN_USER_IDS`) are status-only — changing them in `.env.hosted`
needs `./scripts/deploy-vps.sh --build` to take effect. Everything else under
admin settings overrides lives in the `app_settings` table (Admin UI, no
redeploy). Full list: `.env.hosted.example` + `docs/ADMIN.md`.
