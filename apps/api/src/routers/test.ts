import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { z } from "zod";

import { taskQueue } from "@repo/temporal-common";
import { connectToTemporal } from "@repo/temporal-common/temporal-client";
import { order } from "@repo/temporal-workflows";

const temporalClient = await connectToTemporal();

const testRouter = new OpenAPIHono()
  .openapi(
    createRoute({
      method: "get",
      path: "/",
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
      return c.json({ message: "Hello, world!" });
    },
  )
  .openapi(
    createRoute({
      method: "get",
      path: "/temporal/{productId}/{orderId}",
      request: {
        params: z.object({
          productId: z.string(),
          orderId: z.string(),
        }),
      },
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
    async (c) => {
      const input = c.req.valid("param");
      await temporalClient.workflow.start(order, {
        workflowId: input.orderId,
        args: [input.productId],
        taskQueue,
      });
      return c.json({ message: "Hello, world!" });
    },
  );

export { testRouter };
