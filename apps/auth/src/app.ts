import { OpenAPIHono } from "@hono/zod-openapi";
import { cors } from "hono/cors";

import { getServiceBaseUrl, SERVICES } from "@repo/service-discovery";

import { auth } from "./auth";
import { HonoExtension } from "./type";
import { userRouter } from "./user";

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
  .get("/", (c) => c.json({ ok: true, service: "auth" }))
  .on(["POST", "GET"], "/auth/**", async (c) => {
    return auth.handler(c.req.raw);
  })
  .route("/user", userRouter);

export { app, routes };
