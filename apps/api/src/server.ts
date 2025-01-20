import type { Express } from "express";
import { json, urlencoded } from "body-parser";
import cors from "cors";
import express from "express";
import morgan from "morgan";

import { db } from "@repo/db-user";

export const createServer = (): Express => {
  const app = express();
  app
    .disable("x-powered-by")
    .use(morgan("dev"))
    .use(urlencoded({ extended: true }))
    .use(json())
    .use(cors({ origin: "*" }))
    .get("/", (_, res) => {
      return res.json({ ok: true });
    })
    .get("/users", async (_, res) => {
      const users = await db.user.findMany();
      return res.json({ users });
    });

  return app;
};
