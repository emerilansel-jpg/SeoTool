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

def configure_env(client):
    # Check if .env.hosted exists
    stdin, stdout, stderr = client.exec_command(f"test -f {remote_path}/.env.hosted && echo 'exists'")
    if 'exists' in stdout.read().decode():
        print(".env.hosted already exists")
        return

    # Create .env.hosted from example
    execute_command(client, f"cp {remote_path}/.env.hosted.example {remote_path}/.env.hosted")
    
    # Fill in required values
    env_vars = {
        'POSTGRES_PASSWORD': 'openseo-prod-pw-2026',
        'BETTER_AUTH_SECRET': 'openseo-jetdigital-prod-secret-32chars',
        'BETTER_AUTH_URL': 'https://jetdigitalseo.com',
        'GOOGLE_CLIENT_ID': '756963042550-d3is7ko2q96gqammvn4vd3gnqd4u2khu.apps.googleusercontent.com',
        'GOOGLE_CLIENT_SECRET': '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',
        'DATAFORSEO_API_KEY': 'amRwLWRpYW1vbmQtdGVhbUBqZXRkaWdpdGFscHJvLmNvbTo0OGRjMTRjNGQ5ZjU5YThh',
        'OPENROUTER_API_KEY': 'sk-a906238a6efd2260-d988e0-d646570e',
        'OPENROUTER_BASE_URL': 'https://api.jetdigitalpro.com/v1',
        'OPENROUTER_MODEL': 'minimax/minimax-m3'
    }
    
    for key, value in env_vars.items():
        # Use sed to replace placeholder or append if not present
        execute_command(client, f"sed -i '/^{key}=/d' {remote_path}/.env.hosted && echo '{key}={value}' >> {remote_path}/.env.hosted")

if __name__ == "__main__":
    try:
        print(f"Connecting to {hostname}...")
        client = ssh_connect()
        
        print("Configuring .env.hosted...")
        configure_env(client)
        
        print("Running deployment...")
        execute_command(client, f"chmod +x {remote_path}/scripts/deploy-vps.sh && cd {remote_path} && ./scripts/deploy-vps.sh --build")
        
        client.close()
        print("Configuration and deployment complete!")
    except Exception as e:
        print(f"Error: {e}")
