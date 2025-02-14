import { z } from "zod";

import type { routes } from "./app";

export type AppType = typeof routes;

export const orderInfoSchema = z.object({
  orderId: z.string(),
  from: z.string(),
  to: z.string(),
  price: z.number(),
  deliverBy: z.string(),
});

export type OrderInfo = z.infer<typeof orderInfoSchema>;

export interface ServerToClientEvents {
  broadcastOrder: (orderInfo: OrderInfo) => void;
  invalidateOrder: (orderId: string) => void;
}

export interface ClientToServerEvents {
  driverTakeOrder: (orderId: string) => void;
}

export interface InterServerEvents {
  ping: () => void;
}

export interface SocketData {
  userId: string;
}
