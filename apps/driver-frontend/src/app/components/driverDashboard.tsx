"use client";

import { useEffect, useState } from "react";

import { authClient } from "@repo/auth/client";
import { Order } from "@repo/db-order/zod";
import { getServiceBaseUrl } from "@repo/service-discovery";
import { Button } from "@repo/ui/button";
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
  const { useSession } = authClient;
  const { data: session } = useSession();
  const handleAcceptOrder = async (orderId: string) => {
    try {
      const response = await fetch(
        `${getServiceBaseUrl("driver")}/driver/state/DRIVER_FOUND`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            orderId: orderId,
            driverId: session?.user.id,
          }),
        },
      );
      console.log("Order accepted:", response);
    } catch (error) {
      console.error("Failed to accept order:", error);
    }
  };

  useEffect(() => {
    const fetchFindingDriverOrders = async () => {
      try {
        const response = await fetch(
          `${getServiceBaseUrl("order")}/order/order/finding`,
          {
            method: "GET",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          },
        );

        if (!response.ok) {
          const errorData = await response.json();
          console.error("Error fetching finding driver orders:", errorData);
          return;
        }

        const data: Order[] = await response.json();
        console.log("Updated orders:", data);
        setOrders(data);
      } catch (error) {
        console.error("Failed to fetch finding driver orders:", error);
      }
    };
    fetchFindingDriverOrders();
    const intervalId = setInterval(fetchFindingDriverOrders, 5000);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const eventSource = new EventSource(
      `${getServiceBaseUrl("notification")}/driver/sse`,
      { withCredentials: true },
    );

    eventSource.addEventListener("broadcastOrder", (event) => {
      const newOrder: Order = JSON.parse(event.data);
      console.log("New order received:", newOrder);
      // setOrders((prevOrders) => [...prevOrders, newOrder]);
    });

    eventSource.addEventListener("invalidateOrder", (event) => {
      const invalidOrderId: string = event.data;
      console.log(`Order invalidated: ${invalidOrderId}`);

      // setOrders((prevOrders) =>
      //   prevOrders.filter((order) => order.id !== invalidOrderId),
      // );
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
            orders.map((data) => (
              <TableRow key={data.id}>
                <TableCell>{data.id}</TableCell>
                <TableCell>
                  {data.fromAddressLine1}, {data.fromAddressLine2},{" "}
                  {data.fromZipCode}
                </TableCell>
                <TableCell>
                  {data.toAddressLine1}, {data.toAddressLine2}, {data.toZipCode}
                </TableCell>
                <TableCell>{data.orderStatus}</TableCell>
                <TableCell>
                  <Button onClick={() => handleAcceptOrder(data.id)}>
                    Accept Order
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
