FROM node:22-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN npm install -g pnpm
RUN pnpm install -g turbo

WORKDIR /repo
COPY . .

RUN pnpm install

CMD ["pnpm", "run", "start:temporal-runner"]

