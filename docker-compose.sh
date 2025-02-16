#! /bin/bash
COMPOSE_FILE="docker-compose.yml"
if [ "$2" = "temporal" ]; then
  COMPOSE_FILE="docker-compose-temporal.yml"
  ENV_FILE=".env.temporal"
elif [ "$2" = "databases" ]; then
  COMPOSE_FILE="docker-compose-databases.yml"
elif [ "$2" = "localstack" ]; then
  COMPOSE_FILE="docker-compose-localstack.yml"
else
  echo "Usage: $0 (up|down|clean) [temporal|databases|localstack]"
  exit 1
fi

if [ "$1" = "up" ]; then
  if [ -z "$ENV_FILE" ]; then
    docker compose -f $COMPOSE_FILE up -d
  else
    docker compose -f $COMPOSE_FILE --env-file $ENV_FILE -d
  fi
  if [ "$2" = "databases" ]; then
    pnpm run db:push
  fi
elif [ "$1" = "down" ]; then
  if [ -z "$ENV_FILE" ]; then
    docker compose -f $COMPOSE_FILE down
  else
    docker compose -f $COMPOSE_FILE --env-file $ENV_FILE down
  fi
elif [ "$1" = "clean" ]; then
  NAME=$(grep "^name:" $COMPOSE_FILE | cut -d: -f2 | tr -d ' ')
  docker images | grep "^$NAME" | awk '{print $3}' | xargs -r docker rmi
else
  echo "Usage: $0 (up|down|clean) [temporal|databases|localstack]"
  exit 1
fi
