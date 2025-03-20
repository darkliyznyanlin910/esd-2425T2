import { Blob } from "buffer";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import dotenv from "dotenv";
import { z } from "zod";

import type { HonoExtension } from "@repo/auth/type";
import { authMiddleware } from "@repo/auth/auth";
import { db } from "@repo/db-invoice";

import { env } from "../env";

dotenv.config();

// Configure S3 client for LocalStack
const s3Client = new S3Client({
  endpoint: process.env.S3_ENDPOINT ?? "",
  region: process.env.AWS_REGION ?? "",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? "",
  },
  forcePathStyle: true,
});

const router = new OpenAPIHono<HonoExtension>();

// Add the invoice router - keeping all the existing routes from the provided code
const invoiceRouter = router
  // S3 Image Upload Route
  .openapi(
    createRoute({
      method: "post",
      path: "/invoices/upload",
      description: "Upload an invoice image to S3",
      request: {
        body: {
          content: {
            "multipart/form-data": {
              schema: z.object({
                file: z.any().refine((file) => file !== undefined, {
                  message: "PDF is required",
                }),
                // folder: z.string().optional().default("invoices"),
                orderId: z.string(),
              }),
            },
          },
        },
      },
      responses: {
        201: { description: "Invoice uploaded successfully" },
        400: { description: "Failed to upload invoice" },
      },
    }),
    async (c) => {
      try {
        const data = await c.req.parseBody();
        const file = data.file as Blob;
        // const folder = data.folder || "invoices";
        const filename = `${data.orderId}-invoice(${Date.now()})`;

        console.log(file, filename);

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // const key = `${folder}/${filename}`;
        const key = `${filename}`;

        console.log("S3 Upload Command:", {
          Bucket: process.env.S3_BUCKET_NAME || "invoice-bucket",
          Key: key,
          Body: buffer,
          ContentType: file.type,
        });

        // Upload to S3
        const res = await s3Client.send(
          new PutObjectCommand({
            Bucket: process.env.S3_BUCKET || "invoice-bucket",
            Key: key,
            Body: buffer,
            ContentType: file.type || "application/pdf",
          }),
        );

        console.log("S3 Upload Response:", res);

        // Return the URL where the image can be accessed
        return c.json(
          {
            success: true,
            imageUrl: `http://localhost:4566/${process.env.S3_BUCKET}/${key}`, // LocalStack S3 URL
            key,
          },
          201,
        );
      } catch (error) {
        console.error("Error uploading image:", error);
        return c.json({ error: "Failed to upload image" }, 500);
      }
    },
  )

  // Create Invoice
  .openapi(
    createRoute({
      method: "post",
      path: "/invoices",
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
      return c.json(invoice);
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
