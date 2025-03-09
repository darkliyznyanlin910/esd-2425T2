import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { bearerAuth } from "hono/bearer-auth";
import { z } from "zod";

import { authMiddleware } from "@repo/auth/auth";
import { HonoExtension } from "@repo/auth/type";
import { db } from "@repo/db-order";
import { OrderSchema } from "@repo/db-order/zod";
import { paymentInformationSchema, taskQueue } from "@repo/temporal-common";
import { connectToTemporal } from "@repo/temporal-common/temporal-client";
import { delivery, order } from "@repo/temporal-workflows";

import { env } from "../env";
import { generateDisplayId } from "../utils";

const temporalClient = await connectToTemporal();

const orderRouter = new OpenAPIHono<HonoExtension>()
  .openapi(
    createRoute({
      method: "post",
      path: "/",
      middleware: [
        authMiddleware({
          authBased: {
            allowedRoles: ["client"],
          },
          bearer: {
            tokens: [env.INTERNAL_COMMUNICATION_SECRET],
          },
        }),
      ] as const,
      description: "Create order",
      request: {
        body: {
          content: {
            "application/json": {
              schema: z.object({
                order: OrderSchema.pick({
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
                userId: z.string().optional(),
              }),
            },
          },
        },
      },
      responses: {
        200: {
          content: {
            "application/json": {
              schema: OrderSchema,
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
      const { order: orderDetails, userId: userIdFromRequest } =
        c.req.valid("json");

      const user = c.get("user");

      let userId: string | undefined = undefined;

      if (!!user && user.role === "client" && !c.req.header("Authorization")) {
        userId = user.id;
      }

      console.log(db);

      const existingOrders = await db.order.count({
        where: {
          userId: userId ?? userIdFromRequest,
        },
      });

      const generatedDisplayId = generateDisplayId(existingOrders + 1);

      if (!userId && !userIdFromRequest) {
        return c.json({ error: "User ID is required" }, 400);
      }

      const createdOrder = await db.order.create({
        data: {
          ...orderDetails,
          displayId: generatedDisplayId,
          userId: userId ?? userIdFromRequest!,
        },
      });

      await temporalClient.workflow.start(order, {
        workflowId: createdOrder.id,
        args: [createdOrder],
        taskQueue,
      });

      return c.json(createdOrder);
    },
  )
  .openapi(
    createRoute({
      method: "get",
      path: "/:id/process",
      description: "[Internal] Start Delivery Process",
      middleware: [
        bearerAuth({ token: env.INTERNAL_COMMUNICATION_SECRET }),
      ] as const,
      request: {
        params: z.object({
          id: z.string(),
        }),
      },
      responses: {
        200: {
          description: "Process order",
        },
        401: {
          description: "Unauthorized",
        },
        404: {
          description: "Order not found",
        },
      },
    }),
    async (c) => {
      const { id } = c.req.valid("param");

      const order = await db.order.findUnique({
        where: {
          id,
        },
      });

      if (!order) {
        return c.json({ error: "Order not found" }, 404);
      }

      if (order.orderStatus == "paymentPending") {
        return c.json(
          { error: "Order is still in payment pending state" },
          400,
        );
      }

      await temporalClient.workflow.start(delivery, {
        workflowId: order.id,
        args: [order],
        taskQueue,
      });

      return c.json({ message: "Order processed" });
    },
  )
  .openapi(
    createRoute({
      method: "post",
      path: "/:id",
      description: "[Internal] Update order status",
      middleware: [
        bearerAuth({ token: env.INTERNAL_COMMUNICATION_SECRET }),
      ] as const,
      request: {
        params: z.object({
          id: z.string(),
        }),
        body: {
          content: {
            "application/json": {
              schema: OrderSchema.pick({
                orderStatus: true,
              }),
            },
          },
        },
      },
      responses: {
        200: {
          content: {
            "application/json": {
              schema: OrderSchema,
            },
          },
          description: "Update order status",
        },
        401: {
          description: "Unauthorized",
        },
      },
    }),
    async (c) => {
      const input = c.req.valid("json");
      const { id } = c.req.valid("param");

      const order = await db.order.update({
        where: {
          id,
        },
        data: {
          orderStatus: input.orderStatus,
        },
      });

      return c.json(order);
    },
  )
  .openapi(
    createRoute({
      method: "get",
      path: "/:id",
      description: "Get order by id",
      middleware: [
        authMiddleware({
          authBased: {
            allowedRoles: ["client", "admin"],
          },
          bearer: {
            tokens: [env.INTERNAL_COMMUNICATION_SECRET],
          },
        }),
      ] as const,
      request: {
        params: z.object({
          id: z.string(),
        }),
      },
      responses: {
        200: {
          content: {
            "application/json": {
              schema: OrderSchema,
            },
          },
          description: "Get order by id",
        },
        401: {
          description: "Unauthorized",
        },
        404: {
          description: "Order not found",
        },
      },
    }),
    async (c) => {
      const { id } = c.req.valid("param");
      const user = c.get("user");

      let userId: string | undefined = undefined;
      // Only filter by userId for regular clients
      if (!!user && user.role === "client" && !c.req.header("Authorization")) {
        userId = user.id;
      }

      const order = await db.order.findUnique({
        where: {
          id,
          userId,
        },
      });

      if (!order) {
        return c.json({ error: "Order not found" }, 404);
      }

      return c.json(order);
    },
  )
  .openapi(
    createRoute({
      method: "get",
      path: "/",
      description: "Get all orders",
      middleware: [
        authMiddleware({
          authBased: {
            allowedRoles: ["client", "admin"],
          },
          bearer: {
            tokens: [env.INTERNAL_COMMUNICATION_SECRET],
          },
        }),
      ] as const,
      request: {
        query: z.object({
          take: z.number().default(10),
          page: z.number().default(1),
        }),
      },
      responses: {
        200: {
          content: {
            "application/json": {
              schema: z.array(OrderSchema),
            },
          },
          description: "Get all orders",
        },
        401: {
          description: "Unauthorized",
        },
        404: {
          description: "Order not found",
        },
      },
    }),
    async (c) => {
      const { take, page } = c.req.valid("query");
      const user = c.get("user")!;

      let userId: string | undefined = undefined;
      // Only filter by userId for regular clients
      if (user.role === "client" && !c.req.header("Authorization")) {
        userId = user.id;
      }

      const orders = await db.order.findMany({
        where: {
          userId,
        },
        take,
        skip: (page - 1) * take,
      });

      return c.json(orders);
    },
  );

export { orderRouter };
