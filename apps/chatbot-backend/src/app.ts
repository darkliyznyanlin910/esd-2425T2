import { OpenAPIHono } from "@hono/zod-openapi";
import { apiReference } from "@scalar/hono-api-reference";
import { cors } from "hono/cors";

import type { HonoExtension } from "@repo/auth/type";
import { authMiddleware } from "@repo/auth/auth";
import { getServiceBaseUrl } from "@repo/service-discovery";

import { chatRouter } from "./chatRouter";

const app = new OpenAPIHono<HonoExtension>();

app.use(
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
  .doc("/openapi", {
    openapi: "3.0.0",
    info: {
      title: "Template API",
      version: "1.0.0",
      description: "Template API",
    },
  })
  .get("/", (c) => c.json({ ok: true }))
  .get(
    "/docs",
    apiReference({
      theme: "saturn",
      spec: { url: `${getServiceBaseUrl("chatbot")}/openapi` },
    }),
  )
  .use(authMiddleware(["client"]))
  .route("/chat", chatRouter);

export { app, routes };
