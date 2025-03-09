import { ApplicationFailure, log } from "@temporalio/activity";

import { HonoClient as UserClient } from "@repo/auth/type";
import { User, UserSchema } from "@repo/db-auth/zod";
import { HonoClient as NotificationClient } from "@repo/notification-backend/type";
import { getServiceBaseUrl } from "@repo/service-discovery";
import { Invoice, Order, OrderStatus } from "@repo/temporal-common";

import { env } from "./env";

export * from "./stripe";

export async function updateOrderStatus(
  orderId: Order["id"],
  status: OrderStatus,
): Promise<void> {
  const res = await fetch(`${getServiceBaseUrl("order")}/order/${orderId}`, {
    method: "POST",
    body: JSON.stringify({ orderStatus: status }),
    headers: {
      Authorization: `Bearer ${env.INTERNAL_COMMUNICATION_SECRET}`,
    },
  });
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
  if (!res.ok) {
    throw ApplicationFailure.create({
      nonRetryable: true,
      message: "Failed to invalidate order",
    });
  }
  log.info("Invalidated order", { res });
}

export async function generateInvoice(order: Order): Promise<Invoice> {
  const temp: Invoice = {
    id: "1",
    orderId: order.id,
    customerId: order.userId,
    status: "PENDING",
    path: "https://example.com/invoice",
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  log.info("Generated invoice", { invoice: JSON.stringify(temp, null, 2) });
  return temp;
}

export async function sendInvoiceToCustomer(invoice: Invoice): Promise<void> {
  log.info("Sending invoice to customer", {
    invoice: JSON.stringify(invoice, null, 2),
  });
}

export async function getUser(userId: string): Promise<User> {
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
