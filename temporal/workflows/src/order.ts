import {
  ApplicationFailure,
  condition,
  defineQuery,
  defineSignal,
  proxyActivities,
  setHandler,
} from "@temporalio/workflow";
import { z } from "zod";

import * as activities from "@repo/temporal-activities";
import { Order, paymentInformationSchema } from "@repo/temporal-common";

export const getPaymentInformationQuery = defineQuery<
  z.infer<typeof paymentInformationSchema>
>("getPaymentInformation");

export const paymentSucceededSignal = defineSignal("paymentSucceeded");

export const paymentFailedSignal = defineSignal("paymentFailed");

const {} = proxyActivities<typeof activities>({
  startToCloseTimeout: "1m",
  retry: {
    maximumInterval: "1m",
  },
});

export async function order(order: Order, stripeCheckoutSessionId: string) {
  setHandler(getPaymentInformationQuery, () => {
    return {
      status: "pending",
      amount: 100,
      currency: "USD",
      paymentMethod: "credit card",
    };
  });
  console.log(order);
}
