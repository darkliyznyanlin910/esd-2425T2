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
  const session = await stripeClient.checkout.sessions.create({
    customer: customerId,
    mode: "payment",
    line_items: lineItems,
    success_url: `${getServiceBaseUrl("order")}/payment/${orderId}?status=success&sessionId={CHECKOUT_SESSION_ID}`,
    cancel_url: `${getServiceBaseUrl("order")}/payment/${orderId}?status=failed&sessionId={CHECKOUT_SESSION_ID}`,
    invoice_creation: {
      enabled: true,
    },
  });
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
