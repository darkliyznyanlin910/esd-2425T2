"use client";

import { useCallback, useEffect, useState } from "react";
import { hc } from "hono/client";
import { RefreshCw } from "lucide-react";

import type { Order } from "@repo/db-order/zod";
import type { AppType } from "@repo/order/type";
import { getServiceBaseUrl } from "@repo/service-discovery";
import { Button } from "@repo/ui/button";

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
      <div className="mb-4 flex items-center justify-between">
        <div className="text-xl font-semibold">Order Records</div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={refreshing}
        >
          <RefreshCw
            className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>
      <DataTable columns={columns} data={orders} />
    </div>
  );
}
