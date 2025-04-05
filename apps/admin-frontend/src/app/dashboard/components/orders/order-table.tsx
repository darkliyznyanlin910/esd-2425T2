"use client";

import { useEffect, useState } from "react";
import { hc } from "hono/client";

import type { Order } from "@repo/db-order/zod";
import type { AppType } from "@repo/order/type";
import { getServiceBaseUrl } from "@repo/service-discovery";

import NotificationComponent from "../notifications/notification";
import { columns } from "./columns";
import { DataTable } from "./data-table";

async function getOrders(): Promise<Order[]> {
  try {
    const response = await hc<AppType>(getServiceBaseUrl("order")).order.$get(
      {
        query: {},
      },
      {
        init: {
          credentials: "include",
        },
      },
    );

    console.log(response);
    if (!response.ok) {
      throw new Error("Failed to fetch orders");
    }

    const orderList = await response.json();

    return orderList as unknown as Order[];
  } catch (error) {
    console.error("Error fetching orders:", error);
    return [];
  }
}

export default function OrderTablePage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const fetchedData = await getOrders();
      setOrders(fetchedData);
      setLoading(false);
    };

    void fetchData();
    const intervalId = setInterval(fetchData, 2000);
    return () => {
      clearInterval(intervalId);
    };
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container h-screen py-6">
      <NotificationComponent showComponent={false} />
      <div className="text-xl font-semibold">Order Records</div>
      <DataTable columns={columns} data={orders} />{" "}
    </div>
  );
}
