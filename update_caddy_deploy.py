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

def update_caddyfile(client):
    # Read the existing Caddyfile
    sftp = client.open_sftp()
    with sftp.open(f'{remote_path}/Caddyfile', 'r') as f:
        content = f.read().decode()
    sftp.close()

    # Replace placeholder
    content = content.replace('yourdomain.com', 'jetdigitalseo.com')

    # Write updated Caddyfile
    sftp = client.open_sftp()
    with sftp.open(f'{remote_path}/Caddyfile', 'w') as f:
        f.write(content)
    sftp.close()

if __name__ == "__main__":
    try:
        print(f"Connecting to {hostname}...")
        client = ssh_connect()
        
        print("Updating Caddyfile...")
        update_caddyfile(client)
        
        print("Running deployment...")
        execute_command(client, f"chmod +x {remote_path}/scripts/deploy-vps.sh && cd {remote_path} && ./scripts/deploy-vps.sh --build")
        
        client.close()
        print("Configuration and deployment complete!")
    except Exception as e:
        print(f"Error: {e}")
