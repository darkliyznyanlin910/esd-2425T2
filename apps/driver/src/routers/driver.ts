import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { z } from "zod";

import type { HonoExtension } from "@repo/auth/type";
import { authMiddleware } from "@repo/auth/auth";
import { db } from "@repo/db-driver";
import { connectToTemporal } from "@repo/temporal-common/temporal-client";
import {
  deliveredSignal,
  driverFoundSignal,
  order,
  pickedUpSignal,
} from "@repo/temporal-workflows";

import { env } from "../env";

const driverRouter = new OpenAPIHono<HonoExtension>()
  .openapi(
    createRoute({
      method: "post",
      path: "/",
      description: "Create new driver",
      request: {
        body: {
          content: {
            "application/json": {
              schema: z.object({
                phone: z.string(),
                id: z.string(),
                userId: z.string(),
              }),
            },
          },
        },
      },
      responses: {
        201: {
          description: "Driver created successfully",
          content: {
            "application/json": {
              schema: z.object({ id: z.string(), message: z.string() }),
            },
          },
        },
      },
    }),
    async (c) => {
      const driverData = c.req.valid("json");
      const newDriver = await db.driver.create({
        data: {
          id: driverData.id,
          userId: driverData.userId,
          phone: driverData.phone,
        },
      });
      return c.json({ id: newDriver.id, message: "Driver created" }, 201);
    },
  )
  .openapi(
    createRoute({
      method: "get",
      path: "/:id",
      description: "Get driver by id",
      request: { params: z.object({ id: z.string() }) },
      responses: {
        200: {
          description: "Driver details",
          content: {
            "application/json": {
              schema: z.object({
                id: z.string(),
                phone: z.string(),
                userId: z.string(),
                availability: z.enum(["AVAILABLE", "ON_DELIVERY", "OFFLINE"]),
                createdAt: z.string(),
                updatedAt: z.string(),
              }),
            },
          },
        },
        404: { description: "Driver not found" },
      },
    }),
    async (c) => {
      const { id } = c.req.valid("param");
      const driver = await db.driver.findUnique({ where: { userId: id } });
      if (!driver) return c.json({ message: "Driver not found" }, 404);
      return c.json(driver);
    },
  )
  .openapi(
    createRoute({
      method: "put",
      path: "/:id",
      description: "Update driver by id",
      request: {
        params: z.object({ id: z.string() }),
        body: {
          content: {
            "application/json": {
              schema: z.object({
                phone: z.string().optional(),
                userId: z.string().optional(),
              }),
            },
          },
        },
      },
      responses: {
        200: {
          description: "Driver updated successfully",
          content: {
            "application/json": {
              schema: z.object({
                success: z.boolean(),
                message: z.string(),
                driver: z.object({
                  id: z.string(),
                  phone: z.string(),
                  userId: z.string(),
                  availability: z.enum(["AVAILABLE", "ON_DELIVERY", "OFFLINE"]),
                  createdAt: z.string(),
                  updatedAt: z.string(),
                }),
              }),
            },
          },
        },
        404: { description: "Driver not found" },
      },
    }),
    async (c) => {
      const { id } = c.req.valid("param");
      const updateData = c.req.valid("json");
      const updatedDriver = await db.driver.update({
        where: { id },
        data: updateData,
      });
      return c.json(
        { success: true, message: "Driver updated", driver: updatedDriver },
        200,
      );
    },
  )
  .openapi(
    createRoute({
      method: "put",
      path: "/:userId/availability",
      description: "Update driver availability",
      request: {
        params: z.object({ userId: z.string() }),
        body: {
          content: {
            "application/json": {
              schema: z.object({
                availability: z.enum(["AVAILABLE", "ON_DELIVERY", "OFFLINE"]),
              }),
            },
          },
        },
      },
      responses: {
        200: {
          description: "Availability updated successfully",
          content: {
            "application/json": {
              schema: z.object({
                success: z.boolean(),
                message: z.string(),
                driver: z.object({
                  id: z.string(),
                  phone: z.string(),
                  userId: z.string(),
                  availability: z.enum(["AVAILABLE", "ON_DELIVERY", "OFFLINE"]),
                  createdAt: z.string(),
                  updatedAt: z.string(),
                }),
              }),
            },
          },
        },
        404: { description: "Driver not found" },
      },
    }),
    async (c) => {
      const { userId } = c.req.valid("param");
      const { availability } = c.req.valid("json");
      const driver = await db.driver.findUnique({ where: { userId } });
      if (!driver) return c.json({ message: "Driver not found" }, 404);
      const updatedDriver = await db.driver.update({
        where: { id: driver.id },
        data: { availability },
      });
      return c.json({
        success: true,
        message: "Driver availability updated",
        driver: updatedDriver,
      });
    },
  )
  .openapi(
    createRoute({
      method: "get",
      path: "/",
      description: "Get all drivers",
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
              schema: z.array(
                z.object({
                  id: z.string(),
                  name: z.string(),
                  phone: z.string().optional(),
                  email: z.string().optional(),
                  availability: z.enum(["AVAILABLE", "ON_DELIVERY", "OFFLINE"]),
                  createdAt: z.string(),
                  updatedAt: z.string(),
                }),
              ),
            },
          },
          description: "Get all drivers",
        },
        401: {
          description: "Unauthorized",
        },
        404: {
          description: "Drivers not found",
        },
      },
    }),
    async (c) => {
      const { take, page } = c.req.valid("query");

      const drivers = await db.driver.findMany({
        take,
        skip: (page - 1) * take,
      });

      if (!drivers || drivers.length === 0) {
        return c.json({ error: "Drivers not found" }, 404);
      }

      return c.json(drivers);
    },
  )
  .openapi(
    createRoute({
      method: "delete",
      path: "/:id",
      description: "Delete driver by userId",
      request: { params: z.object({ id: z.string() }) },
      responses: {
        200: {
          description: "Driver deleted successfully",
          content: {
            "application/json": {
              schema: z.object({ message: z.string() }),
            },
          },
        },
        404: { description: "Driver not found" },
      },
    }),
    async (c) => {
      const { id } = c.req.valid("param");
      await db.driver.delete({ where: { id } });
      return c.json({ message: "Driver deleted" });
    },
  )
  .openapi(
    createRoute({
      method: "post",
      path: "/assign",
      description: "Assign a driver to an order",
      request: {
        body: {
          content: {
            "application/json": {
              schema: z.object({
                driverId: z.string(),
                orderId: z.string(),
              }),
            },
          },
        },
      },
      responses: {
        201: {
          description: "Order assigned to driver",
          content: {
            "application/json": {
              schema: z.object({
                id: z.string(),
                message: z.string(),
              }),
            },
          },
        },
      },
    }),
    async (c) => {
      const { driverId, orderId } = c.req.valid("json");
      const newAssignment = await db.orderAssignment.create({
        data: { driverId, orderId },
      });
      console.log("New Assignment", newAssignment);
      return c.json({ id: newAssignment.id, message: "Order assigned" }, 201);
    },
  )
  .openapi(
    createRoute({
      method: "get",
      path: "/assignments/:id",
      description: "Get all order assignments to userId",
      request: {
        params: z.object({ id: z.string() }),
        query: z.object({
          status: z.enum(["DRIVER_FOUND", "PICKED_UP", "DELIVERED"]).optional(),
        }),
      },
      responses: {
        200: {
          content: {
            "application/json": {
              schema: z.array(
                z.object({
                  id: z.string(),
                  driverId: z.string(),
                  orderId: z.string(),
                  orderStatus: z.enum([
                    "DRIVER_FOUND",
                    "PICKED_UP",
                    "DELIVERED",
                  ]),
                  createdAt: z.string(),
                  updatedAt: z.string(),
                }),
              ),
            },
          },
          description: "Get all assignments of driver by orderStatus",
        },
        404: { description: "Driver or assignments not found" },
      },
    }),
    async (c) => {
      const { id } = c.req.valid("param");
      const { status } = c.req.valid("query");

      // Find the driver by userId
      const driver = await db.driver.findUnique({
        where: { userId: id },
      });

      if (!driver) return c.json({ message: "Driver not found" }, 404);

      // Build the query based on whether status is provided
      const whereClause = status
        ? { driverId: driver.id, orderStatus: status }
        : { driverId: driver.id };

      // Get all assignments for this driver
      const driverAssignments = await db.orderAssignment.findMany({
        where: whereClause,
      });

      if (!driverAssignments || driverAssignments.length === 0) {
        return c.json([]);
      }

      const uniqueAssignmentsByOrderId = new Map();

      // Keep only the most recent assignment for each orderId
      for (const assignment of driverAssignments) {
        const existingAssignment = uniqueAssignmentsByOrderId.get(
          assignment.orderId,
        );

        if (
          !existingAssignment ||
          new Date(assignment.updatedAt) >
            new Date(existingAssignment.updatedAt)
        ) {
          uniqueAssignmentsByOrderId.set(assignment.orderId, assignment);
        }
      }

      const dedupedAssignments = Array.from(
        uniqueAssignmentsByOrderId.values(),
      );
      return c.json({ assignments: dedupedAssignments });
    },
  )
  .openapi(
    createRoute({
      method: "post",
      path: "/state/:state",
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
      description: "Update temporal workflow with order status",
      request: {
        body: {
          content: {
            "application/json": {
              schema: z.object({
                orderId: z.string(),
                driverId: z.string(),
              }),
            },
          },
        },
        params: z.object({
          state: z.enum(["DRIVER_FOUND", "PICKED_UP", "DELIVERED"]),
        }),
      },
      responses: {
        201: {
          description: "Order assigned",
          content: {
            "application/json": {
              schema: z.object({
                id: z.string(),
                message: z.string(),
              }),
            },
          },
        },
        404: { description: "Driver not found" },
      },
    }),
    async (c) => {
      const { orderId, driverId } = c.req.valid("json");
      const { state } = c.req.valid("param");
      const temporalClient = await connectToTemporal();
      if (state === "DRIVER_FOUND") {
        await temporalClient.workflow
          .getHandle(`${orderId}-delivery`)
          .signal(driverFoundSignal, driverId);
        const driver = await db.driver.findUnique({
          where: { userId: driverId },
        });
        if (!driver) return c.json({ message: "Driver not found" }, 404);
        const newAssignment = await db.orderAssignment.create({
          data: { driverId: driver.id, orderId },
        });
        return c.json({ id: newAssignment.id, message: "Order assigned" }, 201);
      } else if (state === "PICKED_UP") {
        await temporalClient.workflow
          .getHandle(`${orderId}-delivery`)
          .signal(pickedUpSignal);
        const driver = await db.driver.findUnique({
          where: { userId: driverId },
        });
        console.log("input ID", driverId);
        if (!driver) return c.json({ message: "Driver not found" }, 404);
        console.log("Driver ID", driver.id);

        await db.orderAssignment.updateMany({
          where: { orderId, driverId: driver.id },
          data: { orderStatus: "PICKED_UP" },
        });
        return c.json({ message: "Order picked up" }, 201);
      } else {
        await temporalClient.workflow
          .getHandle(`${orderId}-delivery`)
          .signal(deliveredSignal);
        const driver = await db.driver.findUnique({
          where: { userId: driverId },
        });
        if (!driver) return c.json({ message: "Driver not found" }, 404);
        await db.orderAssignment.updateMany({
          where: { orderId, driverId: driver.id },
          data: { orderStatus: "DELIVERED" },
        });
        return c.json({ message: "Order delivered" }, 201);
      }
    },
  )
  .openapi(
    createRoute({
      method: "delete",
      path: "/orderAssignment/:orderId",
      middleware: [
        authMiddleware({
          bearer: {
            tokens: [env.INTERNAL_COMMUNICATION_SECRET],
          },
        }),
      ] as const,
      description: "Delete order assignment",
      request: {
        params: z.object({ orderId: z.string() }).strict(),
      },
      responses: {
        200: {
          description: "Order assignment deleted",
          content: {
            "application/json": {
              schema: z.object({
                message: z.string(),
              }),
            },
          },
        },
        404: { description: "Order assignment not found" },
      },
    }),
    async (c) => {
      const { orderId } = c.req.valid("param");
      const assignment = await db.orderAssignment.findMany({
        where: { orderId },
      });
      if (!assignment) return c.json({ message: "Assignment not found" }, 404);
      await db.orderAssignment.deleteMany({ where: { orderId } });
      return c.json({ message: "Order assignment deleted" }, 200);
    },
  );
export { driverRouter };
