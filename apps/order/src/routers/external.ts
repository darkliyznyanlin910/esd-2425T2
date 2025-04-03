import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { z } from "zod";

import { authMiddleware } from "@repo/auth/auth";
import { db } from "@repo/db-order";
import { OrderSchema } from "@repo/db-order/zod";
import { getServiceBaseUrl } from "@repo/service-discovery";

// import { taskQueue } from "@repo/temporal-common";

// import { connectToTemporal } from "@repo/temporal-common/temporal-client";
// import { delivery } from "@repo/temporal-workflows";

import { env } from "../env";
import {
  generateDisplayId,
  getAddress,
  getGeocoding,
  getOptimalRoute,
} from "../utils";

const externalRouter = new OpenAPIHono()
  .doc("/openapi", {
    openapi: "3.0.0",
    info: {
      title: "ESD External Order API",
      version: "1.0.0",
      description: "`x-api-key` and `x-user-id` are required for all requests",
    },
    servers: [
      {
        url: `https://esd-order.johnnyknl.me/external`,
        description: "ESD External Order API (Production)",
      },
      {
        url: `${getServiceBaseUrl("order")}/external`,
        description: "ESD External Order API (Development)",
      },
    ],
  })
  .openapi(
    createRoute({
      method: "get",
      path: "/order/:id",
      request: {
        params: z.object({
          id: z.string(),
        }),
        headers: z.object({
          "x-api-key": z.string(),
          "x-user-id": z.string(),
        }),
      },
      description: "Get order by id",
      middleware: [
        authMiddleware({
          bearer: {
            tokens: [env.INTERNAL_COMMUNICATION_SECRET],
          },
        }),
      ],
      responses: {
        200: {
          description: "OK",
          content: {
            "application/json": {
              schema: OrderSchema,
            },
          },
        },
        404: {
          description: "Order not found",
        },
      },
    }),
    async (c) => {
      const { id } = c.req.valid("param");
      const { "x-user-id": userId, "x-api-key": apiKey } =
        c.req.valid("header");

      const order = await db.order.findUnique({
        where: {
          id,
          userId: `${apiKey}!@#$%^&*${userId}`,
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
      path: "/orderTracking/:id",
      request: {
        params: z.object({
          id: z.string(),
        }),
        headers: z.object({
          "x-api-key": z.string(),
          "x-user-id": z.string(),
        }),
      },
      description: "Get Timestamps of order status of orderId",
      middleware: [
        authMiddleware({
          bearer: {
            tokens: [env.INTERNAL_COMMUNICATION_SECRET],
          },
        }),
      ],
      responses: {
        200: {
          description: "OK",
          content: {
            "application/json": {
              schema: OrderSchema,
            },
          },
        },
        404: {
          description: "Order not found",
        },
      },
    }),
    async (c) => {
      const { id } = c.req.valid("param");
      const { "x-user-id": userId, "x-api-key": apiKey } =
        c.req.valid("header");

      const order = await db.orderTrackingRecord.findMany({
        where: {
          orderId: id,
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
      method: "post",
      path: "/order",
      request: {
        body: {
          content: {
            "application/json": {
              schema: z.object({
                order: OrderSchema.pick({
                  orderDetails: true,
                  fromAddressLine1: true,
                  fromAddressLine2: true,
                  fromZipCode: true,
                  toAddressLine1: true,
                  toAddressLine2: true,
                  toZipCode: true,
                  userId: true,
                }),
              }),
            },
          },
        },
        headers: z.object({
          "x-api-key": z.string(),
          "x-user-id": z.string(),
        }),
      },
      middleware: [
        authMiddleware({
          bearer: {
            tokens: [env.INTERNAL_COMMUNICATION_SECRET],
          },
        }),
      ],
      description: "Create order",
      responses: {
        200: {
          description: "OK",
          content: {
            "application/json": {
              schema: OrderSchema,
            },
          },
        },
        400: {
          description: "Bad Request",
        },
        401: {
          description: "Unauthorized",
        },
      },
    }),
    async (c) => {
      const { order } = c.req.valid("json");
      console.log("order-body", order);
      const { "x-user-id": userId, "x-api-key": apiKey } =
        c.req.valid("header");

      const existingOrders = await db.order.count({
        where: {
          userId: `${apiKey}!@#$%^&*${userId}`,
        },
      });

      const generatedDisplayId = generateDisplayId(existingOrders + 1);
      const createdOrder = await db.order.create({
        data: {
          ...order,
          displayId: generatedDisplayId,
          userId: `${apiKey}!@#$%^&*${userId}`,
        },
      });

      // const fromGeocoding = await getGeocoding(
      //   getAddress(createdOrder, "from"),
      // );

      // if (fromGeocoding.error) {
      //   console.error(fromGeocoding.error);
      // }

      // const toGeocoding = await getGeocoding(getAddress(createdOrder, "to"));

      // if (toGeocoding.error) {
      //   console.error(toGeocoding.error);
      // }

      // // Process order
      // const temporalClient = await connectToTemporal();
      // await temporalClient.workflow.start(delivery, {
      //   workflowId: createdOrder.id,
      //   args: [createdOrder],
      //   taskQueue,
      // });

      return c.json({ order: createdOrder });
    },
  )
  .openapi(
    createRoute({
      method: "get",
      path: "/order",
      request: {
        headers: z.object({
          "x-api-key": z.string(),
          "x-user-id": z.string().optional(),
        }),
        query: z.object({
          byApiKey: z.enum(["true", "false"]).default("false"),
        }),
      },
      middleware: [
        authMiddleware({
          bearer: {
            tokens: [env.INTERNAL_COMMUNICATION_SECRET],
          },
        }),
      ],
      description: "Get orders",
      responses: {
        200: {
          description: "OK",
          content: {
            "application/json": {
              schema: z.array(OrderSchema),
            },
          },
        },
        401: {
          description: "Unauthorized",
        },
      },
    }),
    async (c) => {
      const { "x-user-id": userId, "x-api-key": apiKey } =
        c.req.valid("header");
      const { byApiKey } = c.req.valid("query");

      if (byApiKey === "false" && !userId) {
        return c.json(
          { error: "`x-user-id` is required for non-API key requests" },
          401,
        );
      }

      const orders = await db.order.findMany({
        where: {
          userId:
            byApiKey === "true"
              ? {
                  startsWith: `${apiKey}!@#$%^&*`,
                }
              : `${apiKey}!@#$%^&*${userId}`,
        },
      });
      return c.json({ orders });
    },
  )
  .openapi(
    createRoute({
      method: "post",
      path: "/route",
      request: {
        body: {
          content: {
            "application/json": {
              schema: z.object({
                orderIds: z.array(z.string()),
              }),
            },
          },
        },
        headers: z.object({
          "x-api-key": z.string(),
          "x-user-id": z.string(),
        }),
      },
      middleware: [
        authMiddleware({
          bearer: {
            tokens: [env.INTERNAL_COMMUNICATION_SECRET],
          },
        }),
      ],
      description: "Route order: returns orders in optimal order",
      responses: {
        200: {
          description: "OK",
          content: {
            "application/json": {
              schema: z.array(OrderSchema),
            },
          },
        },
        400: {
          description: "Bad Request",
        },
        401: {
          description: "Unauthorized",
        },
      },
    }),
    async (c) => {
      const { orderIds } = c.req.valid("json");
      const { "x-user-id": userId, "x-api-key": apiKey } =
        c.req.valid("header");

      const orders = await db.order.findMany({
        where: {
          id: { in: orderIds },
          userId: `${apiKey}!@#$%^&*${userId}`,
        },
      });

      if (orders.length < 2) {
        return c.json(
          {
            error: "Need at least 2 orders to get optimal routing",
          },
          400,
        );
      }

      if (
        orders.some(
          (order) => order.fromAddressLine1 !== orders[0]!.fromAddressLine1,
        )
      ) {
        return c.json(
          {
            error: "Orders must have same origin to get optimal routing",
          },
          400,
        );
      }

      const geocodedOrders = await Promise.all(
        orders.map(async (order) => {
          try {
            const fromGeocoding = await getGeocoding(getAddress(order, "from"));

            const toGeocoding = await getGeocoding(getAddress(order, "to"));

            return { order, fromGeocoding, toGeocoding };
          } catch (error) {
            console.error(error);
            return { order, fromGeocoding: null, toGeocoding: null };
          }
        }),
      );

      const route = await getOptimalRoute(
        geocodedOrders[0]!.fromGeocoding!,
        geocodedOrders.map((g) => g.toGeocoding!),
      );

      const ordersWithRoute = route.map((orderIndex) => orders[orderIndex]!);

      return c.json({ orders: ordersWithRoute });
    },
  );

export { externalRouter };
