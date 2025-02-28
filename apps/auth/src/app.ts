import { OpenAPIHono } from "@hono/zod-openapi";
import { cors } from "hono/cors";

import { auth } from "./auth";
import { HonoExtension } from "./type";

const app = new OpenAPIHono<HonoExtension>();

app.use(
  "/auth/**", // or replace with "*" to enable cors for all routes
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["POST", "GET", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
    credentials: true,
  }),
);

const routes = app
  .get("/", (c) => c.json({ ok: true }))
  .on(["POST", "GET"], "/auth/**", async (c) => {
    return auth.handler(c.req.raw);
  });

export { app, routes };
