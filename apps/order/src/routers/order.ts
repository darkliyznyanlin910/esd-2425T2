import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { z } from "zod";

import { HonoExtension } from "@repo/auth/type";
import { db } from "@repo/db-order";
import { OrderSchema } from "@repo/db-order/zod";

import { generateDisplayId } from "../utils";

const orderRouter = new OpenAPIHono<HonoExtension>().openapi(
  createRoute({
    method: "post",
    path: "/",
    request: {
      body: {
        content: {
          "application/json": {
            schema: OrderSchema.pick({
              fromAddressLine1: true,
              fromAddressLine2: true,
              fromCity: true,
              fromState: true,
              fromZipCode: true,
              fromCountry: true,
              toAddressLine1: true,
              toAddressLine2: true,
              toCity: true,
              toState: true,
              toZipCode: true,
              toCountry: true,
            }),
          },
        },
      },
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
    const input = c.req.valid("json");

    const session = c.get("session")!;

    const existingOrders = await db.order.findMany({
      where: {
        userId: session.userId,
      },
    });

    const generatedDisplayId = generateDisplayId(existingOrders.length + 1);

    const order = await db.order.create({
      data: {
        ...input,
        displayId: generatedDisplayId,
        userId: session.userId,
      },
    });

    return c.json({ message: "Hello, world!" });
  },
);

export { orderRouter };
