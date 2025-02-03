import { Hono } from "hono";

import { testRouter } from "./routers/test";
import { test2Router } from "./routers/test2";

const app = new Hono();

const routes = app
  .get("/", (c) => c.json({ ok: true }))
  .route("/test", testRouter)
  .route("/test2", test2Router);

export { app, routes };
