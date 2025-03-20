FROM node:22-alpine AS base
RUN apk add --no-cache python3 make g++ gcc
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN npm install -g pnpm
RUN pnpm install -g turbo
 
FROM base AS builder
WORKDIR /repo
COPY . .
 
RUN turbo prune @repo/admin-frontend --docker
 
# Add lockfile and package.json's of isolated subworkspace
FROM base AS installer
RUN apk update
RUN apk add --no-cache libc6-compat
WORKDIR /repo
 
# First install the dependencies (as they change less often)
COPY --from=builder /repo/out/full/ .
RUN pnpm install

COPY kubernetes/.env.k8s /repo/kubernetes/.env.k8s
RUN pnpm turbo run build --filter=@repo/admin-frontend...
 
FROM base AS runner
WORKDIR /repo
 
# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs
 
# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=installer --chown=nextjs:nodejs /repo/apps/admin-frontend/.next/standalone ./
COPY --from=installer --chown=nextjs:nodejs /repo/apps/admin-frontend/.next/static ./apps/admin-frontend/.next/static
COPY --from=installer --chown=nextjs:nodejs /repo/apps/admin-frontend/public ./apps/admin-frontend/public
COPY --from=installer --chown=nextjs:nodejs /repo/packages /repo/packages

EXPOSE 4400
 
ENV PORT=4400
ENV HOSTNAME=0.0.0.0
CMD ["node", "apps/admin-frontend/server.js"]