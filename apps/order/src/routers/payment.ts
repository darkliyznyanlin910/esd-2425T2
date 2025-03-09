import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { z } from "zod";

import { authMiddleware } from "@repo/auth/auth";
import { paymentInformationSchema } from "@repo/temporal-common";
import { connectToTemporal } from "@repo/temporal-common/temporal-client";
import { getPaymentInformationQuery } from "@repo/temporal-workflows";

import { env } from "../env";

const temporalClient = await connectToTemporal();

const paymentRouter = new OpenAPIHono().openapi(
  createRoute({
    method: "get",
    path: "/:orderId/:stripeSessionId",
    description:
      "Callback for stripe payment or Endpoint for getting payment information",
    request: {
      params: z.object({
        orderId: z.string(),
        stripeSessionId: z.string().optional(),
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
    const { orderId, stripeSessionId } = c.req.valid("param");

    const paymentInformation = await temporalClient.workflow
      .getHandle(orderId)
      .query(getPaymentInformationQuery);

    return c.json(paymentInformation);
  },
);

export { paymentRouter };
