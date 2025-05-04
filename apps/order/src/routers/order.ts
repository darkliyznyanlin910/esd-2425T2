import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { z } from "zod";

import type { HonoExtension } from "@repo/auth/type";
import { authMiddleware } from "@repo/auth/auth";
import { db } from "@repo/db-order";
import { OrderSchema, OrderTrackingRecordSchema } from "@repo/db-order/zod";
import { taskQueue } from "@repo/temporal-common";
import { connectToTemporal } from "@repo/temporal-common/temporal-client";
import { delivery, order } from "@repo/temporal-workflows";

import { env } from "../env";
import { generateDisplayId, getAddress, getGeocoding } from "../utils";

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
        }),
      ] as const,
      description: "Create order",
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
                }),
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
        403: {
          description: "Unauthorized to create user",
        },
      },
    }),
    async (c) => {
      const { order: orderDetails } = c.req.valid("json");

      const user = c.get("user");

      if (!user) {
        return c.json({ error: "Unauthorized, not signed in" }, 403);
      }

      console.log(db);

      const existingOrders = await db.order.count({
        where: {
          userId: user.id,
        },
      });

      const generatedDisplayId = generateDisplayId(existingOrders + 1);

      const createdOrder = await db.order.create({
        data: {
          ...orderDetails,
          displayId: generatedDisplayId,
          userId: user.id,
        },
      });

      const temporalClient = await connectToTemporal();

      await temporalClient.workflow.start(order, {
        workflowId: createdOrder.id,
        args: [createdOrder],
        taskQueue,
      });

      const fromGeocoding = await getGeocoding(
        getAddress(createdOrder, "from"),
      );

      if (fromGeocoding.error) {
        console.error(fromGeocoding.error);
      }

      const toGeocoding = await getGeocoding(getAddress(createdOrder, "to"));

      if (toGeocoding.error) {
        console.error(toGeocoding.error);
      }

      return c.json(createdOrder);
    },
  )
  .openapi(
    createRoute({
      method: "get",
      path: "/process/:id",
      description: "[Internal] Start Delivery Process",
      middleware: [
        authMiddleware({
          authBased: {
            allowedRoles: ["admin"],
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
        query: z.object({
          manualAssignDriverId: z.string().optional(),
        }),
      },
      responses: {
        200: {
          description: "Process order",
          content: {
            "application/json": {
              schema: z.object({
                message: z.string(),
              }),
            },
          },
        },
        401: {
          description: "Unauthorized to process order",
        },
        404: {
          description: "Order not found",
        },
      },
    }),
    async (c) => {
      console.log("hit the endpoint to process order");
      console.log(env.INTERNAL_COMMUNICATION_SECRET);
      const { id } = c.req.valid("param");
      const { manualAssignDriverId } = c.req.valid("query");

      const order = await db.order.findUnique({
        where: {
          id,
        },
      });

      if (!order) {
        return c.json({ error: "Order not found" }, 404);
      }

      if (order.orderStatus == "PAYMENT_PENDING") {
        return c.json(
          { error: "Order is still in payment pending state" },
          400,
        );
      }

      const temporalClient = await connectToTemporal();

      await temporalClient.workflow.start(delivery, {
        workflowId: `${order.id}-delivery`,
        args: [order, manualAssignDriverId],
        taskQueue,
      });

      return c.json({ message: "Order processed" });
    },
  )
  .openapi(
    createRoute({
      method: "post",
      path: "/updateStatus/:id",
      description: "[Internal] Update order status",
      middleware: [
        authMiddleware({
          authBased: {
            allowedRoles: ["admin"],
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
          description: "Unauthorized to update order status",
        },
      },
    }),
    async (c) => {
      console.log("hit the endpoint to update order status");
      const input = c.req.valid("json");
      const { id } = c.req.valid("param");

      console.log(input);
      const body = await c.req.parseBody();
      console.log(body);
      const order = await db.order.update({
        where: {
          id,
        },
        data: {
          orderStatus: input.orderStatus,
        },
      });
      await db.orderTrackingRecord.create({
        data: {
          orderId: id,
          status: input.orderStatus,
        },
      });

      return c.json(order);
    },
  )
  .openapi(
    createRoute({
      method: "get",
      path: "/tracking/:orderId",
      description: "Get order tracking by orderId",
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
          orderId: z.string(),
        }),
      },
      responses: {
        200: {
          content: {
            "application/json": {
              schema: OrderTrackingRecordSchema,
            },
          },
          description: "Get order tracking by id",
        },
        403: {
          description: "Unauthorized to get order tracking by id",
        },
        404: {
          description: "Order not found",
        },
      },
    }),
    async (c) => {
      const { orderId } = c.req.valid("param");
      const user = c.get("user");

      let userId: string | undefined = undefined;
      // Only filter by userId for regular clients
      if (!!user && user.role === "client" && !c.req.header("Authorization")) {
        userId = user.id;
      }

      const order = await db.orderTrackingRecord.findMany({
        where: {
          order: {
            id: orderId,
            userId,
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      if (order.length < 1) {
        return c.json({ error: "Order not found" }, 404);
      }

      return c.json(order);
    },
  )
  .openapi(
    createRoute({
      method: "get",
      path: "/order",
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
          take: z
            .string()
            .transform((val) => parseInt(val))
            .optional(),
          page: z
            .string()
            .transform((val) => parseInt(val))
            .optional(),
          sortBy: z
            .enum(["createdAt", "updatedAt"])
            .default("createdAt")
            .describe("the field to sort by")
            .optional(),
          sortOrder: z
            .enum(["asc", "desc"])
            .default("desc")
            .describe("the order to sort by")
            .optional(),
          status: z
            .enum([
              "PROCESSING",
              "FINDING_DRIVER",
              "DRIVER_FOUND",
              "PICKED_UP",
              "DELIVERED",
              "DELAYED",
              "PAYMENT_PENDING",
              "PAYMENT_FAILED",
              "PAYMENT_SUCCESSFUL",
            ])
            .optional(),
          getFiveMinutesDelayedOrders: z
            .preprocess((val) => val === "true", z.boolean())
            .default(false)
            .optional(),
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
          description: "Unauthorized to get all orders",
        },
        404: {
          description: "Order not found",
        },
      },
    }),
    async (c) => {
      console.log("hit the endpoint to get all orders");
      const {
        take,
        page,
        sortBy,
        sortOrder,
        status,
        getFiveMinutesDelayedOrders,
      } = c.req.valid("query");
      const user = c.get("user")!;

      console.log(take, page, sortBy, sortOrder);

      let userId: string | undefined = undefined;
      // Only filter by userId for regular clients
      if (user.role === "client" && !c.req.header("Authorization")) {
        userId = user.id;
      }

      const orders = await db.order.findMany({
        where: {
          userId,
          orderStatus: status,
          updatedAt: getFiveMinutesDelayedOrders
            ? {
                gte: new Date(Date.now() - 5 * 60 * 1000),
                lte: new Date(Date.now()),
              }
            : undefined,
        },
        take,
        skip: page && take ? (page - 1) * take : undefined,
        orderBy: sortBy && {
          [sortBy]: sortOrder,
        },
      });

      return c.json(orders);
    },
  )
  .openapi(
    createRoute({
      method: "get",
      path: "/finding/initialOrders",
      description: "Get all orders by that don't have a driver assigned",
      middleware: [
        authMiddleware({
          authBased: {
            allowedRoles: ["driver", "admin"],
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
          description: "Get all orders by orderStatus",
        },
        401: {
          description: "Unauthorized to view orders by orderStatus",
        },
        404: {
          description: "Order for finding not found",
        },
      },
    }),
    async (c) => {
      const { take, page } = c.req.valid("query");
      // Query orders by orderStatus only
      const orders = await db.order.findMany({
        where: {
          orderStatus: "FINDING_DRIVER",
        },
        take,
        skip: (page - 1) * take,
      });

      return c.json(orders);
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
        403: {
          description: "Unauthorized to get order by id",
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
      method: "post",
      path: "/bulk",
      description: "Get multiple orders by their IDs",
      request: {
        body: {
          content: {
            "application/json": {
              schema: z.object({
                ids: z.array(z.string()),
              }),
            },
          },
        },
      },
      responses: {
        200: {
          content: {
            "application/json": {
              schema: z.array(OrderSchema),
            },
          },
          description: "Orders retrieved successfully",
        },
        400: {
          description: "Bad request",
        },
      },
    }),
    async (c) => {
      const { ids } = c.req.valid("json");

      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return c.json({ error: "Invalid order IDs provided" }, 400);
      }

      try {
        const orders = await db.order.findMany({
          where: {
            id: { in: ids },
          },
        });

        return c.json(orders);
      } catch (error) {
        console.error("Error fetching orders in bulk:", error);
        return c.json({ error: "Failed to fetch orders" }, 500);
      }
    },
  );

export { orderRouter };
