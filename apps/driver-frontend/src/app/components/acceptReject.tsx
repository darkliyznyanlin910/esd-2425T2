import { Button } from "@repo/ui/button";
import { CheckCircle, XCircle } from "lucide-react";

interface Order {
  id: string;
  name: string;
  description?: string;
  status: "pending" | "pickup" | "delivered";
  deliveryTime?: string;
}

export function AcceptRejectOrderWrapper({
  orders,
  handleAccept,
  handleReject,
}: {
  orders: Order[];
  handleAccept: (id: string) => void;
  handleReject: (id: string) => void;
}) {
  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold">Accept or Reject Order</h2>
      <div className="mt-4">
        {orders.map((order) => (
          <div key={order.id} className="border-b p-4">
            <p>{order.description ?? order.name}</p>
            <div className="mt-4 flex gap-4">
              <Button
                onClick={() => handleAccept(order.id)}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-500"
              >
                <CheckCircle size={18} /> Accept
              </Button>
              <Button
                onClick={() => handleReject(order.id)}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-500"
              >
                <XCircle size={18} /> Reject
              </Button>
            </div>
          </div>
        ))}
        {orders.length === 0 && (
          <div className="py-8 text-center text-gray-500">
            No orders to review at this time.
          </div>
        )}
      </div>
    </div>
  );
}