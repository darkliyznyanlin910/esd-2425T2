import { createMiddleware } from "hono/factory";

export const useSSE = createMiddleware(async (c, next) => {
  c.header("Content-Type", "text/event-stream; charset=utf-8");
  c.header("Cache-Control", "no-cache");
  c.header("Connection", "keep-alive");
  c.header("Content-Encoding", "none");
  await next();
});
