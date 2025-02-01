import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";

const test2Router = new Hono().get(
  "/hello",
  zValidator(
    "query",
    z.object({
      name: z.string(),
    }),
  ),
  (c) => {
    const { name } = c.req.valid("query");
    return c.json({
      message: `Hello! ${name} from test2`,
    });
  },
);

export { test2Router };
