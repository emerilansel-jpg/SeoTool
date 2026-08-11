import paramiko
import os

# Config
hostname = '148.230.103.98'
port = 22
username = 'seotool'
password = '1CBhO9mrTvM4OAJf'
remote_path = '/home/seotool/JetDigitalSEO'

def ssh_connect():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(hostname, port=port, username=username, password=password)
    return client

def execute_command(client, command):
    print(f"Executing: {command}")
    stdin, stdout, stderr = client.exec_command(command)
    out = stdout.read().decode()
    err = stderr.read().decode()
    if out: print(f"Output: {out}")
    if err: print(f"Error: {err}")
    return out, err

def setup_env(client):
    env_content = """
POSTGRES_PASSWORD=openseo-prod-pw-2026
BETTER_AUTH_SECRET=openseo-jetdigital-prod-secret-32chars
BETTER_AUTH_URL=https://jetdigitalseo.com
DATABASE_PROVIDER=postgres
POSTGRES_DATABASE_URL=postgres://postgres:openseo-prod-pw-2026@postgres:5432/openseo
GOOGLE_CLIENT_ID=756963042550-d3is7ko2q96gqammvn4vd3gnqd4u2khu.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
DATAFORSEO_API_KEY=amRwLWRpYW1vbmQtdGVhbUBqZXRkaWdpdGFscHJvLmNvbTo0OGRjMTRjNGQ5ZjU5YThh
OPENROUTER_API_KEY=sk-a906238a6efd2260-d988e0-d646570e
OPENROUTER_BASE_URL=https://api.jetdigitalpro.com/v1
OPENROUTER_MODEL=minimax/minimax-m3
"""
    sftp = client.open_sftp()
    with sftp.open(f'{remote_path}/.env.hosted', 'w') as f:
        f.write(env_content)
    sftp.close()

if __name__ == "__main__":
    try:
        print(f"Connecting to {hostname}...")
        client = ssh_connect()
        
        print("Setting up .env.hosted...")
        setup_env(client)
        
        print("Running deployment...")
        execute_command(client, f"chmod +x {remote_path}/scripts/deploy-vps.sh && cd {remote_path} && ./scripts/deploy-vps.sh --build")
        
        client.close()
        print("Configuration and deployment complete!")
    except Exception as e:
        print(f"Error: {e}")
