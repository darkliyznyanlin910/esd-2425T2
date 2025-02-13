import { z } from "zod";

import type { AiSdkToolSet } from "@repo/chatbot-common";

export const tools = {
  getOrders: {
    description: "show the orders to the user",
    parameters: z.object({}),
    execute: async ({}: {}) => {
      const orders: string[] = [];
      return orders;
    },
  },
  getOrderDetails: {
    description: "show the order details to the user",
    parameters: z.object({ orderId: z.string() }),
    execute: async ({ orderId }: { orderId: string }) => {
      return orderId;
    },
  },
  getDriverDetails: {
    description: "show the driver details of an order to the user",
    parameters: z.object({ orderId: z.string() }),
    execute: async ({}: { orderId: string }) => {
      const driverDetails: Record<string, string> = {
        name: "John Doe",
        phone: "+1234567890",
        email: "john.doe@example.com",
        address: "123 Main St, Anytown, USA",
        city: "Anytown",
        state: "CA",
        zip: "12345",
      };
      return driverDetails;
    },
  },
  getTrackingDetails: {
    description:
      "show the tracking status change history of an order to the user",
    parameters: z.object({ orderId: z.string() }),
    execute: async ({}: { orderId: string }) => {
      const trackingDetails: string[] = [];
      return trackingDetails;
    },
  },
} satisfies AiSdkToolSet;
