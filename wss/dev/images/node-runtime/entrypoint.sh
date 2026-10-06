#!/bin/ash
# Minimal stand-in for ghcr.io/pterodactyl/yolks:nodejs_22 (dev only; GHCR is unreachable here).
cd /home/container || exit 1
node -v
# Convert {{VAR}} placeholders in STARTUP into ${VAR} and expand them, like the real yolks do.
MODIFIED_STARTUP=$(echo -e "${STARTUP}" | sed -e 's/{{/${/g' -e 's/}}/}/g')
echo -e ":/home/container$ ${MODIFIED_STARTUP}"
eval ${MODIFIED_STARTUP}
