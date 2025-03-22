"use client";

import { useEffect, useState } from "react";
import { hc } from "hono/client";

import { Order } from "@repo/db-order/zod";
import { AppType } from "@repo/order/type";
import { getServiceBaseUrl } from "@repo/service-discovery";

import { useOrders } from "./assign-context";
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

    // const orderList = (await response.json()).map((order: any) => ({
    //   ...order,
    //   createdAt: new Date(order.createdAt),
    //   updatedAt: new Date(order.updatedAt),
    // })) as Order[];

    const orderList = await response.json();
    const orderToAssign = orderList.filter(
      (order: any) => order.orderStatus === "FINDING_DRIVER",
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

  useEffect(() => {
    const fetchData = async () => {
      const fetchedData = await getOrders();
      setOrders(fetchedData);
      setLoading(false);
    };

    fetchData();
  }, [setOrders]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto h-screen py-6">
      <div className="text-xl font-semibold">To Assign</div>
      <DataTable columns={columns} data={orders} />{" "}
    </div>
  );
}
