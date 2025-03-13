import React from "react";

const PendingOrders = () => {
  return (
    <div>
      <h2 className="text-xl font-semibold">Pending Orders</h2>
      <div className="mt-4">
        {/* Pending orders list */}
        <ul>
          <li className="p-4 border-b">Order #1 - Pending</li>
          <li className="p-4 border-b">Order #2 - Pending</li>
          <li className="p-4 border-b">Order #3 - Pending</li>
        </ul>
      </div>
    </div>
  );
};

export default PendingOrders;
