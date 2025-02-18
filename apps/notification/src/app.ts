import { OpenAPIHono } from "@hono/zod-openapi";
import { apiReference } from "@scalar/hono-api-reference";
import { bearerAuth } from "hono/bearer-auth";
import { cors } from "hono/cors";

import { getServiceBaseUrl, SERVICES } from "@repo/service-discovery";

import { env } from "./env";
import { driverRouter } from "./routers/driver";

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
      spec: { url: `${getServiceBaseUrl("notification")}/openapi` },
    }),
  )
  .use("/driver/*", bearerAuth({ token: env.INTERNAL_COMMUNICATION_SECRET }))
  .route("/driver", driverRouter);

export { app, routes };
