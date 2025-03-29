/* eslint-disable @typescript-eslint/no-misused-promises */

import type { Context } from "hono";
import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { bearerAuth } from "hono/bearer-auth";
import { streamSSE } from "hono/streaming";
import { z } from "zod";

import { authMiddleware } from "@repo/auth/auth";
import { OrderSchema } from "@repo/db-order/zod";

import type { AdminEventHandlers } from "../type";
import { emitterAdmin } from "../app";
import { env } from "../env";
import { useSSE } from "../middlewares";

const adminRouter = new OpenAPIHono()
  .openapi(
    createRoute({
      method: "post",
      path: "/sendDelay",
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
      emitterAdmin.emit("receiveDelay", input);
      return c.json({ success: true });
    },
  )
  .openapi(
    createRoute({
      method: "post",
      path: "/sendReassignment",
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
      emitterAdmin.emit("manualAssignment", input);
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
            allowedRoles: ["admin"],
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
          (eventName: keyof AdminEventHandlers) =>
          async (
            data: Parameters<AdminEventHandlers[keyof AdminEventHandlers]>[0],
          ) => {
            await stream.writeSSE({
              data: typeof data === "string" ? data : JSON.stringify(data),
              event: eventName,
            });
          };

        stream.onAbort(() => {
          emitterAdmin.removeListener(
            "receiveDelay",
            eventHandler("receiveDelay"),
          );
          emitterAdmin.removeListener(
            "manualAssignment",
            eventHandler("manualAssignment"),
          );
          console.log("Connection aborted");
          isAborted = true;
        });

        emitterAdmin.on("receiveDelay", eventHandler("receiveDelay"));
        emitterAdmin.on("manualAssignment", eventHandler("manualAssignment"));

        while (!isAborted) {
          await stream.sleep(500);
        }
      });
    },
  );

export { adminRouter };
