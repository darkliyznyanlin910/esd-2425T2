import { Hono } from "hono";
import { cors } from "hono/cors";

import { getServiceBaseUrl, SERVICES } from "@repo/service-discovery";

import { auth } from "./auth";

const app = new Hono();

app.use(
  "/auth/**", // or replace with "*" to enable cors for all routes
  cors({
    origin: SERVICES.map((service) => getServiceBaseUrl(service)),
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["POST", "GET", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
    credentials: true,
  }),
);

const routes = app
  .get("/", (c) => c.json({ ok: true }))
  .on(["POST", "GET"], "/auth/**", (c) => auth.handler(c.req.raw));

export { app, routes };
