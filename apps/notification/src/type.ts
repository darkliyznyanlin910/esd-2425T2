import { hc } from "hono/client";

import type { Order } from "@repo/db-order/zod";
import { getServiceBaseUrl } from "@repo/service-discovery";

import type { routes } from "./app";

export const HonoClient = hc<typeof routes>(getServiceBaseUrl("notification"));

export interface ServerToClientEvents {
  broadcastOrder: (order: Order) => void;
  invalidateOrder: (orderId: string) => void;
}

export interface ClientToServerEvents {}

export interface InterServerEvents {
  ping: () => void;
}

export interface SocketData {
  userId: string;
}
