import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { z } from "zod";

import { authMiddleware } from "@repo/auth/auth";
import { paymentInformationSchema } from "@repo/temporal-common";
import { connectToTemporal } from "@repo/temporal-common/temporal-client";
import {
  getPaymentInformationQuery,
  paymentFailedSignal,
  paymentSucceededSignal,
} from "@repo/temporal-workflows";

import { env } from "../env";

const paymentRouter = new OpenAPIHono()
  .openapi(
    createRoute({
      method: "get",
      path: "/:orderId/:stripeSessionId",
      description:
        "Callback for stripe payment or Endpoint for getting payment information",
      request: {
        params: z.object({
          orderId: z.string(),
        }),
        query: z.object({
          status: z.enum(["success", "failed"]).optional(),
          sessionId: z.string().optional(),
        }),
      },
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
      responses: {
        200: {
          content: {
            "application/json": {
              schema: paymentInformationSchema,
            },
          },
          description: "Test response",
        },
        401: {
          description: "Unauthorized",
        },
      },
    }),
    async (c) => {
      const { orderId } = c.req.valid("param");
      const { status, sessionId } = c.req.valid("query");

      const temporalClient = await connectToTemporal();

      if (status === "success") {
        await temporalClient.workflow
          .getHandle(orderId)
          .signal(paymentSucceededSignal, sessionId);
      } else if (status === "failed") {
        await temporalClient.workflow
          .getHandle(orderId)
          .signal(paymentFailedSignal, sessionId);
      }

      const paymentInformation = await temporalClient.workflow
        .getHandle(orderId)
        .query(getPaymentInformationQuery);

      return c.json(paymentInformation);
    },
  )
  .openapi(
    createRoute({
      method: "get",
      path: "/:orderId",
      request: {
        params: z.object({
          orderId: z.string(),
        }),
      },
      responses: {
        200: {
          content: {
            "application/json": {
              schema: paymentInformationSchema.nullable(),
            },
          },
          description: "Test response",
        },
        401: {
          description: "Unauthorized",
        },
      },
    }),
    async (c) => {
      const { orderId } = c.req.valid("param");

      const temporalClient = await connectToTemporal();
      console.log("hit the endpoint");
      try {
        const paymentInformation = await temporalClient.workflow
          .getHandle(orderId)
          .query(getPaymentInformationQuery);

        return c.json(paymentInformation);
      } catch (error) {
        console.error(error);
        return c.json(null, 400);
      }
    },
  );

export { paymentRouter };
