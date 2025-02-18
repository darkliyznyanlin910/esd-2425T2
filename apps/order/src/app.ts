import { OpenAPIHono } from "@hono/zod-openapi";
import { apiReference } from "@scalar/hono-api-reference";
import { cors } from "hono/cors";

import { authMiddleware } from "@repo/auth/auth";
import { getServiceBaseUrl, SERVICES } from "@repo/service-discovery";

import { orderRouter } from "./routers/order";

const app = new OpenAPIHono();

app.use(
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
      spec: { url: `${getServiceBaseUrl("order")}/openapi` },
    }),
  )
  .route("/order", orderRouter);

export { app, routes };
