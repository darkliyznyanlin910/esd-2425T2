import { Button } from "@repo/ui/button";
import { Archive, CheckCircle } from "lucide-react";

interface Order {
  id: string;
  name: string;
  description?: string;
  status: "pending" | "pickup" | "delivered";
  deliveryTime?: string;
}

export function PendingOrdersWrapper({
  orders,
  handlePickup,
  handleDelivered,
}: {
  orders: Order[];
  handlePickup: (id: string) => void;
  handleDelivered: (id: string) => void;
}) {
  return (
    <div className="p-6">
      <h2 className="mb-4 text-xl font-semibold">Pending Orders</h2>

      {orders.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-3 text-left font-medium text-gray-700">
                  Order ID
                </th>
                <th className="border p-3 text-left font-medium text-gray-700">
                  Description
                </th>
                <th className="border p-3 text-left font-medium text-gray-700">
                  Status
                </th>
                <th className="border p-3 text-left font-medium text-gray-700">
                  Delivery Time
                </th>
                <th className="border p-3 text-left font-medium text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-b hover:bg-gray-50">
                  <td className="border p-3">{order.name}</td>
                  <td className="border p-3 text-sm text-gray-600">
                    {order.description ?? "No description provided"}
                  </td>
                  <td className="border p-3">
                    <span
                      className={`inline-block rounded px-2 py-1 text-xs font-medium ${
                        order.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : order.status === "pickup"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-green-100 text-green-800"
                      }`}
                    >
                      {order.status.charAt(0).toUpperCase() +
                        order.status.slice(1)}
                    </span>
                  </td>
                  <td className="border p-3 text-sm">
                    {order.deliveryTime ?? "Not delivered yet"}
                  </td>
                  <td className="border p-3">
                    {order.status !== "delivered" ? (
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handlePickup(order.id)}
                          className="flex h-auto items-center gap-1 bg-yellow-500 px-2 py-1 text-xs hover:bg-yellow-400"
                          disabled={order.status === "pickup"}
                        >
                          <Archive size={14} /> Pickup
                        </Button>
                        <Button
                          onClick={() => handleDelivered(order.id)}
                          className="flex h-auto items-center gap-1 bg-green-600 px-2 py-1 text-xs hover:bg-green-500"
                          disabled={order.status !== "pickup"}
                        >
                          <CheckCircle size={14} /> Delivered
                        </Button>
                      </div>
                    ) : (
                      <span className="text-sm font-medium text-green-600">
                        Completed
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="rounded-md border bg-gray-50 py-8 text-center text-gray-500">
          <p className="text-lg">No pending orders available.</p>
          <p className="text-sm">
            New orders will appear here when assigned to you.
          </p>
        </div>
      )}
    </div>
  );
}