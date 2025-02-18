import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { z } from "zod";

import { OrderSchema } from "@repo/db-order/zod";

import { ioServer } from "..";

const driverRouter = new OpenAPIHono()
  .openapi(
    createRoute({
      method: "post",
      request: {
        body: {
          content: {
            "application/json": {
              schema: OrderSchema,
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
                success: z.boolean(),
              }),
            },
          },
          description: "Success",
        },
        403: {
          description: "Unauthorized",
        },
      },
    }),
    (c) => {
      const input = c.req.valid("json");
      ioServer.emit("broadcastOrder", input);
      return c.json({ success: true });
    },
  )
  .openapi(
    createRoute({
      method: "post",
      path: "/invalidate",
      request: {
        body: {
          content: {
            "application/json": {
              schema: OrderSchema,
            },
          },
        },
      },
      responses: {
        200: {
          description: "Success",
        },
      },
    }),
    async (c) => {
      const input = c.req.valid("json");
      ioServer.emit("invalidateOrder", input.id);
      return c.json({ success: true });
    },
  );

export { driverRouter };
