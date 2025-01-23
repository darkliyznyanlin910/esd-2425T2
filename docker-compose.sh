#! /bin/bash
COMPOSE_FILE="docker-compose.yml"
if [ "$2" = "temporal" ]; then
  COMPOSE_FILE="docker-compose-temporal.yml"
fi

if [ "$1" = "up" ]; then
  docker compose -f $COMPOSE_FILE --env-file .env.temporal up -d
elif [ "$1" = "down" ]; then
  docker compose -f $COMPOSE_FILE --env-file .env.temporal down
else
  echo "Usage: $0 [up|down] [temporal]"
  exit 1
fi
