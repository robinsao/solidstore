#!/bin/bash

# Setup caddy certs
COMPOSE_FILE="compose.zero-int.dev.yaml"
SERVICE_NAME="caddy-dev"
CADDY_DIR="./caddy/dev"
if [ "$1" == "prod" ]; then
  COMPOSE_FILE="compose.zero-int.yaml"
  SERVICE_NAME="caddy"
  CADDY_DIR="./caddy/prod"
fi

docker compose -f $COMPOSE_FILE down

docker compose -f $COMPOSE_FILE up -d $SERVICE_NAME
CONTAINER_ID=$(docker compose -f $COMPOSE_FILE ps -q $SERVICE_NAME)

while [ "$(docker inspect -f '{{.State.Health.Status}}' $CONTAINER_ID)" != "healthy" ]; do
    echo "Waiting for caddy to be healthy..."
    sleep 2
done

echo "caddy is healthy"

docker compose -f $COMPOSE_FILE down

sudo chown -R 1000:1000 $CADDY_DIR/data $CADDY_DIR/config

# Setup keycloak
mkdir -p keycloak-prod-data-dir
# The above is needed because it's bind-mounted. Without the above, Linux-version of docker creates the directory with root ownership,
# This leads to unexpected problems like the website not being styled properly
