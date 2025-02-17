import {
  ApplicationFailure,
  condition,
  defineQuery,
  defineSignal,
  proxyActivities,
  setHandler,
} from "@temporalio/workflow";

import * as activities from "@repo/temporal-activities";
import { Order, OrderStatus } from "@repo/temporal-common";

export const driverFoundSignal = defineSignal<[string]>("driverFound");
export const pickedUpSignal = defineSignal("pickedUp");
export const deliveredSignal = defineSignal("delivered");
export const getStatusQuery = defineQuery<Promise<OrderStatus>>("getStatus");

const {
  updateOrderStatus,
  getOrderStatus,
  sendOrderToDrivers,
  notifyAdmin,
  assignOrderToDriver,
  generateInvoice,
  sendInvoiceToCustomer,
} = proxyActivities<typeof activities>({
  startToCloseTimeout: "1m",
  retry: {
    maximumInterval: "1m",
  },
});

export async function order(
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

  setHandler(getStatusQuery, async () => {
    const status = await getOrderStatus(order.id);
    orderStatus = status;
    return status;
  });

  setHandler(driverFoundSignal, async (driverId) => {
    await updateOrderStatus(order.id, "driverFound");
    await assignOrderToDriver(order, driverId);
    orderStatus = "driverFound";
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
      const invoice = await generateInvoice(order);
      await sendInvoiceToCustomer(invoice);
      orderStatus = "delivered";
    }
  });

  try {
    await sendOrderToDrivers(order);
  } catch (error) {
    await updateOrderStatus(order.id, "delayed");
    throw new ApplicationFailure("Failed to send order to drivers", "DELAYED");
  }

  const notPickedUpInTime = !(await condition(
    () => orderStatus === "pickedUp",
    "1 min",
  ));

  if (notPickedUpInTime) {
    await updateOrderStatus(order.id, "delayed");
    await notifyAdmin(order);
    throw new ApplicationFailure("Order not picked up in time", "DELAYED");
  }
}
