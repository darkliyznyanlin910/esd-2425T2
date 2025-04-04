"use client";

import { useEffect, useState } from "react";

import { authClient } from "@repo/auth-client";
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

import NotificationComponent from "./notification";

export default function DriverDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [pickupOrder, setPickupOrder] = useState<any[]>([]);
  const [deliveryOrder, setDeliveryOrder] = useState<any[]>([]);
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

  const handlePickupOrder = async (orderId: string) => {
    try {
      const response = await fetch(
        `${getServiceBaseUrl("driver")}/driver/state/PICKED_UP`,
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
      console.log("Order picked up:", response);
    } catch (error) {
      console.error("Failed to pick up order:", error);
    }
  };

  const handleDeliveryOrder = async (orderId: string) => {
    try {
      const response = await fetch(
        `${getServiceBaseUrl("driver")}/driver/state/DELIVERED`,
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
      console.log("Order delivered:", response);
    } catch (error) {
      console.error("Failed to deliver order:", error);
    }
  };

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch(
          `${getServiceBaseUrl("order")}/order/finding/initialOrders`,
          {
            method: "GET",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          },
        );
        if (response.ok) {
          const data = await response.json();
          setOrders(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error("Failed to fetch orders:", error);
      }
    };

    const fetchPickupOrder = async () => {
      if (!session?.user.id) return;

      try {
        const url = new URL(
          `${getServiceBaseUrl("driver")}/driver/assignments/${session.user.id}`,
        );
        url.searchParams.append("status", "DRIVER_FOUND");
        const response = await fetch(url, {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();
          setPickupOrder(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error("Failed to fetch pickup orders:", error);
      }
    };

    const fetchDeliveryOrder = async () => {
      if (!session?.user.id) return;

      try {
        const url = new URL(
          `${getServiceBaseUrl("driver")}/driver/assignments/${session.user.id}`,
        );
        url.searchParams.append("status", "PICKED_UP");
        const response = await fetch(url, {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();
          console.log("Delivery order data:", data);
          setDeliveryOrder(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error("Failed to fetch delivery orders:", error);
      }
    };

    fetchOrders();
    fetchPickupOrder();
    fetchDeliveryOrder();

    const intervalId = setInterval(fetchOrders, 2000);
    const intervalId2 = setInterval(fetchPickupOrder, 2000);
    const intervalId3 = setInterval(fetchDeliveryOrder, 2000);

    return () => {
      clearInterval(intervalId);
      clearInterval(intervalId2);
      clearInterval(intervalId3);
    };
  }, [session]);

  return (
    <div className="flex flex-col items-center">
      <NotificationComponent />
      <h1 className="mb-5 text-2xl font-bold">Driver Dashboard</h1>

      {/* Available Orders Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead
              className="text-center text-xl text-amber-400"
              colSpan={5}
            >
              Available Orders
            </TableHead>
          </TableRow>
          <TableRow>
            <TableHead>Order ID</TableHead>
            <TableHead>Order Details</TableHead>
            <TableHead>From Address</TableHead>
            <TableHead>To Address</TableHead>
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
                <TableCell>{data.orderDetails}</TableCell>
                <TableCell>
                  {data.fromAddressLine1}
                  {data.fromAddressLine2 ? `, ${data.fromAddressLine2}` : ""}
                  {data.fromZipCode ? `, ${data.fromZipCode}` : ""}
                </TableCell>
                <TableCell>
                  {data.toAddressLine1}
                  {data.toAddressLine2 ? `, ${data.toAddressLine2}` : ""}
                  {data.toZipCode ? `, ${data.toZipCode}` : ""}
                </TableCell>
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

      {/* Orders to Pick Up Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead
              className="text-center text-xl text-amber-500"
              colSpan={5}
            >
              Orders to Pick Up
            </TableHead>
          </TableRow>
          <TableRow>
            <TableHead>Order ID</TableHead>
            <TableHead>Order Details</TableHead>
            <TableHead>From Address</TableHead>
            <TableHead>To Address</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pickupOrder.length === 0 ? (
            <TableRow>
              <TableCell className="text-center text-lg" colSpan={5}>
                No new orders yet.
              </TableCell>
            </TableRow>
          ) : (
            pickupOrder.map((data) => (
              <TableRow key={data.id}>
                <TableCell>{data.orderDetails?.id}</TableCell>
                <TableCell>{data.orderDetails?.orderDetails}</TableCell>
                <TableCell>
                  {data.orderDetails?.fromAddressLine1}
                  {data.orderDetails?.fromAddressLine2
                    ? `, ${data.orderDetails.fromAddressLine2}`
                    : ""}
                  {data.orderDetails?.fromZipCode
                    ? `, ${data.orderDetails.fromZipCode}`
                    : ""}
                </TableCell>
                <TableCell>
                  {data.orderDetails?.toAddressLine1}
                  {data.orderDetails?.toAddressLine2
                    ? `, ${data.orderDetails.toAddressLine2}`
                    : ""}
                  {data.orderDetails?.toZipCode
                    ? `, ${data.orderDetails.toZipCode}`
                    : ""}
                </TableCell>
                <TableCell>
                  <Button
                    onClick={() => handlePickupOrder(data.orderDetails?.id)}
                  >
                    Picked Up
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Orders to Deliver Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead
              className="text-center text-xl text-amber-600"
              colSpan={5}
            >
              Orders to Deliver
            </TableHead>
          </TableRow>
          <TableRow>
            <TableHead>Order ID</TableHead>
            <TableHead>Order Details</TableHead>
            <TableHead>From Address</TableHead>
            <TableHead>To Address</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {!Array.isArray(deliveryOrder) || deliveryOrder.length === 0 ? (
            <TableRow>
              <TableCell className="text-center text-lg" colSpan={5}>
                No new orders yet.
              </TableCell>
            </TableRow>
          ) : (
            deliveryOrder.map((data) => (
              <TableRow key={data.id}>
                <TableCell>{data.orderDetails?.id}</TableCell>
                <TableCell>{data.orderDetails?.orderDetails}</TableCell>
                <TableCell>
                  {data.orderDetails?.fromAddressLine1}
                  {data.orderDetails?.fromAddressLine2
                    ? `, ${data.orderDetails.fromAddressLine2}`
                    : ""}
                  {data.orderDetails?.fromZipCode
                    ? `, ${data.orderDetails.fromZipCode}`
                    : ""}
                </TableCell>
                <TableCell>
                  {data.orderDetails?.toAddressLine1}
                  {data.orderDetails?.toAddressLine2
                    ? `, ${data.orderDetails.toAddressLine2}`
                    : ""}
                  {data.orderDetails?.toZipCode
                    ? `, ${data.orderDetails.toZipCode}`
                    : ""}
                </TableCell>
                <TableCell>
                  <Button
                    onClick={() => handleDeliveryOrder(data.orderDetails?.id)}
                  >
                    Delivered
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
