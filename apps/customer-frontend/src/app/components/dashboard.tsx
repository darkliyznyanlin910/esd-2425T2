"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BarChart,
  BookmarkCheck,
  CircleDashed,
  Clock,
  ClockAlert,
} from "lucide-react";

import type { Order } from "@repo/db-order/zod";
import { authClient } from "@repo/auth-client";
import { getServiceBaseUrl } from "@repo/service-discovery";
import { Button } from "@repo/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@repo/ui/card";

import { DeliveryForm } from "./delivery-form";

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
  const [selectedDeliveryType, setSelectedDeliveryType] = useState<
    string | null
  >(null);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    getOrders()
      .then(setOrders)
      .catch((error) => console.error('Failed to fetch orders:', error));
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

  const handleSelectDelivery = (type: string) => {
    setSelectedDeliveryType(type);

    setTimeout(() => {
      const formElement = document.getElementById("delivery-form");
      if (formElement) {
        formElement.scrollIntoView({ behavior: "smooth" });
      }
    }, 100);
  };

  return (
    <div className="min-h-screen w-full">
      <main>
        <section className="w-full bg-blue-50 py-1 md:py-6 lg:py-6">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col gap-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Welcome, {session?.user.name}
              </h1>
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

        <section className="w-full py-5 md:py-5 lg:py-5">
          <div className="w-full px-4 md:px-6">
            {/* <div className="mb-8 flex flex-col items-center gap-2 text-center">
              <h2 className="text-3xl font-bold tracking-tighter">
                Start Your Delivery
              </h2>
              <p className="max-w-[700px] text-muted-foreground">

              </p>
            </div> */}

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-1 lg:grid-cols-1">
              <Card className="relative overflow-hidden border-2 transition-all hover:border-blue-600">
                <CardHeader>
                  <Clock className="mb-2 h-10 w-10 text-blue-600" />
                  <CardTitle>Local Delivery</CardTitle>
                  <CardDescription>
                    Get your package delivered within your city
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="mb-4 space-y-2 text-sm">
                    <li className="flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="mr-2 h-4 w-4 text-blue-600"
                      >
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                      Delivery within 3-6 hours
                    </li>
                    <li className="flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="mr-2 h-4 w-4 text-blue-600"
                      >
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                      Real-time tracking
                    </li>
                    <li className="flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="mr-2 h-4 w-4 text-blue-600"
                      >
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                      Local area only
                    </li>
                  </ul>
                  <div className="flex items-center justify-between">
                    <p className="text-lg font-bold">$50.00</p>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    onClick={() => handleSelectDelivery("local")}
                  >
                    Place an order
                  </Button>
                </CardFooter>
              </Card>
            </div>

            {selectedDeliveryType && (
              <div id="delivery-form" className="mt-5">
                <Card className="relative overflow-hidden border-2 transition-all">
                  <CardContent className="p-6">
                    <DeliveryForm />
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
