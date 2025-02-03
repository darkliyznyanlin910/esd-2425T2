FROM node:22-alpine

# Install Python and build dependencies
RUN apk add --no-cache python3 make g++ gcc

# Install pnpm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN npm install -g pnpm
RUN pnpm install -g pnpm turbo

WORKDIR /repo

COPY . .
RUN pnpm install

WORKDIR /repo/apps/auth
RUN pnpm build 

EXPOSE 3000

CMD ["pnpm", "start"]