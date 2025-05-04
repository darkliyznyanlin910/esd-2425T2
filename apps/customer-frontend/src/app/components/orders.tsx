"use client";

import { useEffect, useState } from "react";

import type { Order } from "@repo/db-order/zod";
import { authClient } from "@repo/auth-client";
import { getServiceBaseUrl } from "@repo/service-discovery";

import { columns } from "./orders/columns";
import { DataTable } from "./orders/data-table";

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

export default function OrderTablePage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { useSession } = authClient;
  const { data: session } = useSession();

  const userId = session?.user.id;
  console.log(userId);

  const fetchOrders = async () => {
    if (!userId) return;
    const fetchedData = await getOrders();
    setOrders(fetchedData);

    // const mockData: Order[] = [
    //   {
    //     id: "1",
    //     userId: "mock-user-id",
    //     displayId: "#1001",
    //     orderStatus: "FINDING_DRIVER",
    //     orderDetails: "Test Order 1",
    //     fromAddressLine1: "123 Mock St",
    //     fromAddressLine2: "Unit 1",
    //     fromZipCode: "111111",
    //     toAddressLine1: "456 Destination Ave",
    //     toAddressLine2: "Unit 2",
    //     toZipCode: "222222",
    //     createdAt: new Date(),
    //     updatedAt: new Date(),
    //   },

    //   {
    //     id: "2",
    //     userId: "mock-user-id",
    //     displayId: "#1002",
    //     orderStatus: "DELAYED",
    //     orderDetails: "Fragile Electronics Package",
    //     fromAddressLine1: "222 Sender Street",
    //     fromAddressLine2: "Floor 3",
    //     fromZipCode: "555555",
    //     toAddressLine1: "333 Receiver Road",
    //     toAddressLine2: "",
    //     toZipCode: "666666",
    //     createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
    //     updatedAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    //   },
    // ];
    setOrders(fetchedData);
  };

  useEffect(() => {
    void fetchOrders();
  }, [userId]);

  useEffect(() => {
    setLoading(false);
  }, [orders]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container h-screen py-6">
      <div className="mb-7 flex-none">
        <h2 className="pb-2 text-3xl font-bold tracking-tighter sm:text-3xl md:text-3xl">
          Order History
        </h2>
        <p className="text-muted-foreground">
          View and manage your orders here. You can track the status of your
          orders and get updates on their delivery.
        </p>
      </div>

      <div className="rounded-lg bg-background p-4 shadow">
        <DataTable columns={columns} data={orders} onRefresh={fetchOrders} />
      </div>
    </div>
  );
}
