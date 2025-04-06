/* eslint-disable @typescript-eslint/no-misused-promises */

import type { Context } from "hono";
import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { bearerAuth } from "hono/bearer-auth";
import { streamSSE } from "hono/streaming";
import { WSContext } from "hono/ws";
import { z } from "zod";

import { authMiddleware } from "@repo/auth/auth";
import { OrderSchema } from "@repo/db-order/zod";

import type { AdminEventHandlers } from "../type";
import { emitterAdmin } from "../app";
import { env } from "../env";
import { useSSE } from "../middlewares";
import { upgradeWebSocket } from "../ws";

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
  .get(
    "/ws",
    authMiddleware({
      authBased: {
        allowedRoles: ["admin"],
      },
    }),
    upgradeWebSocket(() => {
      return {
        onOpen(_, ws) {
          console.log("Connection opened for admin");
          emitterAdmin.on("receiveDelay", (data) => {
            console.log("receiveDelay", data);
            ws.send(JSON.stringify({ event: "receiveDelay", data }));
          });
          emitterAdmin.on("manualAssignment", (data) => {
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
          console.log("Connection closed for admin");
        },
      };
    }),
  );

export { adminRouter };
