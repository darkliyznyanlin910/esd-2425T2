import { createMiddleware } from "hono/factory";

export const useSSE = createMiddleware(async (c, next) => {
  c.header("Content-Type", "text/event-stream");
  c.header("Cache-Control", "no-cache");
  c.header("Connection", "keep-alive");
  await next();
});
