import { Invoice, Order, OrderStatus } from "@repo/temporal-common";

export async function updateOrderStatus(
  orderId: Order["id"],
  status: OrderStatus,
): Promise<void> {}

export async function getOrderStatus(
  orderId: Order["id"],
): Promise<OrderStatus> {
  return "processing";
}

export async function sendOrderToDrivers(order: Order): Promise<void> {}

export async function notifyAdmin(order: Order): Promise<void> {}

export async function assignOrderToDriver(
  order: Order,
  driverId: string,
): Promise<void> {}

export async function generateInvoice(order: Order): Promise<Invoice> {
  return {
    id: "1",
    orderId: order.id,
    customerId: order.userId,
    amount: 100,
    status: "pending",
    invoiceUrl: "https://example.com/invoice",
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

export async function sendInvoiceToCustomer(invoice: Invoice): Promise<void> {}
