"use client";

import { useEffect, useState } from "react";
import { Car, CheckCircle, Package } from "lucide-react";

import { authClient } from "@repo/auth-client";
import { Order } from "@repo/db-order/zod";
import { getServiceBaseUrl } from "@repo/service-discovery";
import { Button } from "@repo/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/tabs";

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
    <div className="flex flex-1 flex-col">
      {/* Mobile Header */}
      <header className="border-b bg-muted p-4 md:hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Car className="h-6 w-6 text-primary" />
            <span className="ml-2 font-semibold">Driver Portal</span>
          </div>
        </div>
      </header>

      {/* Dashboard Content */}
      <main className="flex-1 overflow-auto p-4 md:p-6">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Driver Dashboard</h1>
          <NotificationComponent />
        </div>

        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Available Orders
              </CardTitle>
              <CardDescription>Orders you can accept</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{orders.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">To Pick Up</CardTitle>
              <CardDescription>Orders to collect</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pickupOrder.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">To Deliver</CardTitle>
              <CardDescription>Orders to drop off</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{deliveryOrder.length}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="available" className="w-full">
          <TabsList className="mb-4 grid w-full grid-cols-3">
            <TabsTrigger value="available">Available Orders</TabsTrigger>
            <TabsTrigger value="pickup">To Pick Up</TabsTrigger>
            <TabsTrigger value="dropoff">To Deliver</TabsTrigger>
          </TabsList>

          <TabsContent value="available">
            <Card>
              <CardHeader>
                <CardTitle>Available Orders</CardTitle>
                <CardDescription>
                  Orders you can accept for delivery
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Order Details</TableHead>
                        <TableHead>From Address</TableHead>
                        <TableHead>To Address</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orders.map((data) => (
                        <TableRow key={data.id}>
                          <TableCell className="font-medium">
                            {data.id}
                          </TableCell>
                          <TableCell>{data.orderDetails}</TableCell>
                          <TableCell>{`${data.fromAddressLine1}, ${data.fromAddressLine2 || ""}, ${data.fromZipCode}`}</TableCell>
                          <TableCell>{`${data.toAddressLine1}, ${data.toAddressLine2 || ""}, ${data.toZipCode}`}</TableCell>
                          <TableCell>
                            <Button
                              onClick={() => handleAcceptOrder(data.id)}
                              size="sm"
                            >
                              Accept Order
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pickup">
            <Card>
              <CardHeader>
                <CardTitle>Orders to Pick Up</CardTitle>
                <CardDescription>
                  Orders you need to collect from first location
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Order Details</TableHead>
                        <TableHead>From Address</TableHead>
                        <TableHead>To Address</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pickupOrder.map((data) => (
                        <TableRow key={data.id}>
                          <TableCell className="font-medium">
                            {data.orderDetails?.id}
                          </TableCell>
                          <TableCell>
                            {data.orderDetails?.orderDetails}
                          </TableCell>
                          <TableCell>{`${data.orderDetails?.fromAddressLine1}, ${data.orderDetails?.fromAddressLine2 || ""}, ${data.orderDetails?.fromZipCode}`}</TableCell>
                          <TableCell>{`${data.orderDetails?.toAddressLine1}, ${data.orderDetails?.toAddressLine2 || ""}, ${data.orderDetails?.toZipCode}`}</TableCell>
                          <TableCell>
                            <Button
                              onClick={() =>
                                handlePickupOrder(data.orderDetails?.id)
                              }
                              size="sm"
                            >
                              <Package className="mr-2 h-4 w-4" />
                              Picked Up
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="dropoff">
            <Card>
              <CardHeader>
                <CardTitle>Orders to Deliver</CardTitle>
                <CardDescription>
                  Orders you need to deliver to second location
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Order Details</TableHead>
                        <TableHead>From Address</TableHead>
                        <TableHead>To Address</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {deliveryOrder.map((data) => (
                        <TableRow key={data.id}>
                          <TableCell className="font-medium">
                            {data.orderDetails?.id}
                          </TableCell>
                          <TableCell>
                            {data.orderDetails?.orderDetails}
                          </TableCell>
                          <TableCell>{`${data.orderDetails?.fromAddressLine1}, ${data.orderDetails?.fromAddressLine2 || ""}, ${data.orderDetails?.fromZipCode}`}</TableCell>
                          <TableCell>{`${data.orderDetails?.toAddressLine1}, ${data.orderDetails?.toAddressLine2 || ""}, ${data.orderDetails?.toZipCode}`}</TableCell>
                          <TableCell>
                            <Button
                              onClick={() =>
                                handleDeliveryOrder(data.orderDetails?.id)
                              }
                              size="sm"
                            >
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Delivered
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
