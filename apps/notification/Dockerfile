# Stage 1: Setup base
FROM node:22-alpine AS base
RUN apk add --no-cache python3 make g++ gcc
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN npm install -g pnpm
RUN pnpm install -g turbo

WORKDIR /repo
COPY . .
RUN turbo prune @repo/notification-backend --docker

# Stage 2: Build
FROM node:22-alpine AS builder
RUN apk add --no-cache python3 make g++ gcc
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN npm install -g pnpm

WORKDIR /repo

COPY --from=base /repo/out/full/ .
RUN pnpm install

# Build the project
WORKDIR /repo/apps/notification
RUN pnpm build

# Stage 3: Run
FROM node:22-alpine AS runner
WORKDIR /repo

COPY --from=builder /repo/apps/notification/dist /repo/apps/notification/dist
COPY --from=builder /repo/packages /repo/packages

EXPOSE 3004
CMD ["node", "/repo/apps/notification/dist/index.cjs"]