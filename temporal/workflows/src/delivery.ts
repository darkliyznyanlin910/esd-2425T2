import {
  ApplicationFailure,
  condition,
  defineSignal,
  proxyActivities,
  setHandler,
} from "@temporalio/workflow";

import type * as activities from "@repo/temporal-activities";
import type { Order, OrderStatus } from "@repo/temporal-common";

export const PICKUP_TIMEOUT = "10 min";
export const DELIVERY_TIMEOUT = "2 days";

export const driverFoundSignal = defineSignal<[string]>("DRIVER_FOUND");
export const pickedUpSignal = defineSignal("PICKED_UP");
export const deliveredSignal = defineSignal("DELIVERED");

const {
  updateOrderStatus,
  sendOrderToDrivers,
  notifyAdmin,
  assignOrderToDriver,
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
  let orderStatus: OrderStatus = "FINDING_DRIVER";

  if (manualAssignDriverId) {
    await updateOrderStatus(order.id, "DRIVER_FOUND");
    await assignOrderToDriver(order, manualAssignDriverId);
    await invalidateOrder(order);
    orderStatus = "DRIVER_FOUND";
  }

  if (order.orderStatus == "PAYMENT_SUCCESSFUL") {
    await updateOrderStatus(order.id, "FINDING_DRIVER");
    orderStatus = "FINDING_DRIVER";
  }

  setHandler(driverFoundSignal, async (driverId) => {
    if (orderStatus == "FINDING_DRIVER") {
      await updateOrderStatus(order.id, "DRIVER_FOUND");
      await assignOrderToDriver(order, driverId);
      await invalidateOrder(order);
      orderStatus = "DRIVER_FOUND";
    }
  });

  setHandler(pickedUpSignal, async () => {
    if (orderStatus == "DRIVER_FOUND") {
      await updateOrderStatus(order.id, "PICKED_UP");
      orderStatus = "PICKED_UP";
    }
  });

  setHandler(deliveredSignal, async () => {
    if (orderStatus == "PICKED_UP") {
      await updateOrderStatus(order.id, "DELIVERED");
      orderStatus = "DELIVERED";
    }
  });

  if (!manualAssignDriverId) {
    try {
      console.log("Sending order to drivers", order);
      await sendOrderToDrivers(order);
    } catch (error) {
      console.error(error);
      await updateOrderStatus(order.id, "DELAYED");
      await notifyAdmin(order);
      throw ApplicationFailure.create({
        message: "Failed to send order to drivers",
        type: "DELAYED",
        nonRetryable: true,
      });
    }
  }

  const notPickedUpInTime = !(await condition(
    () => orderStatus === "PICKED_UP",
    PICKUP_TIMEOUT,
  ));

  if (notPickedUpInTime) {
    await updateOrderStatus(order.id, "DELAYED");
    await notifyAdmin(order);
    throw ApplicationFailure.create({
      message: "Order not picked up in time",
      type: "DELAYED",
      nonRetryable: true,
    });
  }

  const notDeliveredInTime = !(await condition(
    () => orderStatus === "DELIVERED",
    DELIVERY_TIMEOUT,
  ));

  if (notDeliveredInTime) {
    await updateOrderStatus(order.id, "DELAYED");
    await notifyAdmin(order);
    throw ApplicationFailure.create({
      message: "Order not delivered in time",
      type: "DELAYED",
      nonRetryable: true,
    });
  }
}
