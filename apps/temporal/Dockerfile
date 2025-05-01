FROM node:22-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN npm install -g pnpm
RUN pnpm install -g turbo
RUN apt-get update && apt-get install -y jq

WORKDIR /repo
COPY . .

RUN pnpm install

RUN jq 'del(.tasks.push.interactive)' turbo.json > temp.json && mv temp.json turbo.json

CMD ["pnpm", "run", "start:temporal-runner"]

