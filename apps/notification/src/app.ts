import { OpenAPIHono } from "@hono/zod-openapi";
import { apiReference } from "@scalar/hono-api-reference";
import { cors } from "hono/cors";
import { TypedEmitter } from "tiny-typed-emitter";

import { getServiceBaseUrl, SERVICES } from "@repo/service-discovery";

import type { AdminEventHandlers, DriverEventHandlers } from "./type";
import { adminRouter } from "./routers/admin";
import { driverRouter } from "./routers/driver";

const app = new OpenAPIHono();

app.use(
  "*",
  cors({
    origin: SERVICES.map((service) => getServiceBaseUrl(service)),
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["POST", "GET", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
    credentials: true,
  }),
);

export const emitterDriver = new TypedEmitter<DriverEventHandlers>();
export const emitterAdmin = new TypedEmitter<AdminEventHandlers>();

const routes = app
  .doc("/openapi", {
    openapi: "3.0.0",
    info: {
      title: "Template API",
      version: "1.0.0",
      description: "Template API",
    },
  })
  .get("/", (c) => c.json({ ok: true, service: "notification" }))
  .get(
    "/docs",
    apiReference({
      theme: "saturn",
      spec: { url: `${getServiceBaseUrl("notification")}/openapi` },
    }),
  )
  .route("/driver", driverRouter)
  .route("/admin", adminRouter);

export { app, routes };
