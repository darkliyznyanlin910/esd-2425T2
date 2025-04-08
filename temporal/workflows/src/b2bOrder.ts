import {
  ApplicationFailure,
  condition,
  defineQuery,
  defineSignal,
  proxyActivities,
  setHandler,
} from "@temporalio/workflow";
import { z } from "zod";

import type * as activities from "@repo/temporal-activities";
import type {
  Order,
  paymentInformationSchema,
  StripeSessionStatus,
} from "@repo/temporal-common";

export const ORDER_DEFAULT_UNIT_AMOUNT = 5000;
export const PAYMENT_TIMEOUT = "5m";

export const getPaymentInformationQuery = defineQuery<z.infer<
  typeof paymentInformationSchema
> | null>("getPaymentInformation");

export const paymentSucceededSignal =
  defineSignal<[string]>("paymentSucceeded");

export const paymentFailedSignal = defineSignal<[string]>("paymentFailed");

const { updateOrderStatus, generateInvoice, startDeliveryProcess } =
  proxyActivities<typeof activities>({
    startToCloseTimeout: "1m",
    retry: {
      maximumInterval: "1m",
    },
  });

export async function order(order: Order) {
  await updateOrderStatus(order.id, "PAYMENT_SUCCESSFUL");
  await generateInvoice(order, 10);
  await startDeliveryProcess(order);
}
