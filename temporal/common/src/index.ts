import { z } from "zod";

export const taskQueue = "durable-delivery";

export type { Order } from "@repo/db-order/client";
export type { Invoice } from "@repo/db-invoice/client";

export type OrderStatus =
  | "processing"
  | "findingDriver"
  | "driverFound"
  | "pickedUp"
  | "delivered"
  | "delayed";

export const paymentInformationSchema = z.object({
  status: z.enum(["pending", "paid", "failed"]),
  amount: z.number(),
  currency: z.string(),
  paymentMethod: z.string(),
});
