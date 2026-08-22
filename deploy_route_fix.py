import paramiko

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect("148.230.103.98", username="seotool", password="1CBhO9mrTvM4OAJf")

def exec_cmd(cmd):
    stdin, stdout, stderr = client.exec_command(cmd)
    return stdout.read().decode().strip(), stderr.read().decode().strip()

print("Pulling latest code and building...")
out, err = exec_cmd("cd /home/seotool/JetDigitalSEO && git pull origin main && docker compose -f docker-compose.hosted.yaml --env-file .env.hosted up -d --build")
print(out)
print(err)

client.close()
