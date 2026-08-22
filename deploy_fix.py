import paramiko

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect("148.230.103.98", username="seotool", password="1CBhO9mrTvM4OAJf")

def exec_cmd(cmd):
    stdin, stdout, stderr = client.exec_command(cmd)
    return stdout.read().decode().strip(), stderr.read().decode().strip()

# Check docker status
out, err = exec_cmd("docker ps -a")
print("Docker PS:")
print(out)

print("\nRestarting containers properly...")
out, err = exec_cmd("cd /home/seotool/JetDigitalSEO && docker compose -f docker-compose.hosted.yaml down && docker compose -f docker-compose.hosted.yaml --env-file .env.hosted up -d")
print(out, err)

# Check correct container name for open-seo
out, err = exec_cmd("docker ps --format '{{.Names}}' | grep open-seo")
seo_container = out.strip()
print("\nSEO Container name:", seo_container)

if seo_container:
    print(f"\nRunning migrations on {seo_container}...")
    out, err = exec_cmd(f"cd /home/seotool/JetDigitalSEO && docker exec -e DATABASE_PROVIDER=postgres {seo_container} npx drizzle-kit migrate --config drizzle-pg.config.ts")
    print(out, err)

client.close()
