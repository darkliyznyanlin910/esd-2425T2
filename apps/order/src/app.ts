import { OpenAPIHono } from "@hono/zod-openapi";
import { apiReference } from "@scalar/hono-api-reference";
import { cors } from "hono/cors";

import { getServiceBaseUrl, SERVICES } from "@repo/service-discovery";

import { externalRouter } from "./routers/external";
import { orderRouter } from "./routers/order";
import { paymentRouter } from "./routers/payment";

const app = new OpenAPIHono();

app.use(
  cors({
    origin: [
      ...SERVICES.map((service) => getServiceBaseUrl(service)),
      "https://esd-order.johnnyknl.me",
    ],
    allowHeaders: ["Content-Type", "Authorization", "X-Api-Key", "X-User-Id"],
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
      title: "ESD Order API",
      version: "1.0.0",
      description: "ESD Order API",
    },
  })
  .get("/", (c) => c.json({ ok: true, service: "order" }))
  .get(
    "/docs",
    apiReference({
      theme: "saturn",
      spec: { url: `${getServiceBaseUrl("order")}/openapi` },
    }),
  )
  .route("/payment", paymentRouter)
  .route("/order", orderRouter)
  .get(
    "/external/docs",
    apiReference({
      theme: "saturn",
      spec: { url: `https://esd-order.johnnyknl.me/external/openapi` },
    }),
  )
  .route("/external", externalRouter);

export { app, routes };
