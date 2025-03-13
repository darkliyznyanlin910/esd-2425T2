import React from "react";
import { Button } from "@repo/ui/button";
import { CheckCircle, XCircle } from "lucide-react";

const AcceptRejectOrder = () => {
  const handleAccept = () => {
    console.log("Order Accepted");
  };

  const handleReject = () => {
    console.log("Order Rejected");
  };

  return (
    <div>
      <h2 className="text-xl font-semibold">Accept or Reject Order</h2>
      <div className="mt-4">
        <div className="p-4 border-b">
          <p>Order #123: Pickup from ABC Store, Deliver to XYZ Location</p>
          <div className="flex gap-4 mt-4">
            <Button onClick={handleAccept} className="flex items-center gap-2 bg-green-600 hover:bg-green-500">
              <CheckCircle size={18} /> Accept
            </Button>
            <Button onClick={handleReject} className="flex items-center gap-2 bg-red-600 hover:bg-red-500">
              <XCircle size={18} /> Reject
            </Button>
          </div>
        </div>
        <div className="p-4 border-b">
          <p>Order #234: Pickup from DEF Store, Deliver to WXY Location</p>
          <div className="flex gap-4 mt-4">
            <Button onClick={handleAccept} className="flex items-center gap-2 bg-green-600 hover:bg-green-500">
              <CheckCircle size={18} /> Accept
            </Button>
            <Button onClick={handleReject} className="flex items-center gap-2 bg-red-600 hover:bg-red-500">
              <XCircle size={18} /> Reject
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AcceptRejectOrder;
