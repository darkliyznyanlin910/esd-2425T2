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
        200: {
          description: "Pre-signed URL generated successfully",
          content: {
            "application/json": {
              schema: z.object({
                success: z.boolean(),
                uploadUrl: z.string(),
                key: z.string(),
                bucket: z.string(),
                expiresIn: z.number(),
              }),
            },
          },
        },
        400: {
          description: "Failed to generate pre-signed URL",
          content: {
            "application/json": {
              schema: z.object({
                success: z.boolean(),
                error: z.string(),
              }),
            },
          },
        },
      },
    }),
    async (c) => {
      try {
        const { orderId } = c.req.valid("json");

        const filename = `invoice-${Date.now()}.pdf`;
        const key = `${orderId}/${filename}`;
        const expiresIn = 300; // 5 minutes

        const command = new PutObjectCommand({
          Bucket: env.S3_BUCKET,
          Key: key,
          ContentType: "application/pdf",
        });

        const uploadUrl = await getSignedUrl(s3Client, command, {
          expiresIn,
        });

        return c.json(
          {
            success: true,
            uploadUrl,
            key,
            bucket: env.S3_BUCKET || "invoice-bucket",
            expiresIn,
          },
          200,
        );
      } catch (error) {
        console.error("Error generating pre-signed URL:", error);
        return c.json(
          {
            success: false,
            error: "Failed to generate pre-signed URL",
            message: error instanceof Error ? error.message : "Unknown error",
          },
          400,
        );
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
        201: {
          description: "Invoice created successfully",
          content: {
            "application/json": {
              schema: z.object({
                success: z.boolean(),
                message: z.string(),
                invoice: z.object({
                  id: z.string(),
                  orderId: z.string(),
                  customerId: z.string(),
                  status: z.enum(["PENDING", "CANCELLED", "COMPLETED"]),
                  path: z.string(),
                  amount: z.number(),
                  createdAt: z.string(),
                  updatedAt: z.string(),
                }),
              }),
            },
          },
        },
        400: {
          description: "Invalid input",
          content: {
            "application/json": {
              schema: z.object({
                success: z.boolean(),
                error: z.string(),
              }),
            },
          },
        },
      },
    }),
    async (c) => {
      try {
        const data = c.req.valid("json");
        const createdInvoice = await db.invoice.create({ data });
        return c.json(
          {
            success: true,
            message: "Invoice created successfully",
            invoice: createdInvoice,
          },
          201,
        );
      } catch (error) {
        console.error("Error creating invoice:", error);
        return c.json(
          {
            success: false,
            error: "Failed to create invoice",
            message: error instanceof Error ? error.message : "Unknown error",
          },
          400,
        );
      }
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
        200: {
          description: "Invoice found",
          content: {
            "application/json": {
              schema: z.object({
                success: z.boolean(),
                invoice: z.object({
                  id: z.string(),
                  orderId: z.string(),
                  customerId: z.string(),
                  status: z.enum(["PENDING", "CANCELLED", "COMPLETED"]),
                  path: z.string(),
                  amount: z.number(),
                  createdAt: z.string(),
                  updatedAt: z.string(),
                  invoiceUrl: z.string(),
                }),
              }),
            },
          },
        },
        404: {
          description: "Invoice not found",
          content: {
            "application/json": {
              schema: z.object({
                success: z.boolean(),
                error: z.string(),
              }),
            },
          },
        },
        500: {
          description: "Server error",
          content: {
            "application/json": {
              schema: z.object({
                success: z.boolean(),
                error: z.string(),
                message: z.string().optional(),
              }),
            },
          },
        },
      },
    }),
    async (c) => {
      const { id } = c.req.valid("param");

      try {
        const invoice = await db.invoice.findUnique({ where: { id } });

        if (!invoice) {
          return c.json(
            {
              success: false,
              error: "Invoice not found",
            },
            404,
          );
        }

        const command = new GetObjectCommand({
          Bucket: env.S3_BUCKET,
          Key: invoice.path,
        });

        const invoiceUrl = await getSignedUrl(s3Client, command, {
          expiresIn: 300,
        });

        return c.json(
          {
            success: true,
            invoice: {
              ...invoice,
              invoiceUrl: invoiceUrl.replace(
                env.S3_ENDPOINT,
                "http://localhost:4566",
              ),
            },
          },
          200,
        );
      } catch (error) {
        console.error("Error retrieving invoice:", error);
        return c.json(
          {
            success: false,
            error: "Failed to retrieve invoice",
            message: error instanceof Error ? error.message : "Unknown error",
          },
          500,
        );
      }
    },
  )
  .openapi(
    createRoute({
      method: "get",
      path: "/invoices/order/:orderId",
      description: "Get invoice by order ID",
      request: {
        params: z.object({
          orderId: z.string(),
        }),
      },
      middleware: [
        authMiddleware({
          authBased: {
            allowedRoles: ["admin", "client"],
          },
          bearer: {
            tokens: [env.INTERNAL_COMMUNICATION_SECRET],
          },
        }),
      ] as const,
      responses: {
        200: {
          description: "Invoice found",
          content: {
            "application/json": {
              schema: z.object({
                success: z.boolean(),
                invoice: z.object({
                  id: z.string(),
                  orderId: z.string(),
                  customerId: z.string(),
                  status: z.enum(["PENDING", "CANCELLED", "COMPLETED"]),
                  path: z.string(),
                  amount: z.number(),
                  createdAt: z.string(),
                  updatedAt: z.string(),
                  invoiceUrl: z.string(),
                }),
              }),
            },
          },
        },
        404: {
          description: "Invoice not found",
          content: {
            "application/json": {
              schema: z.object({
                success: z.boolean(),
                error: z.string(),
              }),
            },
          },
        },
        500: {
          description: "Server error",
          content: {
            "application/json": {
              schema: z.object({
                success: z.boolean(),
                error: z.string(),
                message: z.string().optional(),
              }),
            },
          },
        },
      },
    }),
    async (c) => {
      const { orderId } = c.req.valid("param");

      try {
        let userId: string | undefined = undefined;
        const user = c.get("user");

        if (
          !!user &&
          user.role === "client" &&
          !c.req.header("Authorization")
        ) {
          userId = user.id;
        }

        const invoice = await db.invoice.findFirst({
          where: { orderId, customerId: userId },
        });

        if (!invoice) {
          return c.json(
            {
              success: false,
              error: "Invoice not found for this order",
            },
            404,
          );
        }

        const command = new GetObjectCommand({
          Bucket: env.S3_BUCKET,
          Key: invoice.path,
        });

        const invoiceUrl = await getSignedUrl(s3Client, command, {
          expiresIn: 300,
        });

        return c.json(
          {
            success: true,
            invoice: {
              ...invoice,
              invoiceUrl: invoiceUrl.replace(
                env.S3_ENDPOINT,
                "http://localhost:4566",
              ),
            },
          },
          200,
        );
      } catch (error) {
        console.error("Error retrieving invoice by order ID:", error);
        return c.json(
          {
            success: false,
            error: "Failed to retrieve invoice",
            message: error instanceof Error ? error.message : "Unknown error",
          },
          500,
        );
      }
    },
  )

  // List All Invoices (with pagination)
  .openapi(
    createRoute({
      method: "get",
      path: "/invoices",
      description: "List all invoices with pagination",
      request: {
        query: z.object({
          page: z.coerce.number().default(1),
          limit: z.coerce.number().default(10),
        }),
      },
      responses: {
        200: {
          description: "Invoices retrieved successfully",
          content: {
            "application/json": {
              schema: z.object({
                success: z.boolean(),
                invoices: z.array(
                  z.object({
                    id: z.string(),
                    orderId: z.string(),
                    customerId: z.string(),
                    status: z.enum(["PENDING", "CANCELLED", "COMPLETED"]),
                    path: z.string(),
                    amount: z.number(),
                    createdAt: z.string(),
                    updatedAt: z.string(),
                  }),
                ),
                pagination: z.object({
                  page: z.number(),
                  limit: z.number(),
                  totalCount: z.number(),
                  totalPages: z.number(),
                }),
              }),
            },
          },
        },
        500: {
          description: "Server error",
          content: {
            "application/json": {
              schema: z.object({
                success: z.boolean(),
                error: z.string(),
                message: z.string().optional(),
              }),
            },
          },
        },
      },
    }),
    async (c) => {
      try {
        const { page, limit } = c.req.valid("query");

        // Get total count for pagination info
        const totalCount = await db.invoice.count();
        const totalPages = Math.ceil(totalCount / limit);

        const invoices = await db.invoice.findMany({
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { createdAt: "desc" },
        });

        return c.json(
          {
            success: true,
            invoices,
            pagination: {
              page,
              limit,
              totalCount,
              totalPages,
            },
          },
          200,
        );
      } catch (error) {
        console.error("Error retrieving invoices:", error);
        return c.json(
          {
            success: false,
            error: "Failed to retrieve invoices",
            message: error instanceof Error ? error.message : "Unknown error",
          },
          500,
        );
      }
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
        200: {
          description: "Invoice updated successfully",
          content: {
            "application/json": {
              schema: z.object({
                success: z.boolean(),
                message: z.string(),
                invoice: z.object({
                  id: z.string(),
                  orderId: z.string(),
                  customerId: z.string(),
                  status: z.enum(["PENDING", "CANCELLED", "COMPLETED"]),
                  path: z.string(),
                  amount: z.number(),
                  createdAt: z.string(),
                  updatedAt: z.string(),
                }),
              }),
            },
          },
        },
        404: {
          description: "Invoice not found",
          content: {
            "application/json": {
              schema: z.object({
                success: z.boolean(),
                error: z.string(),
              }),
            },
          },
        },
        500: {
          description: "Server error",
          content: {
            "application/json": {
              schema: z.object({
                success: z.boolean(),
                error: z.string(),
                message: z.string().optional(),
              }),
            },
          },
        },
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

        return c.json(
          {
            success: true,
            message: `Invoice status updated to ${status}`,
            invoice: updatedInvoice,
          },
          200,
        );
      } catch (error) {
        console.error("Error updating invoice:", error);

        if ((error as any)?.code === "P2025") {
          return c.json(
            {
              success: false,
              error: "Invoice not found",
            },
            404,
          );
        }

        return c.json(
          {
            success: false,
            error: "Failed to update invoice",
            message: error instanceof Error ? error.message : "Unknown error",
          },
          500,
        );
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
        200: {
          description: "Invoice deleted successfully",
          content: {
            "application/json": {
              schema: z.object({
                success: z.boolean(),
                message: z.string(),
                deletedInvoice: z.object({
                  id: z.string(),
                  orderId: z.string(),
                  customerId: z.string(),
                  status: z.enum(["PENDING", "CANCELLED", "COMPLETED"]),
                  path: z.string(),
                  amount: z.number(),
                  createdAt: z.string(),
                  updatedAt: z.string(),
                }),
              }),
            },
          },
        },
        404: {
          description: "Invoice not found",
          content: {
            "application/json": {
              schema: z.object({
                success: z.boolean(),
                error: z.string(),
              }),
            },
          },
        },
        500: {
          description: "Server error",
          content: {
            "application/json": {
              schema: z.object({
                success: z.boolean(),
                error: z.string(),
                message: z.string().optional(),
              }),
            },
          },
        },
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
            success: true,
            message: "Invoice deleted successfully",
            deletedInvoice,
          },
          200,
        );
      } catch (error) {
        console.error("Error deleting invoice:", error);

        // Check if it's a Prisma "record not found" error
        if ((error as any)?.code === "P2025") {
          return c.json(
            {
              success: false,
              error: "Invoice not found",
            },
            404,
          );
        }

        return c.json(
          {
            success: false,
            error: "Failed to delete invoice",
            message: error instanceof Error ? error.message : "Unknown error",
          },
          500,
        );
      }
    },
  );

export { router, invoiceRouter };
