#! /bin/bash
COMPOSE_FILE="docker-compose.yml"
if [ "$2" = "temporal" ]; then
  COMPOSE_FILE="docker-compose-temporal.yml"
fi

if [ "$1" = "up" ]; then
  docker compose -f $COMPOSE_FILE --env-file .env.temporal up -d
elif [ "$1" = "down" ]; then
  docker compose -f $COMPOSE_FILE --env-file .env.temporal down
elif [ "$1" = "clean" ]; then
  NAME=$(grep "^name:" $COMPOSE_FILE | cut -d: -f2 | tr -d ' ')
  docker images | grep "^$NAME" | awk '{print $3}' | xargs -r docker rmi
else
  echo "Usage: $0 (up|down|clean) [temporal]"
  exit 1
fi
