import Stripe from "stripe";
import { z } from "zod";

export const taskQueue = "durable-delivery";

export type { Order } from "@repo/db-order/client";
export type { Invoice } from "@repo/db-invoice/client";

export type StripeSessionStatus = Stripe.Checkout.Session.Status;

export type OrderStatus =
  | "PROCESSING"
  | "FINDING_DRIVER"
  | "DRIVER_FOUND"
  | "PICKED_UP"
  | "DELIVERED"
  | "DELAYED"
  | "PAYMENT_PENDING"
  | "PAYMENT_FAILED"
  | "PAYMENT_SUCCESSFUL";

export const paymentInformationSchema = z
  .object({
    status: z.literal("open"),
    sessionId: z.string(),
    sessionUrl: z.string(),
  })
  .or(
    z.object({
      status: z.enum(["complete", "expired"]),
      sessionId: z.string(),
    }),
  );
