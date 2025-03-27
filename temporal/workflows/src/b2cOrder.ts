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

const {
  getUser,
  updateUser,
  createStripeCustomer,
  createStripeCheckoutSession,
  getStripeCheckoutSession,
  updateOrderStatus,
  getStripeInvoiceIdFromSessionId,
  getStripeInvoice,
  generateInvoice,
  sendInvoiceToCustomer,
  startDeliveryProcess,
} = proxyActivities<typeof activities>({
  startToCloseTimeout: "1m",
  retry: {
    maximumInterval: "1m",
  },
});

export async function order(order: Order) {
  let stripeSessionStatus: StripeSessionStatus | null = null;
  setHandler(getPaymentInformationQuery, () => {
    console.log(
      "sue Querying stripe session status in getpaymentinformationquery" +
        stripeSessionStatus,
    );

    if (!stripeSessionStatus) {
      return null;
    }

    const status =
      stripeSessionStatus === "open"
        ? "open"
        : stripeSessionStatus === "complete"
          ? stripeSessionStatus
          : "expired";

    if (status === "open") {
      return {
        status,
        sessionId: session.id,
        sessionUrl: session.url!,
      };
    }
    console.log(" sue payment status : ", status);

    return {
      status,
      sessionId: session.id,
    };
  });
  console.log("Ordering", order);
  const user = await getUser(order.userId);

  let stripeCustomerId = user.stripeCustomerId;

  if (!stripeCustomerId) {
    const customer = await createStripeCustomer(user.email);
    stripeCustomerId = customer.id;
    await updateUser(user.id, { stripeCustomerId });
  }
  console.log("Stripe customer ID", stripeCustomerId);

  const session = await createStripeCheckoutSession(
    stripeCustomerId,
    order.id,
    [
      {
        price_data: {
          currency: "SGD",
          unit_amount: ORDER_DEFAULT_UNIT_AMOUNT,
          product_data: {
            name: "Delivery Fee",
            description: `Order ID: ${order.displayId}

From: ${[order.fromAddressLine1, order.fromAddressLine2, order.fromZipCode].filter(Boolean).join(", ")}

To: ${[order.toAddressLine1, order.toAddressLine2, order.toZipCode].filter(Boolean).join(", ")}

Created at: ${order.createdAt.toLocaleString()}`,
          },
        },
      },
    ],
  );

  stripeSessionStatus = session.status;

  setHandler(paymentSucceededSignal, async (sessionId) => {
    console.log("Sending payment succeeded signal");
    const temp = await getStripeCheckoutSession(sessionId);
    if (!temp.status) {
      throw ApplicationFailure.create({
        message: "Stripe session status is null",
      });
    }
    if (temp.status !== "complete") {
      throw ApplicationFailure.create({
        message: "Stripe session status is not complete",
      });
    }
    stripeSessionStatus = "complete";
  });

  setHandler(paymentFailedSignal, async (sessionId) => {
    console.log(" sending payment failed signal");
    const temp = await getStripeCheckoutSession(sessionId);
    if (!temp.status) {
      throw ApplicationFailure.create({
        message: "Stripe session status is null",
      });
    }

    if (temp.status !== "expired") {
      throw ApplicationFailure.create({
        message: "Stripe session status is not expired",
      });
    }

    stripeSessionStatus = "expired";
  });

  const isPaymentSuccessful = await condition(
    () => stripeSessionStatus === "complete",
    PAYMENT_TIMEOUT,
  );

  if (isPaymentSuccessful) {
    await updateOrderStatus(order.id, "PAYMENT_SUCCESSFUL");
    const invoiceId = await getStripeInvoiceIdFromSessionId(session.id);
    const stripeInvoice = await getStripeInvoice(invoiceId);
    const invoice = await generateInvoice(
      order,
      stripeInvoice.amount_due / 100,
      stripeInvoice.invoice_pdf ?? undefined,
      stripeInvoice.id,
    );
    await sendInvoiceToCustomer(invoice);
    await startDeliveryProcess(order);
  } else {
    await updateOrderStatus(order.id, "PAYMENT_FAILED");
  }
}
