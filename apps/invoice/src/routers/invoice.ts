import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import dotenv from "dotenv";
import { z } from "zod";

import type { HonoExtension } from "@repo/auth/type";
import { authMiddleware } from "@repo/auth/auth";
import { db } from "@repo/db-invoice";

import { env } from "../env";

dotenv.config();

const router = new OpenAPIHono<HonoExtension>();

const s3Client = new S3Client({
  region: env.AWS_REGION,
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
  },
  endpoint: env.S3_ENDPOINT,
  forcePathStyle: true,
});

// Add the invoice router - keeping all the existing routes from the provided code
const invoiceRouter = router
  // S3 Image Upload Route
  .openapi(
    createRoute({
      method: "post",
      path: "/uploadURL",
      description: "Generate a pre-signed URL for invoice upload to S3",
      request: {
        body: {
          content: {
            "application/json": {
              schema: z.object({
                orderId: z.string(),
              }),
            },
          },
        },
      },
      responses: {
        200: { description: "Pre-signed URL generated successfully" },
        400: { description: "Failed to generate pre-signed URL" },
      },
    }),
    async (c) => {
      try {
        const { orderId } = c.req.valid("json");

        const filename = `invoice-${Date.now()}.pdf`;
        const key = `${orderId}/${filename}`;

        const command = new PutObjectCommand({
          Bucket: env.S3_BUCKET,
          Key: key,
          ContentType: "application/pdf",
        });

        const uploadUrl = await getSignedUrl(s3Client, command, {
          expiresIn: 300,
        });

        return c.json(
          {
            uploadUrl,
            key,
            bucket: process.env.S3_BUCKET || "invoice-bucket",
          },
          200,
        );
      } catch (error) {
        console.error("Error generating pre-signed URL:", error);
        return c.json({ error: "Failed to generate pre-signed URL" }, 400);
      }
    },
  )

  // Create Invoice
  .openapi(
    createRoute({
      method: "post",
      path: "/invoices",
      description: "Create a new invoice",
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
      path: "/invoices/:id",
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
      const command = new GetObjectCommand({
        Bucket: env.S3_BUCKET,
        Key: invoice.path,
      });
      const invoiceUrl = await getSignedUrl(s3Client, command, {
        expiresIn: 300,
      });
      return c.json({
        ...invoice,
        invoiceUrl: invoiceUrl.replace(
          env.S3_ENDPOINT,
          "http://localhost:4566",
        ),
      });
    },
  )
  .openapi(
    createRoute({
      method: "get",
      path: "/invoices/order/:orderId",
      description: "Get invoice by ID",
      request: {
        params: z.object({
          orderId: z.string(),
        }),
      },
      responses: {
        200: { description: "Invoice found" },
        404: { description: "Invoice not found" },
      },
    }),
    async (c) => {
      const { orderId } = c.req.valid("param");
      const invoice = await db.invoice.findFirst({ where: { orderId } });
      if (!invoice) return c.json({ error: "Invoice not found" }, 404);
      const command = new GetObjectCommand({
        Bucket: env.S3_BUCKET,
        Key: invoice.path,
      });
      const invoiceUrl = await getSignedUrl(s3Client, command, {
        expiresIn: 300,
      });
      return c.json({
        ...invoice,
        invoiceUrl: invoiceUrl.replace(
          env.S3_ENDPOINT,
          "http://localhost:4566",
        ),
      });
    },
  )

  // List All Invoices (with pagination)
  .openapi(
    createRoute({
      method: "get",
      path: "/invoices",
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
      path: "/invoices/:id",
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
      path: "/invoices/:id",
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

export { router, invoiceRouter };
