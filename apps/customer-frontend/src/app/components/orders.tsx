"use client";

import { useEffect, useState } from "react";

import { authClient } from "@repo/auth/client";
import { Order } from "@repo/db-order/zod";
import { getServiceBaseUrl } from "@repo/service-discovery";

import { columns } from "./orders/columns";
import { DataTable } from "./orders/data-table";

async function getOrders(userId: string): Promise<Order[]> {
  try {
    const response = await fetch(
      `${getServiceBaseUrl("order")}/order/user/${userId}`,
      {
        method: "GET",
        credentials: "include",
      },
    );

    if (!response.ok) {
      throw new Error("Failed to fetch orders");
    }

    const orderList = await response.json();
    return orderList as Order[];
  } catch (error) {
    console.error("Error fetching orders:", error);
    return [];
  }
}

export default function OrderTablePage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { useSession } = authClient;
  const { data: session } = useSession();

  const userId = session?.user.id;
  console.log(userId);

  useEffect(() => {
    const fetchData = async () => {
      if (!userId) return;
      const fetchedData = await getOrders(userId);
      setOrders(fetchedData);
      setLoading(false);
    };

    fetchData();
  }, [userId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container h-screen py-6">
      <p className="mb-4 text-xl font-semibold">Order Records</p>
      <div className="rounded-lg bg-background p-4 shadow">
        <DataTable columns={columns} data={orders} />
      </div>
    </div>
  );
}
