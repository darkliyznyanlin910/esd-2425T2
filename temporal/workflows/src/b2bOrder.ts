import { Duration } from "@temporalio/common";
import { proxyActivities } from "@temporalio/workflow";

import type * as activities from "@repo/temporal-activities";
import type { Order } from "@repo/temporal-common";

const ACTIVITY_TIMEOUT = "1m";
const ACTIVITY_RETRY_MAX_INTERVAL = "1m";

const { updateOrderStatus, generateInvoice, startDeliveryProcess } =
  proxyActivities<typeof activities>({
    startToCloseTimeout: ACTIVITY_TIMEOUT as Duration,
    retry: {
      maximumInterval: ACTIVITY_RETRY_MAX_INTERVAL as Duration,
    },
  });

export async function b2bOrder(order: Order) {
  await updateOrderStatus(order.id, "PAYMENT_SUCCESSFUL");
  await generateInvoice(order, 10);
  await startDeliveryProcess(order);
}
