import paramiko
import os

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())

print("Connecting to VPS...")
client.connect("148.230.103.98", username="seotool", password="1CBhO9mrTvM4OAJf")

def exec_cmd(cmd):
    print(f"Running: {cmd}")
    stdin, stdout, stderr = client.exec_command(cmd)
    out = stdout.read().decode().strip()
    err = stderr.read().decode().strip()
    if out:
        print("OUT:", out)
    if err:
        print("ERR:", err)
    return out, err

# 1. Pull changes
exec_cmd("cd /home/seotool/JetDigitalSEO && git fetch origin main && git reset --hard origin/main")

# 2. Rebuild SaaS
exec_cmd("cd /home/seotool/JetDigitalSEO && docker compose -f docker-compose.hosted.yaml --env-file .env.hosted up -d --build")

# 3. Run migrations on Postgres (running inside open-seo container)
exec_cmd("cd /home/seotool/JetDigitalSEO && docker exec -e DATABASE_PROVIDER=postgres open-seo npx drizzle-kit migrate --config drizzle-pg.config.ts")

# 4. Copy static marketing files to Caddy
exec_cmd("cd /home/seotool/JetDigitalSEO && docker cp web/dist/client/. pesat-control-plane-caddy-1:/srv/marketing/")

print("Deployment finished.")
client.close()
