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

export async function sendOrderToDrivers(order: Order): Promise<void> {
  console.log("Sending order to drivers", JSON.stringify(order, null, 2));
}

export async function notifyAdmin(order: Order): Promise<void> {
  console.log("Notifying admin", JSON.stringify(order, null, 2));
}

export async function assignOrderToDriver(
  order: Order,
  driverId: string,
): Promise<void> {
  console.log("Assigning order to driver", JSON.stringify(order, null, 2));
  console.log("Driver ID", driverId);
}

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

export async function sendInvoiceToCustomer(invoice: Invoice): Promise<void> {
  console.log("Sending invoice to customer", JSON.stringify(invoice, null, 2));
}
