"use client";

import { useEffect, useState } from "react";

import { Order } from "@repo/db-order/zod";
import { getServiceBaseUrl } from "@repo/service-discovery";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/table";

export default function DriverDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const handleAcceptOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Accept order");
    // try{
    //   const response = await fetch(
    //     `${getServiceBaseUrl("order")}/order/order/finding`,
    //     {
    //       method: "GET",
    //       headers: {
    //         "Content-Type": "application/json",
    //       },
    //       body: JSON.stringify({ availability: "AVAILABLE" }),
    //     },
    //   );
    //   console.log(updatedSession.data?.user.id);

    //   if (!response.ok) {
    //     const errorData = await response.json();
    //     console.error("Error updating driver availability:", errorData);
    //     return;
    //   }

    //   const data = await response.json();
    //   console.log("Driver availability updated:", data);
    // } catch (error) {
    //   console.error("Failed to update driver availability:", error);
    // }
  };

  useEffect(() => {
    const eventSource = new EventSource(
      `${getServiceBaseUrl("notification")}/driver/sse`,
      { withCredentials: true },
    );

    eventSource.addEventListener("broadcastOrder", (event) => {
      const newOrder: Order = JSON.parse(event.data);
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
    <div className="flex flex-col items-center">
      <h1 className="text-2xl font-bold">Driver Dashboard</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order ID</TableHead>
            <TableHead>From Address</TableHead>
            <TableHead>To Address</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.length === 0 ? (
            <TableRow>
              <TableCell className="text-center text-lg" colSpan={5}>
                No new orders yet.
              </TableCell>
            </TableRow>
          ) : (
            orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell>{order.id}</TableCell>
                <TableCell>
                  {order.fromAddressLine1}, {order.fromAddressLine2},{" "}
                  {order.fromZipCode}
                </TableCell>
                <TableCell>
                  {order.toAddressLine1}, {order.toAddressLine2},{" "}
                  {order.toZipCode}
                </TableCell>
                <TableCell>{order.orderStatus}</TableCell>
                <TableCell>
                  <button
                    className="text-blue-500 underline hover:text-blue-700"
                    onClick={handleAcceptOrder}
                  >
                    Accept Order
                  </button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
