import { proxyActivities } from "@temporalio/workflow";

import type * as activities from "@repo/temporal-activities";
import type { Order } from "@repo/temporal-common";

const { updateOrderStatus, generateInvoice, startDeliveryProcess } =
  proxyActivities<typeof activities>({
    startToCloseTimeout: "1m",
    retry: {
      maximumInterval: "1m",
    },
  });

export async function b2bOrder(order: Order) {
  await updateOrderStatus(order.id, "PAYMENT_SUCCESSFUL");
  await generateInvoice(order, 10);
  await startDeliveryProcess(order);
}
