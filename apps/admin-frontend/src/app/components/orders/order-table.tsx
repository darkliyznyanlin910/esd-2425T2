"use client";

import { useCallback, useEffect, useState } from "react";
import { hc } from "hono/client";

import type { Order } from "@repo/db-order/zod";
import type { AppType } from "@repo/order/type";
import { getServiceBaseUrl } from "@repo/service-discovery";

import NotificationComponent from "../notifications/notification";
import { columns } from "./columns";
import { DataTable } from "./data-table";

async function getOrders(): Promise<Order[]> {
  try {
    const response = await hc<AppType>(
      getServiceBaseUrl("order"),
    ).order.order.$get(
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
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const fetchedData = await getOrders();
      setOrders(fetchedData);
    } catch (error) {
      console.error("Error refreshing orders:", error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const fetchedData = await getOrders();
      setOrders(fetchedData);
      setLoading(false);
    };

    void fetchData();
  }, []);

  if (loading || refreshing) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container h-screen py-6">
      <NotificationComponent showComponent={false} />
      <div className="mb-4 text-xl font-semibold">Order Records</div>
      <div className="rounded-lg bg-background p-4 shadow">
        <DataTable columns={columns} data={orders} onRefresh={handleRefresh} />
      </div>
    </div>
  );
}
