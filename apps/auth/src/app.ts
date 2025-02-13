import { OpenAPIHono } from "@hono/zod-openapi";
import { apiReference } from "@scalar/hono-api-reference";
import { cors } from "hono/cors";

import { getServiceBaseUrl, SERVICES } from "@repo/service-discovery";

import { auth, authMiddleware } from "./auth";
import { HonoExtension } from "./type";

const app = new OpenAPIHono<HonoExtension>();

const routes = app
  .get("/", (c) => c.json({ ok: true }))
  .on(["POST", "GET"], "/**", async (c) => {
    return auth.handler(c.req.raw);
  });

// app.use(
//   "/auth/**", // or replace with "*" to enable cors for all routes
//   cors({
//     origin: SERVICES.map((service) => getServiceBaseUrl(service)),
//     allowHeaders: ["Content-Type", "Authorization"],
//     allowMethods: ["POST", "GET", "OPTIONS"],
//     exposeHeaders: ["Content-Length"],
//     maxAge: 600,
//     credentials: true,
//   }),
// );

// const routes = app
//   .get("/", (c) => c.json({ ok: true }))
//   .on(["POST", "GET"], "/auth/**", (c) => auth.handler(c.req.raw));

export { app, routes };
