import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { z } from "zod";

import { getServiceBaseUrl } from "@repo/service-discovery";
// import { authMiddleware } from "@repo/auth/auth";
// import { getServiceBaseUrl } from "@repo/service-discovery";
import { paymentInformationSchema } from "@repo/temporal-common";
import { connectToTemporal } from "@repo/temporal-common/temporal-client";
import {
  getPaymentInformationQuery,
  paymentFailedSignal,
  paymentSucceededSignal,
} from "@repo/temporal-workflows";

// import { env } from "../env";

const paymentRouter = new OpenAPIHono()
  .openapi(
    createRoute({
      method: "get",
      path: "/:orderId",
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
      // middleware: [
      //   authMiddleware({
      //     authBased: {
      //       allowedRoles: ["client"],
      //     },
      //     // bearer: {
      //     //   tokens: [env.INTERNAL_COMMUNICATION_SECRET],
      //     // },
      //   }),
      // ],
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
      console.log("hit the endpoint to send signal");

      const { orderId } = c.req.valid("param");
      const { status, sessionId } = c.req.valid("query");
      console.log("Status : " + status);
      console.log("Session Id : " + sessionId);
      const temporalClient = await connectToTemporal();

      console.log(status);
      if (status === "success") {
        await temporalClient.workflow
          .getHandle(orderId)
          .signal(paymentSucceededSignal, sessionId);
      } else if (status === "failed") {
        await temporalClient.workflow
          .getHandle(orderId)
          .signal(paymentFailedSignal, sessionId);
      }

      await temporalClient.workflow
        .getHandle(orderId)
        .query(getPaymentInformationQuery);

      const frontendRedirectUrl = `${getServiceBaseUrl("customer-frontend")}/orders`;

      return c.redirect(frontendRedirectUrl, 302);
    },
  )
  // .openapi(
  //   createRoute({
  //     method: "get",
  //     path: "/redirect",
  //     request: {
  //       query: z.object({
  //         orderId: z.string(),
  //         status: z.enum(["success", "failed"]),
  //         sessionId: z.string().optional(),
  //       }),
  //     },
  //     responses: {
  //       302: { description: "Redirecting to frontend" },
  //     },
  //   }),
  //   async (c) => {
  //     const { orderId, status, sessionId } = c.req.valid("query");
  //     const temporalClient = await connectToTemporal();

  //     if (status === "success") {
  //       await temporalClient.workflow
  //         .getHandle(orderId)
  //         .signal(paymentSucceededSignal, sessionId);
  //     } else {
  //       await temporalClient.workflow
  //         .getHandle(orderId)
  //         .signal(paymentFailedSignal, sessionId);
  //     }

  //     const frontendRedirectUrl =
  //       status === "success"
  //         ? `${getServiceBaseUrl("customer-frontend")}/order-success?orderId=${orderId}`
  //         : `${getServiceBaseUrl("customer-frontend")}/order-failed`;

  //     return c.redirect(frontendRedirectUrl, 302);
  //   },
  // )
  .openapi(
    createRoute({
      method: "get",
      path: "/order/:orderId",
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

        console.log(
          "sue paymentinformation : " + JSON.stringify(paymentInformation),
        );

        return c.json(paymentInformation);
      } catch (error) {
        console.error(error);
        return c.json(null, 400);
      }
    },
  );

export { paymentRouter };
