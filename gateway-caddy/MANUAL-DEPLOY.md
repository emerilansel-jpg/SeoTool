# Manual Deploy: SeoTool Caddy (Separated from Pesat)

## Problem

`pesat-control-plane-caddy-1` handles ALL domains including seotool.im.
Config seotool.im hilang dari Caddyfile, sehingga site return 525.

## Solution

Buat container Caddy terpisah khusus untuk seotool.im.

## Steps (SSH ke VPS)

### 1. Pull latest code

```bash
cd /home/seotool/JetDigitalSEO
git pull origin main
```

### 2. Stop pesat-caddy (atau ubah portnya)

```bash
# Option A: Stop pesat-caddy (jika seotool.im domain utama)
docker stop pesat-control-plane-caddy-1

# Option B: Biarkan pesat-caddy jalan, tapi seotool-caddy pakai port 4443
# Edit gateway-caddy/docker-compose.yml, ubah ports ke:
#   - "4443:443"
#   - "8080:80"
# Lalu config Cloudflare origin rule untuk port 4443
```

### 3. Start seotool-caddy

```bash
docker compose -f gateway-caddy/docker-compose.yml up -d
```

### 4. Copy marketing files

```bash
docker cp /home/seotool/JetDigitalSEO/web/dist/client/. seotool-caddy:/srv/marketing/
```

### 5. Verify

```bash
# Check container
docker ps | grep seotool-caddy

# Check health
docker exec seotool-caddy wget --spider -q http://open-seo:3001/api/health && echo OK

# Check site
curl -k https://seotool.im/api/health
```

## If pesat-caddy needs to keep running

Edit `gateway-caddy/docker-compose.yml`:

```yaml
ports:
  - "4443:443" # instead of 443:443
  - "8080:80" # instead of 80:80
```

Then in Cloudflare:

1. Go to Rules > Origin Rules
2. Create rule for seotool.im
3. Set origin port to 4443

## Files

- `gateway-caddy/docker-compose.yml` — compose for seotool-caddy
- `gateway-caddy/Caddyfile.seotool` — Caddyfile with ONLY seotool.im
- `gateway-caddy/deploy.sh` — automated deploy script
