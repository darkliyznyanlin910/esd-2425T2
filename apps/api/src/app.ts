import { apiReference } from "@scalar/hono-api-reference";
import { Hono } from "hono";
import { openAPISpecs } from "hono-openapi";

import { testRouter } from "./routers/test";
import { test2Router } from "./routers/test2";

const app = new Hono();

const routes = app
  .get("/", (c) => c.json({ ok: true }))
  .route("/test", testRouter)
  .route("/test2", test2Router);

app.get(
  "/openapi",
  openAPISpecs(app, {
    documentation: {
      info: {
        title: "Hono API",
        version: "1.0.0",
        description: "Greeting API",
      },
    },
  }),
);

app.get(
  "/docs",
  apiReference({
    theme: "saturn",
    spec: { url: "/openapi" },
  }),
);

export { app, routes };
