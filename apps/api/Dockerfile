FROM node:22-alpine

# Install pnpm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN npm install -g pnpm
RUN pnpm install -g pnpm turbo

WORKDIR /repo

COPY . .
RUN rm -rf node_modules
RUN pnpm install

WORKDIR /repo/apps/api
RUN rm -rf node_modules
RUN pnpm install
RUN pnpm build 

EXPOSE 3001

CMD ["pnpm", "start"]