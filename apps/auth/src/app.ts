import { OpenAPIHono } from "@hono/zod-openapi";
import { apiReference } from "@scalar/hono-api-reference";
import { cors } from "hono/cors";

import { getServiceBaseUrl, SERVICES } from "@repo/service-discovery";

import { auth } from "./auth";
import { userRouter } from "./routers/user";
import { HonoExtension } from "./type";

const app = new OpenAPIHono<HonoExtension>();

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
  .doc("/openapi", {
    openapi: "3.0.0",
    servers: [
      {
        url: getServiceBaseUrl("auth"),
      },
    ],
    info: {
      title: "Auth API",
      version: "1.0.0",
      description: "Auth API",
    },
  })
  .get("/", (c) => c.json({ ok: true, service: "auth" }))
  .get(
    "/docs",
    apiReference({
      theme: "saturn",
      spec: { url: `${getServiceBaseUrl("auth")}/openapi` },
    }),
  )
  .on(["POST", "GET"], "/auth/**", async (c) => {
    return auth.handler(c.req.raw);
  })
  .route("/user", userRouter);

export { app, routes };
