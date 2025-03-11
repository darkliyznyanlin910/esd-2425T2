FROM node:22-alpine AS base
RUN apk add --no-cache python3 make g++ gcc
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN npm install -g pnpm
RUN pnpm install -g turbo
 
FROM base AS builder
WORKDIR /repo
COPY . .
 
RUN turbo prune @repo/driver-frontend --docker
 
# Add lockfile and package.json's of isolated subworkspace
FROM base AS installer
RUN apk update
RUN apk add --no-cache libc6-compat
WORKDIR /repo
 
# First install the dependencies (as they change less often)
COPY --from=builder /repo/out/full/ .
RUN pnpm install

RUN pnpm turbo run build --filter=@repo/driver-frontend...
 
FROM base AS runner
WORKDIR /repo
 
# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs
 
# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=installer --chown=nextjs:nodejs /repo/apps/driver-frontend/.next/standalone ./
COPY --from=installer --chown=nextjs:nodejs /repo/apps/driver-frontend/.next/static ./apps/driver-frontend/.next/static
COPY --from=installer --chown=nextjs:nodejs /repo/apps/driver-frontend/public ./apps/driver-frontend/public
COPY --from=installer --chown=nextjs:nodejs /repo/packages /repo/packages

EXPOSE 6600
 
ENV PORT=6600
ENV HOSTNAME=0.0.0.0
CMD ["node", "apps/driver-frontend/server.js"]