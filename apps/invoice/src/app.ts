import { OpenAPIHono } from "@hono/zod-openapi";
import { apiReference } from "@scalar/hono-api-reference";
import { cors } from "hono/cors";

import { getServiceBaseUrl, SERVICES } from "@repo/service-discovery";

import { invoiceRouter } from "./routers/invoice";

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
    servers: [
      {
        url: getServiceBaseUrl("invoice"),
      },
    ],
    info: {
      title: "Invoice API",
      version: "1.0.0",
      description: "ESD Invoice API",
    },
  })
  .get("/", (c) => c.json({ ok: true, service: "invoice" }))
  .get(
    "/docs",
    apiReference({
      theme: "saturn",
      spec: { url: `${getServiceBaseUrl("invoice")}/openapi` },
    }),
  )
  .route("/invoice", invoiceRouter);

export { app, routes };
