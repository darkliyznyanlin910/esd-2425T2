"use client";

import { useCallback, useEffect, useState } from "react";
import { hc } from "hono/client";

import { Order } from "@repo/db-order/zod";
import { AppType } from "@repo/order/type";
import { getServiceBaseUrl } from "@repo/service-discovery";

import NotificationComponent from "../notifications/notification";
import { useOrders } from "./assign-context";
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

    // const orderList = (await response.json()).map((order: any) => ({
    //   ...order,
    //   createdAt: new Date(order.createdAt),
    //   updatedAt: new Date(order.updatedAt),
    // })) as Order[];

    const orderList = await response.json();
    const orderToAssign = orderList.filter(
      (order: any) => order.orderStatus === "DELAYED",
    );

    return orderToAssign as unknown as Order[];
  } catch (error) {
    console.error("Error fetching orders:", error);
    return [];
  }
}

export default function AssignTablePage() {
  const { orders, setOrders } = useOrders();
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

  const fetchData = useCallback(async () => {
    setLoading(true);
    const fetchedData = await getOrders();
    setOrders(fetchedData);
    setLoading(false);
  }, [setOrders]);

  const handleNotification = useCallback(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto h-screen py-6">
      <NotificationComponent
        showComponent={false}
        onNotification={handleNotification}
      />
      <div className="mb-4 text-xl font-semibold">To Assign</div>
      <div className="rounded-lg bg-background p-4 shadow">
        <DataTable
          columns={columns}
          data={orders}
          onRefresh={handleRefresh}
        />{" "}
      </div>
    </div>
  );
}
