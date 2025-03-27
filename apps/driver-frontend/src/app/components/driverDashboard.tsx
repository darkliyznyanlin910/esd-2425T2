"use client";

import { useEffect, useState } from "react";
import {
  useEventSource,
  useEventSourceListener,
} from "@react-nano/use-event-source";

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

  const [eventSource, eventSourceStatus] = useEventSource(
    `${getServiceBaseUrl("notification")}/driver/sse`,
    true,
  );

  useEffect(() => {
    console.log("eventSource", eventSource);
    if (eventSource) {
      eventSource.addEventListener("broadcastOrder", (e) => {
        console.log("broadcastOrder", e);
      });
      eventSource.addEventListener("invalidateOrder", (e) => {
        console.log("invalidateOrder", e);
      });
      eventSource.onmessage = (e) => {
        console.log("onmessage", e);
      };
    }
    return () => {
      if (eventSource) {
        eventSource.removeEventListener("broadcastOrder", (e) => {
          console.log("broadcastOrder", e);
        });
        eventSource.removeEventListener("invalidateOrder", (e) => {
          console.log("invalidateOrder", e);
        });
        eventSource.close();
      }
    };
  }, [eventSource]);

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
