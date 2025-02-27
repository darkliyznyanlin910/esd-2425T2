import {
  ApplicationFailure,
  condition,
  defineSignal,
  proxyActivities,
  setHandler,
} from "@temporalio/workflow";

import * as activities from "@repo/temporal-activities";
import { Order, OrderStatus } from "@repo/temporal-common";

export const PICKUP_TIMEOUT = "10 min";
export const DELIVERY_TIMEOUT = "2 days";

export const driverFoundSignal = defineSignal<[string]>("driverFound");
export const pickedUpSignal = defineSignal("pickedUp");
export const deliveredSignal = defineSignal("delivered");

const {
  updateOrderStatus,
  sendOrderToDrivers,
  notifyAdmin,
  assignOrderToDriver,
  generateInvoice,
  sendInvoiceToCustomer,
  invalidateOrder,
} = proxyActivities<typeof activities>({
  startToCloseTimeout: "1m",
  retry: {
    maximumInterval: "1m",
  },
});

export async function delivery(
  order: Order,
  manualAssignDriverId?: string,
): Promise<void> {
  if (order.orderStatus == "processing") {
    await updateOrderStatus(order.id, "findingDriver");
  }

  let orderStatus: OrderStatus = "findingDriver";

  if (manualAssignDriverId) {
    await updateOrderStatus(order.id, "driverFound");
    await assignOrderToDriver(order, manualAssignDriverId);
    orderStatus = "driverFound";
  }

  setHandler(driverFoundSignal, async (driverId) => {
    if (orderStatus == "findingDriver") {
      await updateOrderStatus(order.id, "driverFound");
      await assignOrderToDriver(order, driverId);
      await invalidateOrder(order);
      orderStatus = "driverFound";
    }
  });

  setHandler(pickedUpSignal, async () => {
    if (orderStatus == "driverFound") {
      await updateOrderStatus(order.id, "pickedUp");
      orderStatus = "pickedUp";
    }
  });

  setHandler(deliveredSignal, async () => {
    if (orderStatus == "pickedUp") {
      await updateOrderStatus(order.id, "delivered");
      orderStatus = "delivered";
    }
  });

  try {
    await sendOrderToDrivers(order);
  } catch (error) {
    await updateOrderStatus(order.id, "delayed");
    throw ApplicationFailure.create({
      message: "Failed to send order to drivers",
      type: "DELAYED",
    });
  }

  const notPickedUpInTime = !(await condition(
    () => orderStatus === "pickedUp",
    PICKUP_TIMEOUT,
  ));

  if (notPickedUpInTime) {
    await updateOrderStatus(order.id, "delayed");
    await notifyAdmin(order);
    throw ApplicationFailure.create({
      message: "Order not picked up in time",
      type: "DELAYED",
      nonRetryable: true,
    });
  }

  const notDeliveredInTime = !(await condition(
    () => orderStatus === "delivered",
    DELIVERY_TIMEOUT,
  ));

  if (notDeliveredInTime) {
    await updateOrderStatus(order.id, "delayed");
    await notifyAdmin(order);
    throw ApplicationFailure.create({
      message: "Order not delivered in time",
      type: "DELAYED",
      nonRetryable: true,
    });
  }

  const invoice = await generateInvoice(order);
  await sendInvoiceToCustomer(invoice);
}
