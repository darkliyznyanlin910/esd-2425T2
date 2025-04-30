"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";

import type { Order } from "@repo/db-order/zod";
import { authClient } from "@repo/auth-client";
import { getServiceBaseUrl } from "@repo/service-discovery";
import { Dialog, DialogContent, DialogTrigger } from "@repo/ui/dialog";

import CreateOrderPage from "./create-order";
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
  const [open, setOpen] = useState(false);

  const userId = session?.user.id;
  console.log(userId);

  const fetchOrders = async () => {
    if (!userId) return;
    const fetchedData = await getOrders();
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
      <Dialog open={open} onOpenChange={setOpen}>
        <div className="mb-4 flex items-center justify-between">
          <p className="text-xl font-semibold">Order Records</p>
          <DialogTrigger asChild>
            <button className="rounded-xl bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
              <div className="flex items-center gap-1">
                <Plus className="h-4 w-4" />
                <span className="text-sm">Create Order</span>
              </div>
            </button>
          </DialogTrigger>
        </div>
        <DialogContent className="max-h-[90vh] max-w-5xl overflow-auto rounded-xl bg-blue-50 px-4 py-6 sm:px-8">
          <CreateOrderPage onClose={() => setOpen(false)} />
        </DialogContent>
      </Dialog>
      <div className="rounded-lg bg-background p-4 shadow">
        <DataTable columns={columns} data={orders} onRefresh={fetchOrders} />
      </div>
    </div>
  );
}
