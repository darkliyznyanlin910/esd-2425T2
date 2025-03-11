import { OpenAPIHono } from "@hono/zod-openapi";
import { apiReference } from "@scalar/hono-api-reference";
import { cors } from "hono/cors";

import { getServiceBaseUrl } from "@repo/service-discovery";

import { orderRouter } from "./routers/order";
import { paymentRouter } from "./routers/payment";

const app = new OpenAPIHono();

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
  .route("/order", orderRouter);

export { app, routes };
