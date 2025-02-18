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
