/* eslint-disable @typescript-eslint/no-misused-promises */

import type { Context } from "hono";
import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { bearerAuth } from "hono/bearer-auth";
import { streamSSE } from "hono/streaming";
import { z } from "zod";

import { authMiddleware } from "@repo/auth/auth";
import { OrderSchema } from "@repo/db-order/zod";

import type { EventHandlers } from "../type";
import { emitter } from "../app";
import { env } from "../env";
import { useSSE } from "../middlewares";

const driverRouter = new OpenAPIHono()
  .openapi(
    createRoute({
      method: "post",
      middleware: [bearerAuth({ token: env.INTERNAL_COMMUNICATION_SECRET })],
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
      emitter.emit("broadcastOrder", input);
      return c.json({ success: true });
    },
  )
  .openapi(
    createRoute({
      method: "post",
      path: "/invalidate",
      middleware: [bearerAuth({ token: env.INTERNAL_COMMUNICATION_SECRET })],
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
      emitter.emit("invalidateOrder", input.id);
      return c.json({ success: true });
    },
  )
  .openapi(
    createRoute({
      method: "get",
      path: "/sse",
      middleware: [
        useSSE,
        authMiddleware({
          authBased: {
            allowedRoles: ["driver"],
          },
        }),
      ],
      responses: {
        200: {
          description: "Success",
        },
      },
    }),
    async (c) => {
      let isAborted = false;
      return streamSSE(c as unknown as Context, async (stream) => {
        const eventHandler =
          (eventName: keyof EventHandlers) =>
          async (data: Parameters<EventHandlers[keyof EventHandlers]>[0]) => {
            await stream.writeSSE({
              data: typeof data === "string" ? data : JSON.stringify(data),
              event: eventName,
            });
          };

        stream.onAbort(() => {
          emitter.removeListener(
            "broadcastOrder",
            eventHandler("broadcastOrder"),
          );
          emitter.removeListener(
            "invalidateOrder",
            eventHandler("invalidateOrder"),
          );
          console.log("Connection aborted");
          isAborted = true;
        });

        emitter.on("broadcastOrder", eventHandler("broadcastOrder"));
        emitter.on("invalidateOrder", eventHandler("invalidateOrder"));

        while (!isAborted) {
          await stream.sleep(500);
        }
      });
    },
  );

export { driverRouter };
