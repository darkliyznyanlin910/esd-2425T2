import { z } from "zod";

import type { AiSdkToolSet } from "@repo/chatbot-common";

const orderIdSchema = z.object({ orderId: z.string() });

export const backendTools = {
  getOrders: {
    description: "show the orders to the user",
    parameters: z.object({
      take: z.number().default(10).describe("the number of orders to show"),
      page: z.number().default(1).describe("the page number to show"),
      sortBy: z
        .enum(["createdAt", "updatedAt"])
        .default("createdAt")
        .describe("the field to sort by"),
      sortOrder: z
        .enum(["asc", "desc"])
        .default("desc")
        .describe("the order to sort by"),
    }),
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
  selectOrder: {
    description: "You give options to the user to select an order",
    parameters: z.object({
      orderIds: z.array(z.string()),
    }),
  },
} satisfies AiSdkToolSet;

export type ToolName = keyof typeof backendTools;

export type ToolResult = {
  [K in ToolName]: Awaited<ToolReturnTypes[K]>;
};

export type ToolFunctionMap = {
  [K in ToolName]?: (
    params: z.infer<(typeof backendTools)[K]["parameters"]>,
  ) => ToolReturnTypes[K];
};

export interface ToolReturnTypes {
  getOrders: Promise<string[]>;
  getOrderDetails: Promise<{ orderId: string; status: string }>;
  getDriverDetails: Promise<{
    orderId: string;
    driverName: string;
    driverPhone: string;
  }>;
  getTrackingDetails: Promise<
    {
      orderId: string;
      status: string;
    }[]
  >;
  selectOrder: void;
}

export const toolFunctionMap: ToolFunctionMap = {
  getOrders: async () => {
    return ["123", "456", "789"] as string[];
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
