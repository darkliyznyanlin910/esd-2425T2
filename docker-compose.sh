#! /bin/bash
if [ "$1" = "up" ]; then
  docker compose --env-file .env.temporal up -d
elif [ "$1" = "down" ]; then
  docker compose --env-file .env.temporal down
else
  echo "Usage: $0 [up|down]"
  exit 1
fi
