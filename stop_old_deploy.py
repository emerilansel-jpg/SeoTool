import paramiko

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

def stop_old_services(client):
    # List running containers and stop any old pesat-control-plane related ones
    execute_command(client, "docker ps -q --filter 'name=pesat-control-plane' | xargs -r docker stop")

if __name__ == "__main__":
    try:
        print(f"Connecting to {hostname}...")
        client = ssh_connect()
        
        print("Stopping old services to free ports...")
        stop_old_services(client)
        
        print("Running deployment...")
        execute_command(client, f"chmod +x {remote_path}/scripts/deploy-vps.sh && cd {remote_path} && ./scripts/deploy-vps.sh")
        
        client.close()
        print("Fix and deploy complete!")
    except Exception as e:
        print(f"Error: {e}")
