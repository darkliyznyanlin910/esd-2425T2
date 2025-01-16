FROM node:22-alpine

# Install pnpm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN npm install -g pnpm
RUN pnpm install -g pnpm turbo

WORKDIR /repo

COPY . .
COPY . .
RUN rm -rf node_modules
RUN pnpm install

WORKDIR /repo/apps/web
RUN rm -rf node_modules
RUN pnpm install
RUN pnpm build 

EXPOSE 3000

CMD ["pnpm", "start"]