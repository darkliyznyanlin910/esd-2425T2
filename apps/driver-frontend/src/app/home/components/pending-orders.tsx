import React, { useState } from "react";
import { Button } from "@repo/ui/button";
import { Archive, CheckCircle } from "lucide-react";

type OrderStatus = "pending" | "pickup" | "delivered";

interface Order {
  id: string;
  name: string;
  status: OrderStatus;
  deliveryTime?: string; // Optional delivery time field
}

const PendingOrders = () => {
  const [orders, setOrders] = useState<Order[]>([
    { id: "1", name: "Order 1", status: "pending" },
    { id: "2", name: "Order 2", status: "pending" },
    { id: "3", name: "Order 3", status: "pending" },
  ]);

  const handlePickup = (id: string) => {
    setOrders((prevOrders) =>
      prevOrders.map((order) =>
        order.id === id ? { ...order, status: "pickup" } : order
      )
    );
  };

  const handleDelivered = (id: string) => {
    const currentTimestamp = new Date().toLocaleString(); // Get the current timestamp in a readable format
    setOrders((prevOrders) =>
      prevOrders.map((order) =>
        order.id === id
          ? { ...order, status: "delivered", deliveryTime: currentTimestamp }
          : order
      )
    );
  };

  return (
    <div>
      <h2 className="text-xl font-semibold">Pending Orders</h2>
      <div className="mt-4">
        {orders.map((order) => (
          <div key={order.id} className="p-4 border-b">
            <p>{order.name}</p>
            {order.status !== "delivered" ? (
              <div className="flex gap-4 mt-4">
                <Button
                  onClick={() => handlePickup(order.id)}
                  className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400"
                  disabled={order.status === "delivered"} 
                >
                  <Archive size={18} /> Pickup
                </Button>
                <Button
                  onClick={() => handleDelivered(order.id)}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-500"
                  disabled={order.status !== "pickup"} 
                >
                  <CheckCircle size={18} /> Delivered
                </Button>
              </div>
            ) : (
              <div className="mt-4 text-green-600">
                <p className="font-semibold">Delivery Completed for {order.name}</p>
                <p className="text-sm text-gray-600">Delivered at: {order.deliveryTime}</p> {/* Display timestamp */}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PendingOrders;
