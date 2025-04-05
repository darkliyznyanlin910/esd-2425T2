/* eslint-disable @typescript-eslint/no-misused-promises */

import type { Context } from "hono";
import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { bearerAuth } from "hono/bearer-auth";
import { streamSSE } from "hono/streaming";
import { WSContext } from "hono/ws";
import { z } from "zod";

import { authMiddleware } from "@repo/auth/auth";
import { OrderSchema } from "@repo/db-order/zod";

import type { DriverEventHandlers } from "../type";
import { emitterDriver } from "../app";
import { env } from "../env";
import { useSSE } from "../middlewares";
import { upgradeWebSocket } from "../ws";

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
      emitterDriver.emit("broadcastOrder", input);
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
      emitterDriver.emit("invalidateOrder", input);
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
          (eventName: keyof DriverEventHandlers) =>
          async (
            data: Parameters<DriverEventHandlers[keyof DriverEventHandlers]>[0],
          ) => {
            await stream.writeSSE({
              data: typeof data === "string" ? data : JSON.stringify(data),
              event: eventName,
            });
          };

        stream.onAbort(() => {
          emitterDriver.removeListener(
            "broadcastOrder",
            eventHandler("broadcastOrder"),
          );
          emitterDriver.removeListener(
            "invalidateOrder",
            eventHandler("invalidateOrder"),
          );
          console.log("Connection aborted");
          isAborted = true;
        });

        emitterDriver.on("broadcastOrder", eventHandler("broadcastOrder"));
        emitterDriver.on("invalidateOrder", eventHandler("invalidateOrder"));

        while (!isAborted) {
          await stream.sleep(500);
        }
      });
    },
  )
  .get(
    "/ws",
    authMiddleware({
      authBased: {
        allowedRoles: ["admin", "driver"],
      },
    }),
    upgradeWebSocket(() => {
      const eventHandler =
        (eventName: keyof DriverEventHandlers, ws: WSContext) =>
        async (
          data: Parameters<DriverEventHandlers[keyof DriverEventHandlers]>[0],
        ) => {
          console.log("Sending event", eventName, data);
          ws.send(
            JSON.stringify({
              event: eventName,
              data,
            }),
          );
        };
      return {
        onOpen(_, ws) {
          console.log("Connection opened for driver");
          emitterDriver.on(
            "broadcastOrder",
            eventHandler("broadcastOrder", ws),
          );
          emitterDriver.on(
            "invalidateOrder",
            eventHandler("invalidateOrder", ws),
          );
        },
        onClose() {
          console.log("Connection closed for driver");
        },
      };
    }),
  );

export { driverRouter };
