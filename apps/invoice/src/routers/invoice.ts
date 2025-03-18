import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { z } from "zod";

import type { HonoExtension } from "@repo/auth/type";
import { authMiddleware } from "@repo/auth/auth";
import { db } from "@repo/db-invoice";

import { env } from "../env";

const invoiceRouter = new OpenAPIHono<HonoExtension>()
  .openapi(
    createRoute({
      method: "post",
      path: "/",
      description: "Create a new invoice",
      middleware: [
        authMiddleware({
          authBased: {
            allowedRoles: ["admin"],
          },
          bearer: {
            tokens: [env.INTERNAL_COMMUNICATION_SECRET],
          },
        }),
      ],
      request: {
        body: {
          content: {
            "application/json": {
              schema: z.object({
                orderId: z.string(),
                customerId: z.string(),
                status: z
                  .enum(["PENDING", "CANCELLED", "COMPLETED"])
                  .default("PENDING"),
                path: z.string(),
                amount: z.number(),
              }),
            },
          },
        },
      },
      responses: {
        201: { description: "Invoice created successfully" },
        400: { description: "Invalid input" },
      },
    }),
    async (c) => {
      const data = c.req.valid("json");
      const createdInvoice = await db.invoice.create({ data });
      return c.json(createdInvoice, 201);
    },
  )

  // Get Invoice by ID
  .openapi(
    createRoute({
      method: "get",
      path: "/:id",
      description: "Get invoice by ID",
      request: {
        params: z.object({
          id: z.string(),
        }),
      },
      responses: {
        200: { description: "Invoice found" },
        404: { description: "Invoice not found" },
      },
    }),
    async (c) => {
      const { id } = c.req.valid("param");
      const invoice = await db.invoice.findUnique({ where: { id } });
      if (!invoice) return c.json({ error: "Invoice not found" }, 404);
      return c.json(invoice);
    },
  )

  // List All Invoices (with pagination)
  .openapi(
    createRoute({
      method: "get",
      path: "/",
      description: "List all invoices",
      request: {
        query: z.object({
          page: z.number().default(1),
          limit: z.number().default(10),
        }),
      },
      responses: {
        200: { description: "Invoices retrieved successfully" },
      },
    }),
    async (c) => {
      const { page, limit } = c.req.valid("query");
      const invoices = await db.invoice.findMany({
        skip: (page - 1) * limit,
        take: limit,
      });
      return c.json(invoices);
    },
  )

  // Update Invoice Status
  .openapi(
    createRoute({
      method: "put",
      path: "/:id",
      description: "Update invoice status",
      request: {
        params: z.object({
          id: z.string(),
        }),
        body: {
          content: {
            "application/json": {
              schema: z.object({
                status: z.enum(["PENDING", "COMPLETED", "CANCELLED"]),
              }),
            },
          },
        },
      },
      responses: {
        200: { description: "Invoice updated successfully" },
        404: { description: "Invoice not found" },
      },
    }),
    async (c) => {
      const { id } = c.req.valid("param");
      const { status } = c.req.valid("json");

      try {
        const updatedInvoice = await db.invoice.update({
          where: { id },
          data: { status },
        });
        return c.json(updatedInvoice);
      } catch (error) {
        console.error(error);
        return c.json({ error: "Invoice not found" }, 404);
      }
    },
  )

  // Delete Invoice
  .openapi(
    createRoute({
      method: "delete",
      path: "/:id",
      description: "Delete invoice",
      request: {
        params: z.object({
          id: z.string(),
        }),
      },
      responses: {
        204: { description: "Invoice deleted successfully" },
        404: { description: "Invoice not found" },
      },
    }),
    async (c) => {
      const { id } = c.req.valid("param");

      try {
        const deletedInvoice = await db.invoice.delete({
          where: { id },
        });
        return c.json(
          {
            message: "Invoice deleted successfully",
            deletedInvoice,
          },
          200,
        );
      } catch (error) {
        console.error(error);
        return c.json({ error: "Invoice not found" }, 404);
      }
    },
  );

export { invoiceRouter };
