import { hc } from "hono/client";

import type { Order } from "@repo/db-order/zod";
import { getServiceBaseUrl } from "@repo/service-discovery";

import type { routes } from "./app";

export const HonoClient = hc<typeof routes>(getServiceBaseUrl("notification"));

export interface DriverEventHandlers {
  broadcastOrder: (order: Order) => void;
  invalidateOrder: (order: Order) => void;
  manualAssignment: (data: { order: Order; driverId?: string }) => void;
}
export interface AdminEventHandlers {
  receiveDelay: (order: Order) => void;
  manualAssignment: (order: Order) => void;
}
