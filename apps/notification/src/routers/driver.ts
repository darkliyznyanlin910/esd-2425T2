import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { z } from "zod";

import { ioServer } from "..";
import { orderInfoSchema } from "../type";

const driverRouter = new OpenAPIHono().openapi(
  createRoute({
    method: "post",
    request: {
      body: {
        content: {
          "application/json": {
            schema: orderInfoSchema,
          },
        },
      },
    },
    path: "/send",
    responses: {
      200: {
        content: {
          "application/json": {
            schema: z.object({
              message: z.string(),
            }),
          },
        },
        description: "Test response",
      },
      401: {
        description: "Unauthorized",
      },
    },
  }),
  (c) => {
    const input = c.req.valid("json");
    ioServer.emit("broadcastOrder", input);
    return c.json({ message: "Hello, world!" });
  },
);

export { driverRouter };
