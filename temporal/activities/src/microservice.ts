import { ApplicationFailure, log } from "@temporalio/activity";
import axios from "axios";

import type { User } from "@repo/db-auth/zod";
import type { Invoice, Order, OrderStatus } from "@repo/temporal-common";
import { HonoClient as UserClient } from "@repo/auth/type";
import { UserSchema } from "@repo/db-auth/zod";
import { HonoClient as NotificationClient } from "@repo/notification-backend/type";
import { getServiceBaseUrl } from "@repo/service-discovery";

import { app } from "../../../apps/auth/src/app";
import { env } from "./env";

export * from "./stripe";

export async function updateOrderStatus(
  orderId: Order["id"],
  status: OrderStatus,
): Promise<void> {
  const res = await fetch(
    `${getServiceBaseUrl("order")}/order/updateStatus/${orderId}`,
    {
      method: "POST",
      body: JSON.stringify({
        orderStatus: status,
      }),
      headers: {
        Authorization: `Bearer ${env.INTERNAL_COMMUNICATION_SECRET}`,
        "Content-Type": "application/json",
      },
    },
  );

  if (!res.ok) {
    throw ApplicationFailure.create({
      nonRetryable: true,
      message: "Failed to update order status",
    });
  }
  const data = await res.json();
  log.info("Updated order status", { data });
}
export async function removeOrderAssignment(
  orderId: Order["id"],
): Promise<void> {
  const res = await fetch(
    `${getServiceBaseUrl("driver")}/driver/orderAssignment/${orderId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${env.INTERNAL_COMMUNICATION_SECRET}`,
        "Content-Type": "application/json",
      },
    },
  );
  if (!res.ok) {
    throw ApplicationFailure.create({
      nonRetryable: true,
      message: "Failed to remove order assignment",
    });
  }
  const data = await res.json();
  log.info("Removed order assignment", { data });
}
export async function getOrderStatus(
  orderId: Order["id"],
): Promise<OrderStatus> {
  const res = await fetch(`${getServiceBaseUrl("order")}/order/${orderId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${env.INTERNAL_COMMUNICATION_SECRET}`,
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) {
    throw ApplicationFailure.create({
      nonRetryable: true,
      message: "Failed to get order status",
    });
  }
  const data = (await res.json()) as Order;
  return data.orderStatus as OrderStatus;
}

export async function sendOrderToDrivers(order: Order): Promise<void> {
  try {
    const res = await NotificationClient.driver.send.$post(
      {
        json: order,
      },
      {
        init: {
          headers: {
            Authorization: `Bearer ${env.INTERNAL_COMMUNICATION_SECRET}`,
            "Content-Type": "application/json",
          },
        },
      },
    );

    const responseBody = await res.json();
    log.info("Sending order to drivers", {
      orderId: order.id,
      status: res.status,
      responseBody,
    });

    if (!res.ok) {
      throw new Error(
        `Failed to send order to drivers: ${res.status} ${res.statusText}`,
      );
    }

    log.info("Successfully sent order to drivers", {
      orderId: order.id,
      responseBody,
    });
  } catch (error) {
    log.error("Error sending order to drivers", {
      orderId: order.id,
      error: error instanceof Error ? error.message : String(error),
    });
    throw ApplicationFailure.create({
      nonRetryable: true,
      message: `Failed to send order to drivers: ${
        error instanceof Error ? error.message : String(error)
      }`,
    });
  }
}

export async function notifyAdmin(order: Order): Promise<void> {
  const res = await NotificationClient.admin.sendReassignment.$post(
    {
      json: order,
    },
    {
      init: {
        headers: {
          Authorization: `Bearer ${env.INTERNAL_COMMUNICATION_SECRET}`,
          "Content-Type": "application/json",
        },
      },
    },
  );
  if (!res.ok) {
    throw ApplicationFailure.create({
      nonRetryable: true,
      message: "Failed to send reassignment request to admin",
    });
  }
  log.info("Sent reassignment request to admin", { res });
}

export async function assignOrderToDriver(
  order: Order,
  driverId: string,
): Promise<void> {
  await fetch(`${getServiceBaseUrl("driver")}/driver/assign`, {
    method: "POST",
    body: JSON.stringify({
      orderId: order.id,
      driverId,
    }),
    headers: {
      Authorization: `Bearer ${env.INTERNAL_COMMUNICATION_SECRET}`,
      "Content-Type": "application/json",
    },
  });
}

export async function invalidateOrder(order: Order): Promise<void> {
  try {
    const res = await NotificationClient.driver.invalidate.$post(
      {
        json: order,
      },
      {
        init: {
          headers: {
            Authorization: `Bearer ${env.INTERNAL_COMMUNICATION_SECRET}`,
            "Content-Type": "application/json",
          },
        },
      },
    );
    log.info("Invalidated order", { res });
  } catch (error) {
    log.error("Failed to invalidate order", { error });
    throw ApplicationFailure.create({
      nonRetryable: true,
      message: "Failed to invalidate order",
    });
  }
}

export async function generateInvoice(
  order: Order,
  amount: number,
  stripeInvoiceUrl?: string,
  stripeInvoiceId?: string,
): Promise<Invoice> {
  let status: Invoice["status"] = "PENDING";

  if (!stripeInvoiceUrl) {
    throw ApplicationFailure.create({
      nonRetryable: true,
      message: `No invoice URL provided for order ID ${order.id}`,
    });
  }

  try {
    // Download PDF from Stripe
    const response = await axios.get(stripeInvoiceUrl, {
      responseType: "arraybuffer",
      maxRedirects: 5,
    });
    const pdfBuffer = Buffer.from(response.data);

    if (!pdfBuffer) {
      // throw new Error("Failed to download PDF from Stripe");
      throw ApplicationFailure.create({
        nonRetryable: true,
        message: `Failed to download pdf from stripe`,
      });
    }

    // Get S3 Upload URL
    const urlResponse = await fetch(
      `${getServiceBaseUrl("invoice")}/invoice/uploadURL`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orderId: order.id }),
      },
    );

    if (!urlResponse.ok) {
      // throw new Error(`Failed to get upload URL: ${urlResponse.status}`);
      throw ApplicationFailure.create({
        nonRetryable: true,
        message: `Failed to get upload url pdf to stripe`,
      });
    }

    const { uploadUrl, key } = (await urlResponse.json()) as {
      uploadUrl: string;
      key: string;
    };

    const uploadResponse = await axios.put(uploadUrl, pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
      },
    });

    if (uploadResponse.status !== 200) {
      // throw new Error(`Failed to upload PDF to S3: ${uploadResponse.status}`);
      throw ApplicationFailure.create({
        nonRetryable: true,
        message: `Failed to upload PDF to S3`,
      });
    }

    // Create Invoice Record
    const invoicePayload = {
      orderId: order.id,
      customerId: order.userId,
      status: "COMPLETED",
      path: key,
      amount: amount,
    };

    const createInvoiceResponse = await fetch(
      `${getServiceBaseUrl("invoice")}/invoice/invoices`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(invoicePayload),
      },
    );

    if (!createInvoiceResponse.ok) {
      // throw new Error(
      //   `Failed to create invoice: ${createInvoiceResponse.status}`,
      // );
      throw ApplicationFailure.create({
        nonRetryable: true,
        message: `Failed to create invoice`,
      });
    }

    return {
      id: stripeInvoiceId as unknown as string,
      orderId: order.id,
      customerId: order.userId,
      status: "COMPLETED",
      amount,
      path: key,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  } catch (error) {
    console.error("Invoice generation error:", error);
    throw ApplicationFailure.create({
      nonRetryable: true,
      message: `Failed to process invoice for order ID ${order.id}: ${error instanceof Error ? error.message : String(error)}`,
    });
  }
}

export async function sendInvoiceToCustomer(invoice: Invoice): Promise<void> {
  log.info("Sending invoice to customer", {
    invoice: JSON.stringify(invoice, null, 2),
  });
}

export async function getUser(userId: string): Promise<User> {
  console.log("Getting user", userId);
  const res = await UserClient.user[":id"].$get({
    param: {
      id: userId,
    },
  });

  if (!res.ok) {
    throw ApplicationFailure.create({
      nonRetryable: true,
      message: "Failed to get user",
    });
  }
  const data = await res.json();
  return UserSchema.parse(data);
}

export async function updateUser(
  userId: string,
  updateData: { stripeCustomerId: string },
): Promise<void> {
  console.log("Updating user:", userId, "with data:", updateData);

  const res = await fetch(
    `${getServiceBaseUrl("auth")}/user/${userId}/stripeCustomerId`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updateData),
    },
  );
  console.log(" sue response : " + JSON.stringify(res));

  if (!res.ok) {
    throw ApplicationFailure.create({
      nonRetryable: true,
      message: `Failed to update user ${userId} with Stripe customer ID ${updateData.stripeCustomerId} - ${res.status}}`,
    });
  }

  console.log("Successfully updated user with stripeCustomerId:", userId);
}

export async function startDeliveryProcess(order: Order): Promise<void> {
  log.info("Starting delivery process", {
    order: JSON.stringify(order, null, 2),
  });
  const res = await fetch(
    `${getServiceBaseUrl("order")}/order/process/${order.id}`,
    {
      headers: {
        Authorization: `Bearer ${env.INTERNAL_COMMUNICATION_SECRET}`,
      },
    },
  );
  if (!res.ok) {
    console.error("Failed to start delivery process", res.status);
    throw ApplicationFailure.create({
      nonRetryable: true,
      message: "Failed to start delivery process",
    });
  } else {
    log.info("Successfully started delivery process", {
      order: JSON.stringify(order, null, 2),
    });
  }
}
