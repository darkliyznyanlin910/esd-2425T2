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

export const ORDER_DEFAULT_UNIT_AMOUNT = 5;
export const PAYMENT_TIMEOUT = "5m";

export const getPaymentInformationQuery = defineQuery<
  Promise<z.infer<typeof paymentInformationSchema>>
>("getPaymentInformation");

export const paymentSucceededSignal =
  defineSignal<[string]>("paymentSucceeded");

export const paymentFailedSignal = defineSignal<[string]>("paymentFailed");

const {
  getUser,
  createStripeCustomer,
  createStripeCheckoutSession,
  getStripeCheckoutSession,
  updateOrderStatus,
  getStripeInvoiceIdFromSessionId,
  getStripeInvoice,
  generateInvoice,
  sendInvoiceToCustomer,
} = proxyActivities<typeof activities>({
  startToCloseTimeout: "1m",
  retry: {
    maximumInterval: "1m",
  },
});

export async function order(order: Order) {
  console.log("Order received", order);

  const user = await getUser(order.userId);
  let stripeCustomerId = user.stripeCustomerId;

  if (!stripeCustomerId) {
    const customer = await createStripeCustomer(user.email);
    stripeCustomerId = customer.id;
  }

  let stripeSessionStatus: StripeSessionStatus | null = null;

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

  setHandler(getPaymentInformationQuery, async () => {
    const temp = await getStripeCheckoutSession(session.id);
    if (!temp.status) {
      throw ApplicationFailure.create({
        nonRetryable: true,
        message: "Stripe session status is null",
      });
    }

    const status =
      temp.status === "open"
        ? "open"
        : temp.status === "complete"
          ? temp.status
          : "expired";

    if (status === "open") {
      return {
        status,
        sessionId: temp.id,
        sessionUrl: temp.url!,
      };
    }

    return {
      status,
      sessionId: temp.id,
    };
  });

  setHandler(paymentSucceededSignal, async (sessionId) => {
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
      stripeInvoice.hosted_invoice_url ?? undefined,
    );
    await sendInvoiceToCustomer(invoice);
  } else {
    await updateOrderStatus(order.id, "PAYMENT_FAILED");
  }
}
