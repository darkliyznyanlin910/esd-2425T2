import { useEffect, useState } from "react";

import { getServiceBaseUrl } from "@repo/service-discovery";

interface OrderData {
  id: string;
  fromAddress: string;
  toAddress: string;
  orderStatus: string;
}

export default function DriverDashboard() {
  const [orders, setOrders] = useState<OrderData[]>([]);

  useEffect(() => {
    const eventSource = new EventSource(
      `${getServiceBaseUrl("notification")}/driver/sse`,
      { withCredentials: true },
    );

    eventSource.addEventListener("broadcastOrder", (event) => {
      const newOrder: OrderData = JSON.parse(event.data);
      console.log("New order received:", newOrder);
      setOrders((prevOrders) => [...prevOrders, newOrder]);
    });

    eventSource.addEventListener("invalidateOrder", (event) => {
      const invalidOrderId: string = event.data;
      console.log(`Order invalidated: ${invalidOrderId}`);

      setOrders((prevOrders) =>
        prevOrders.filter((order) => order.id !== invalidOrderId),
      );
    });

    eventSource.onerror = (error) => {
      console.error("SSE error:", error);
      eventSource.close();
    };

    return () => {
      eventSource.close();
      console.log("SSE connection closed");
    };
  }, []);

  return (
    <div>
      <h1>Driver Dashboard</h1>
      <h2>Available Orders</h2>
      {orders.length === 0 ? (
        <p>No new orders yet.</p>
      ) : (
        <ul>
          {orders.map((order) => (
            <li key={order.id}>
              Order #{order.id} - From: {order.fromAddress} To:{" "}
              {order.toAddress} | Status: {order.orderStatus}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
