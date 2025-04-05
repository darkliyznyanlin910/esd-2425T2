import { OpenAPIHono } from "@hono/zod-openapi";
import { apiReference } from "@scalar/hono-api-reference";
import { cors } from "hono/cors";

import type { HonoExtension } from "@repo/auth/type";
import { authMiddleware } from "@repo/auth/auth";
import { getServiceBaseUrl, SERVICES } from "@repo/service-discovery";

import { chatRouter } from "./chatRouter";

const app = new OpenAPIHono<HonoExtension>();
app.use(
  "*",
  cors({
    origin: SERVICES.map((service) => getServiceBaseUrl(service)),
    allowHeaders: ["Content-Type", "Authorization", "Origin"],
    allowMethods: ["POST", "GET", "PUT", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
    credentials: true,
  }),
);

const routes = app
  .doc("/openapi", {
    openapi: "3.0.0",
    info: {
      title: "Template API",
      version: "1.0.0",
      description: "Template API",
    },
  })
  .get("/", (c) => c.json({ ok: true, service: "chatbot-backend" }))
  .get(
    "/docs",
    apiReference({
      theme: "saturn",
      spec: { url: `${getServiceBaseUrl("chatbot")}/openapi` },
    }),
  )
  .use(
    authMiddleware({
      authBased: {
        allowedRoles: ["client", "admin", "driver"],
      },
    }),
  )
  .route("/chat", chatRouter);

export { app, routes };
