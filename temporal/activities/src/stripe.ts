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
    success_url: `${getServiceBaseUrl("order")}/payment/${orderId}/{CHECKOUT_SESSION_ID}`,
    cancel_url: `${getServiceBaseUrl("order")}/payment/${orderId}/{CHECKOUT_SESSION_ID}`,
  });
  return session;
}

export async function getStripeCheckoutSession(sessionId: string) {
  const session = await stripeClient.checkout.sessions.retrieve(sessionId);
  return session;
}
