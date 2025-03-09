import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { bearerAuth } from "hono/bearer-auth";
import { z } from "zod";

import { authMiddleware } from "@repo/auth/auth";
import { HonoExtension } from "@repo/auth/type";
import { connectToTemporal } from "@repo/temporal-common/temporal-client";
import {
  deliveredSignal,
  driverFoundSignal,
  pickedUpSignal,
} from "@repo/temporal-workflows";

import { env } from "../env";

const temporalClient = await connectToTemporal();

const driverRouter = new OpenAPIHono<HonoExtension>().openapi(
  createRoute({
    method: "post",
    path: "/:state",
    middleware: [
      authMiddleware({
        authBased: {
          allowedRoles: ["driver"],
        },
        bearer: {
          tokens: [env.INTERNAL_COMMUNICATION_SECRET],
        },
      }),
    ] as const,
    request: {
      body: {
        content: {
          "application/json": {
            schema: z.object({
              orderId: z.string(),
              driverId: z.string().optional(),
            }),
          },
        },
      },
      params: z.object({
        state: z.enum(["driverFound", "pickedUp", "delivered"]),
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
        description: "Create order",
      },
      400: {
        description: "User ID is required",
      },
      401: {
        description: "Unauthorized",
      },
    },
  }),
  async (c) => {
    const { orderId, driverId } = c.req.valid("json");
    const { state } = c.req.valid("param");
    if (state === "driverFound") {
      await temporalClient.workflow
        .getHandle(orderId)
        .signal(driverFoundSignal, driverId);
    } else if (state === "pickedUp") {
      await temporalClient.workflow.getHandle(orderId).signal(pickedUpSignal);
    } else if (state === "delivered") {
      await temporalClient.workflow.getHandle(orderId).signal(deliveredSignal);
    }
    return c.json({ message: "ok" });
  },
);

export { driverRouter };
