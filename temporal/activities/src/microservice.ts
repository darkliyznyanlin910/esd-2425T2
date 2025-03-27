import { ApplicationFailure, log } from "@temporalio/activity";

import type { User } from "@repo/db-auth/zod";
import type { Invoice, Order, OrderStatus } from "@repo/temporal-common";
import { HonoClient as UserClient } from "@repo/auth/type";
import { UserSchema } from "@repo/db-auth/zod";
import { HonoClient as NotificationClient } from "@repo/notification-backend/type";
import { getServiceBaseUrl } from "@repo/service-discovery";

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
      body: {
        orderStatus: status,
      },
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

export async function getOrderStatus(
  orderId: Order["id"],
): Promise<OrderStatus> {
  const res = await fetch(`${getServiceBaseUrl("order")}/order/${orderId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${env.INTERNAL_COMMUNICATION_SECRET}`,
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
  const res = await NotificationClient.driver.send.$post(
    {
      json: order,
    },
    {
      init: {
        headers: {
          Authorization: `Bearer ${env.INTERNAL_COMMUNICATION_SECRET}`,
        },
      },
    },
  );
  if (!res.ok) {
    throw ApplicationFailure.create({
      nonRetryable: true,
      message: "Failed to send order to drivers",
    });
  }
  log.info("Sent order to drivers", { res });
}

export async function notifyAdmin(order: Order): Promise<void> {
  log.info("Notifying admin", { order: JSON.stringify(order, null, 2) });
}

export async function assignOrderToDriver(
  order: Order,
  driverId: string,
): Promise<void> {
  log.info("Assigning order to driver", {
    order: JSON.stringify(order, null, 2),
    driverId,
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
): Promise<Invoice> {
  let invoiceUrl = "";
  let status: Invoice["status"] = "PENDING";
  if (stripeInvoiceUrl) {
    console.log("Stripe invoice URL provided");
    invoiceUrl = stripeInvoiceUrl;
    status = "COMPLETED";
  } else {
    console.log("No stripe invoice URL provided");
    invoiceUrl = "https://example.com/invoice";
  }

  const temp: Invoice = {
    id: "1",
    orderId: order.id,
    customerId: order.userId,
    status,
    amount,
    path: invoiceUrl,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  return temp;
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
