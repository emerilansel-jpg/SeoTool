sshpass -p "%VPS_PASSWORD%" ssh root@148.230.103.98 "cd /opt/pesat-control-plane/caddy/volumes/seotool && git pull && docker compose build && docker compose up -d"
