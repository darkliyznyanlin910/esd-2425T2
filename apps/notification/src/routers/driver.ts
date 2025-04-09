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
      console.log("Send order", input);
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
      console.log("Invalidate order", input);
      emitterDriver.emit("invalidateOrder", input);
      return c.json({ success: true });
    },
  )
  .openapi(
    createRoute({
      method: "post",
      path: "/manualAssign",
      middleware: [bearerAuth({ token: env.INTERNAL_COMMUNICATION_SECRET })],
      request: {
        body: {
          content: {
            "application/json": {
              schema: z.object({
                order: OrderSchema,
                driverId: z.string().optional(),
              }),
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
      console.log("Manual Assignment", input);
      if (input.driverId) {
        console.log("Driver ID is present:", input.driverId);
      } else {
        console.log(
          "WARNING: Driver ID is missing from manual assignment payload!",
        );
      }
      emitterDriver.emit("manualAssignment", input);
      return c.json({ success: true });
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
      return {
        onOpen(_, ws) {
          console.log("Connection opened for driver");
          emitterDriver.on("broadcastOrder", (data) => {
            console.log("broadcastOrder", data);
            ws.send(JSON.stringify({ event: "broadcastOrder", data }));
          });
          emitterDriver.on("invalidateOrder", (data) => {
            console.log("invalidateOrder", data);
            ws.send(JSON.stringify({ event: "invalidateOrder", data }));
          });
          emitterDriver.on("manualAssignment", (data) => {
            console.log("manualAssignment", data);
            ws.send(JSON.stringify({ event: "manualAssignment", data }));
          });
        },
        onMessage(evt, ws) {
          if (evt.data === "ping") {
            console.log("ping");
            ws.send("pong");
          }
        },
        onClose() {
          console.log("Connection closed for driver");
        },
      };
    }),
  );

export { driverRouter };
