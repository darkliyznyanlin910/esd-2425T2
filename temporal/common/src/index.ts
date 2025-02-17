export const taskQueue = "durable-delivery";

export type { Order } from "@repo/db-order/client";

export type OrderStatus =
  | "processing"
  | "findingDriver"
  | "driverFound"
  | "pickedUp"
  | "delivered"
  | "delayed";

export type Invoice = {
  id: string;
  orderId: string;
  customerId: string;
  amount: number;
  status: "pending" | "paid" | "failed";
  invoiceUrl: string;
  createdAt: Date;
  updatedAt: Date;
};
