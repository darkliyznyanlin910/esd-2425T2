import { ApplicationFailure } from "@temporalio/activity";
import Stripe from "stripe";

import { getServiceBaseUrl } from "@repo/service-discovery";

import { env } from "./env";

const stripeClient = new Stripe(env.STRIPE_SECRET_KEY);

export async function createStripeCustomer(email: string) {
  const customer = await stripeClient.customers.create({ email });
  return customer;
}

export async function createStripeCheckoutSession(
  customerId: string,
  orderId: string,
  lineItems: Stripe.Checkout.SessionCreateParams.LineItem[],
) {
  const updatedLineItems = lineItems.map((item) => ({
    ...item,
    quantity: item.quantity ?? 1,
  }));
  console.log(
    " sue Creating Stripe Checkout Session with Line Items:",
    updatedLineItems,
  );
  console.log("customer ID" + customerId);
  const session = await stripeClient.checkout.sessions.create({
    customer: customerId,
    mode: "payment",
    line_items: updatedLineItems,
    success_url: `${getServiceBaseUrl("order", false)}/payment/${orderId}?status=success&sessionId={CHECKOUT_SESSION_ID}`,
    cancel_url: `${getServiceBaseUrl("order", false)}/payment/${orderId}?status=failed&sessionId={CHECKOUT_SESSION_ID}`,
    invoice_creation: {
      enabled: true,
    },
  });

  console.log(" sue Stripe Checkout Session Created:", session.id);
  return session;
}

export async function getStripeCheckoutSession(sessionId: string) {
  const session = await stripeClient.checkout.sessions.retrieve(sessionId);
  return session;
}

export async function getStripeInvoiceIdFromSessionId(
  sessionId: string,
): Promise<string> {
  const session = await stripeClient.checkout.sessions.retrieve(sessionId);
  if (!session.invoice) {
    throw ApplicationFailure.create({
      message: "Stripe session invoice is null",
    });
  } else {
    if (typeof session.invoice === "string") {
      return session.invoice;
    } else {
      return session.invoice.id;
    }
  }
}

export async function getStripeInvoice(invoiceId: string) {
  const invoice = await stripeClient.invoices.retrieve(invoiceId);
  return invoice;
}
