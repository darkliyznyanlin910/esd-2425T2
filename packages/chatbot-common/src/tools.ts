import { z } from "zod";

import type { AiSdkToolSet } from "@repo/chatbot-common";
import { getServiceBaseUrl } from "@repo/service-discovery";

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
  getInvoice: {
    description: "show the invoice details to the user",
    parameters: z.object({
      orderId: z.string(),
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
  getTrackingDetails: Promise<
    {
      orderId: string;
      status: string;
    }[]
  >;
  selectOrder: void;
  getInvoice: Promise<{
    orderId: string;
    amount: number;
    url: string;
  }>;
}

export const toolFunctionMap: ToolFunctionMap = {
  getOrders: async ({ take, page, sortBy, sortOrder }) => {
    const url = new URL(`${getServiceBaseUrl("order")}/order/order`);
    url.searchParams.set("take", take.toString());
    url.searchParams.set("page", page.toString());
    url.searchParams.set("sortBy", sortBy);
    url.searchParams.set("sortOrder", sortOrder);

    const res = await fetch(url, {
      credentials: "include",
    });
    const data = await res.json();
    if (!Array.isArray(data)) return [];
    return data.map((order: any) => String(order.id));
  },
  getOrderDetails: async ({ orderId }) => {
    const url = new URL(`${getServiceBaseUrl("order")}/order/${orderId}`);

    const res = await fetch(url, {
      credentials: "include",
    });
    const data = (await res.json()) as { orderStatus: string };
    return {
      orderId,
      status: data.orderStatus,
    };
  },
  getTrackingDetails: async ({ orderId }) => {
    const url = new URL(
      `${getServiceBaseUrl("order")}/order/tracking/${orderId}`,
    );

    const res = await fetch(url, {
      credentials: "include",
    });
    const data = (await res.json()) as {
      orderId: string;
      status: string;
    }[];
    return data.map((order) => ({
      orderId: order.orderId,
      status: order.status,
    }));
  },
  getInvoice: async ({ orderId }) => {
    const url = new URL(
      `${getServiceBaseUrl("invoice")}/invoice/invoices/order/${orderId}`,
    );
    const res = await fetch(url, {
      credentials: "include",
    });
    const data = (await res.json()) as {
      orderId: string;
      amount: number;
      invoiceUrl: string;
    };
    return {
      orderId,
      amount: data.amount,
      url: data.invoiceUrl,
    };
  },
};
