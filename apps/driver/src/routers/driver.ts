import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { bearerAuth } from "hono/bearer-auth";
import { z } from "zod";

import { authMiddleware } from "@repo/auth/auth";
import { HonoExtension } from "@repo/auth/type";
import { db } from "@repo/db-driver";
import { connectToTemporal } from "@repo/temporal-common/temporal-client";
import {
  deliveredSignal,
  driverFoundSignal,
  pickedUpSignal,
} from "@repo/temporal-workflows";

import { env } from "../env";

const temporalClient = await connectToTemporal();
const driverRouter = new OpenAPIHono<HonoExtension>()
  .openapi(
    createRoute({
      method: "post",
      path: "/create",
      middleware: [
        authMiddleware({
          authBased: {
            allowedRoles: ["client"],
          },
          bearer: {
            tokens: [env.INTERNAL_COMMUNICATION_SECRET],
          },
        }),
      ],
      description: "Create new driver",
      request: {
        body: {
          content: {
            "application/json": {
              schema: z.object({
                name: z.string(),
                phone: z.string(),
                email: z.string().email(),
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
      const newDriver = await db.driver.create({ data: driverData });
      return c.json({ id: newDriver.id, message: "Driver created" }, 201);
    },
  )
  .openapi(
    createRoute({
      method: "get",
      path: "/drivers/:id",
      description: "Get driver by id",
      request: { params: z.object({ id: z.string() }) },
      responses: {
        200: {
          description: "Driver details",
          content: {
            "application/json": {
              schema: z.object({
                id: z.string(),
                name: z.string(),
                phone: z.string(),
                email: z.string().email(),
              }),
            },
          },
        },
        404: { description: "Driver not found" },
      },
    }),
    async (c) => {
      const { id } = c.req.valid("param");
      const driver = await db.driver.findUnique({ where: { id } });
      if (!driver) return c.json({ message: "Driver not found" }, 404);
      return c.json(driver);
    },
  )
  .openapi(
    createRoute({
      method: "put",
      path: "/drivers/:id",
      description: "Update driver by id",
      request: {
        params: z.object({ id: z.string() }),
        body: {
          content: {
            "application/json": {
              schema: z.object({
                name: z.string().optional(),
                phone: z.string().optional(),
                email: z.string().email().optional(),
              }),
            },
          },
        },
      },
      responses: {
        200: { description: "Driver updated" },
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
      return c.json({ message: "Driver updated", driver: updatedDriver });
    },
  )
  .openapi(
    createRoute({
      method: "delete",
      path: "/drivers/:id",
      description: "Delete driver by id",
      request: { params: z.object({ id: z.string() }) },
      responses: {
        200: { description: "Driver deleted" },
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
      description: "Assign a driver to an order (including payment)",
      request: {
        body: {
          content: {
            "application/json": {
              schema: z.object({
                driverId: z.string(),
                orderId: z.string(),
                paymentAmount: z.number(),
              }),
            },
          },
        },
      },
      responses: {
        201: { description: "Order assigned to driver" },
      },
    }),
    async (c) => {
      const assignmentData = c.req.valid("json");
      const newAssignment = await db.orderAssignment.create({
        data: assignmentData,
      });
      return c.json({ id: newAssignment.id, message: "Order assigned" }, 201);
    },
  )
  .openapi(
    createRoute({
      method: "get",
      path: "/assignments/:id",
      description: "Get order assignment by id",
      request: { params: z.object({ id: z.string() }) },
      responses: {
        200: {
          description: "Order assignment details",
          content: {
            "application/json": {
              schema: z.object({
                id: z.string(),
                driverId: z.string(),
                orderId: z.string(),
                paymentAmount: z.number(),
              }),
            },
          },
        },
        404: { description: "Assignment not found" },
      },
    }),
    async (c) => {
      const { id } = c.req.valid("param");
      const assignment = await db.orderAssignment.findUnique({
        where: { id },
      });
      if (!assignment) return c.json({ message: "Assignment not found" }, 404);
      return c.json(assignment);
    },
  )
  .openapi(
    createRoute({
      method: "put",
      path: "/assignments/:id/status",
      description: "Update order assignment status by id",
      request: {
        params: z.object({ id: z.string() }),
        body: {
          content: {
            "application/json": {
              schema: z.object({
                status: z.enum(["PENDING", "PICKED_UP", "DELIVERED"]),
              }),
            },
          },
        },
      },
      responses: {
        200: { description: "Order status updated" },
        404: { description: "Assignment not found" },
      },
    }),
    async (c) => {
      const { id } = c.req.valid("param");
      const { status } = c.req.valid("json");
      const updatedAssignment = await db.orderAssignment.update({
        where: { id },
        data: { status },
      });
      return c.json({
        message: "Order status updated",
        assignment: updatedAssignment,
      });
    },
  )
  .openapi(
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
      description: "Update temporal workflow with order status",
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
      responses: { 200: { description: "Signal sent" } },
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
      } else {
        await temporalClient.workflow
          .getHandle(orderId)
          .signal(deliveredSignal);
      }
      return c.json({ message: "ok" });
    },
  );

export { driverRouter };
