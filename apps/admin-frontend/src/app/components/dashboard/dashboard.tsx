"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BarChart,
  BookmarkCheck,
  CircleDashed,
  ClockAlert,
} from "lucide-react";

import type { Order } from "@repo/db-order/zod";
import { authClient } from "@repo/auth-client";
import { getServiceBaseUrl } from "@repo/service-discovery";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";

async function getOrders(): Promise<Order[]> {
  try {
    const response = await fetch(`${getServiceBaseUrl("order")}/order/order`, {
      method: "GET",
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch orders");
    }

    const orderList = (await response.json()) as Order[];
    return orderList;
  } catch (error) {
    console.error("Error fetching orders:", error);
    return [];
  }
}

export default function Dashboard() {
  const { useSession } = authClient;
  const { data: session } = useSession();
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    getOrders()
      .then(setOrders)
      .catch((error) => console.error("Failed to fetch orders:", error));
  }, []);

  const { pendingOrders, processingOrders, completedOrders, delayedOrders } =
    useMemo(() => {
      const pendingOrders = orders.filter(
        (order) =>
          order.orderStatus === "PAYMENT_PENDING" ||
          order.orderStatus === "PAYMENT_FAILED",
      );
      const processingOrders = orders.filter(
        (order) =>
          order.orderStatus === "PAYMENT_SUCCESSFUL" ||
          order.orderStatus === "PROCESSING" ||
          order.orderStatus === "FINDING_DRIVER" ||
          order.orderStatus === "DRIVER_FOUND" ||
          order.orderStatus === "PICKED_UP",
      );
      const completedOrders = orders.filter(
        (order) => order.orderStatus === "DELIVERED",
      );
      const delayedOrders = orders.filter(
        (order) => order.orderStatus === "DELAYED",
      );

      return {
        pendingOrders,
        processingOrders,
        completedOrders,
        delayedOrders,
      };
    }, [orders]);

  return (
    <div className="w-full">
      <main>
        <section className="w-full bg-blue-50 py-1 md:py-6 lg:py-6">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col gap-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-3xl md:text-3xl">
                Welcome, Admin
              </h2>
              <p className="text-muted-foreground">
                Get started with your delivery process
              </p>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-4">
              <Card className="bg-white">
                <CardHeader className="pb-2">
                  <CircleDashed className="mb-2 h-5 w-5 text-blue-600" />
                  <CardTitle className="text-lg">Pending Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{pendingOrders.length}</p>
                </CardContent>
              </Card>

              <Card className="bg-white">
                <CardHeader className="pb-2">
                  <BarChart className="mb-2 h-5 w-5 text-blue-600" />
                  <CardTitle className="text-lg">Processing Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">
                    {processingOrders.length}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white">
                <CardHeader className="pb-2">
                  <BookmarkCheck className="mb-2 h-5 w-5 text-blue-600" />
                  <CardTitle className="text-lg">Completed Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{completedOrders.length}</p>
                </CardContent>
              </Card>

              <Card className="bg-white">
                <CardHeader className="pb-2">
                  <ClockAlert className="mb-2 h-5 w-5 text-blue-600" />
                  <CardTitle className="text-lg">Delayed Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{delayedOrders.length}</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
