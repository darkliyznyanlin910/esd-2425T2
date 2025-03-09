import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { z } from "zod";

import { authMiddleware } from "@repo/auth/auth";
import { HonoExtension } from "@repo/auth/type";
import { db } from "@repo/db-invoice";

const invoiceRouter = new OpenAPIHono<HonoExtension>()
  .openapi(
    createRoute({
      method: "post",
      path: "/",
      description: "Create a new invoice",
      middleware: [authMiddleware(["admin"], true)],
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

      const updatedInvoice = await db.invoice.update({
        where: { id },
        data: { status },
      });

      if (!updatedInvoice) return c.json({ error: "Invoice not found" }, 404);

      return c.json(updatedInvoice);
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

      const deletedInvoice = await db.invoice.delete({
        where: { id },
      });

      if (!deletedInvoice) return c.json({ error: "Invoice not found" }, 404);

      return c.json({}, 200);
    },
  );

export { invoiceRouter };
