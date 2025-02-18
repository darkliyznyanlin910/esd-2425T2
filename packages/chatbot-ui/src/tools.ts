import { z } from "zod";

import type { AiSdkToolSet } from "@repo/chatbot-common";

const orderIdSchema = z.object({ orderId: z.string() });

type ToolReturnTypes = {
  getOrders: string[];
  getOrderDetails: { orderId: string; status: string };
  getDriverDetails: {
    orderId: string;
    driverName: string;
    driverPhone: string;
  };
  getTrackingDetails: Array<{
    orderId: string;
    status: string;
  }>;
};

export const backendTools = {
  getOrders: {
    description: "show the orders to the user",
    parameters: z.object({}),
  },
  getOrderDetails: {
    description: "show the order details to the user",
    parameters: orderIdSchema,
  },
  getDriverDetails: {
    description: "show the driver details of an order to the user",
    parameters: orderIdSchema,
  },
  getTrackingDetails: {
    description:
      "show the tracking status change history of an order to the user",
    parameters: orderIdSchema,
  },
} satisfies AiSdkToolSet;

export type ToolFunctionMap = {
  [K in keyof typeof backendTools]: (
    params: z.infer<(typeof backendTools)[K]["parameters"]>,
  ) => Promise<ToolReturnTypes[K]>;
};

export const toolFunctionMap: ToolFunctionMap = {
  getOrders: async () => {
    return [] as string[];
  },
  getOrderDetails: async ({ orderId }) => {
    return {
      orderId,
      status: "pending",
    };
  },
  getDriverDetails: async ({ orderId }) => {
    return {
      orderId,
      driverName: "John Doe",
      driverPhone: "1234567890",
    };
  },
  getTrackingDetails: async ({ orderId }) => {
    return [
      {
        orderId,
        status: "pending",
      },
      {
        orderId,
        status: "pending",
      },
    ];
  },
};
