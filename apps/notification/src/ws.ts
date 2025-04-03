import { createNodeWebSocket } from "@hono/node-ws";
import { OpenAPIHono } from "@hono/zod-openapi";

const app = new OpenAPIHono();
export const { injectWebSocket, upgradeWebSocket } = createNodeWebSocket({
  app,
});

export { app };
